import * as oauth from "oauth4webapi"
import { parseCookies } from "payload"
import type {
  OIDCProviderConfig,
  AccountInfo,
  OAuthCallbackParams,
  ParsedOAuthState,
  OAuthAccountData,
} from "@/types"
import {
  InternalServerError,
  MissingEmailAPIError,
  UnVerifiedAccountAPIError,
} from "@/errors/apiErrors"
import { MissingOrInvalidSession } from "@/errors/consoleErrors"
import { getCallbackURL } from "@/utils/cb"
import { OAuthAuthentication } from "./oauth_authentication"
import { createOAuthState } from "@/core/routeHandlers/oauth"

export async function OIDCCallback(
  params: OAuthCallbackParams,
  parsedState: ParsedOAuthState | null,
): Promise<Response> {
  const {
    pluginType,
    request,
    provider,
    collections,
    allowOAuthAutoSignUp,
    useAdmin,
    secret,
    successRedirectPath,
    errorRedirectPath,
  } = params

  const providerConfig = provider as OIDCProviderConfig
  const parsedCookies = parseCookies(request.headers)

  const code_verifier =
    parsedState?.codeVerifier || parsedCookies.get("__session-code-verifier")
  const nonce = parsedState?.nonce || parsedCookies.get("__session-oauth-nonce")

  if (!code_verifier) {
    throw new MissingOrInvalidSession()
  }

  const { client_id, client_secret, issuer, algorithm, profile } =
    providerConfig

  const client: oauth.Client = {
    client_id,
  }

  const clientAuth = oauth.ClientSecretPost(client_secret ?? "")

  const current_url = new URL(request.url as string) as URL
  const callback_url = getCallbackURL(
    request.payload.config.serverURL,
    pluginType,
    providerConfig.id,
  )
  const issuer_url = new URL(issuer) as URL

  const as = await oauth
    .discoveryRequest(issuer_url, { algorithm })
    .then((response) => oauth.processDiscoveryResponse(issuer_url, response))

  // Use parsed state for validation if available
  const stateParam = parsedState
    ? createOAuthState(parsedState)
    : providerConfig?.params?.state || undefined

  const params_oauth = oauth.validateAuthResponse(
    as,
    client,
    current_url,
    stateParam,
  )

  const grantResponse = await oauth.authorizationCodeGrantRequest(
    as,
    client,
    clientAuth,
    params_oauth,
    callback_url.toString(),
    code_verifier,
  )

  const body = (await grantResponse.json()) as { scope: string | string[] }
  let response = new Response(JSON.stringify(body), grantResponse)

  if (Array.isArray(body.scope)) {
    body.scope = body.scope.join(" ")
    response = new Response(JSON.stringify(body), grantResponse)
  }

  const token_result = await oauth.processAuthorizationCodeResponse(
    as,
    client,
    response,
    {
      expectedNonce: nonce as string,
      requireIdToken: true,
    },
  )

  const claims = oauth.getValidatedIdTokenClaims(token_result)
  if (!claims?.sub) {
    return new InternalServerError()
  }

  const userInfoResponse = await oauth.userInfoRequest(
    as,
    client,
    token_result.access_token,
  )

  const result = await oauth.processUserInfoResponse(
    as,
    client,
    claims?.sub,
    userInfoResponse,
  )

  if (!result.email) {
    return new MissingEmailAPIError()
  }

  // Remove skip_email_verification check since it's not in your types
  // Only check email_verified if it exists in the result
  if (result.email_verified === false) {
    return new UnVerifiedAccountAPIError()
  }

  // Use the provider's profile callback if available, otherwise use direct mapping
  let accountInfo: AccountInfo
  if (profile) {
    const filteredResult = Object.fromEntries(
      Object.entries(result).filter(([_, v]) => v !== undefined),
    ) as Record<string, string | number | boolean | object>
    accountInfo = profile(filteredResult)
  } else {
    accountInfo = {
      sub: result.sub,
      name: result.name ?? "",
      email: result.email,
      picture: result.picture ?? "",
    }
  }

  const userData: OAuthAccountData = {
    ...accountInfo,
    scope: providerConfig.scope,
    issuer: providerConfig.issuer,
    access_token: token_result.access_token,
  }

  return await OAuthAuthentication(
    pluginType,
    collections,
    allowOAuthAutoSignUp,
    useAdmin,
    secret,
    request,
    successRedirectPath,
    errorRedirectPath,
    userData,
  )
}
