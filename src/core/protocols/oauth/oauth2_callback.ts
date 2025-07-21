import * as oauth from "oauth4webapi"
import { parseCookies } from "payload"
import { OAuthAuthentication } from "./oauth_authentication"
import { MissingOrInvalidSession } from "@/core/errors/consoleErrors"
import { createOAuthState } from "@/core/routeHandlers/oauth"
import { getCallbackURL } from "@/core/utils/cb"
import {
  OAuthCallbackParams,
  ParsedOAuthState,
  OAuth2ProviderConfig,
  AccountInfo,
  OAuthAccountData,
} from "@/types"

export async function OAuth2Callback(
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

  const providerConfig = provider as OAuth2ProviderConfig
  const parsedCookies = parseCookies(request.headers)

  const code_verifier =
    parsedState?.codeVerifier || parsedCookies.get("__session-code-verifier")
  const state = parsedState
    ? createOAuthState(parsedState)
    : parsedCookies.get("__session-oauth-state")

  if (!code_verifier) {
    throw new MissingOrInvalidSession()
  }

  const {
    client_id,
    client_secret,
    authorization_server,
    client_auth_type,
    profile,
  } = providerConfig

  const client: oauth.Client = {
    client_id,
  }

  const clientAuth =
    client_auth_type === "client_secret_basic"
      ? oauth.ClientSecretBasic(client_secret ?? "")
      : oauth.ClientSecretPost(client_secret ?? "")

  const current_url = new URL(request.url as string) as URL
  const callback_url = getCallbackURL(
    request.payload.config.serverURL,
    pluginType,
    providerConfig.id,
  )
  const as = authorization_server

  const params_oauth = oauth.validateAuthResponse(
    as,
    client,
    current_url,
    state,
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
  )

  const userInfoResponse = await oauth.userInfoRequest(
    as,
    client,
    token_result.access_token,
  )
  const userInfo = (await userInfoResponse.json()) as Record<string, string>

  // Use the provider's profile callback if available
  let accountInfo: AccountInfo
  if (profile) {
    accountInfo = profile(userInfo)
  } else {
    accountInfo = {
      sub: userInfo.sub ?? "",
      name: userInfo.name ?? "",
      email: userInfo.email ?? "",
      picture: userInfo.picture ?? "",
    }
  }

  const userData: OAuthAccountData = {
    ...accountInfo,
    scope: providerConfig.scope,
    issuer: providerConfig.authorization_server.issuer,
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
