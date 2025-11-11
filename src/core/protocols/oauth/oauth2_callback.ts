import * as oauth from "oauth4webapi"
import { parseCookies, type PayloadRequest } from "payload"
import type { OAuth2ProviderConfig } from "../../../types.js"
import { MissingOrInvalidSession } from "../../errors/consoleErrors.js"
import { getCallbackURL } from "../../utils/cb.js"
import { OAuthAuthentication } from "./oauth_authentication.js"

export async function OAuth2Callback(
  pluginType: string,
  request: PayloadRequest,
  providerConfig: OAuth2ProviderConfig,
  collections: {
    usersCollection: string
    accountsCollection: string
  },
  allowOAuthAutoSignUp: boolean,
  useAdmin: boolean,
  secret: string,
  successRedirectPath: string,
  errorRedirectPath: string,
): Promise<Response> {
  const parsedCookies = parseCookies(request.headers)

  const code_verifier = parsedCookies.get("__session-code-verifier")
  const state = parsedCookies.get("__session-oauth-state")

  if (!code_verifier) {
    throw new MissingOrInvalidSession()
  }

  const { client_id, client_secret, authorization_server, client_auth_type } =
    providerConfig

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

  const params = oauth.validateAuthResponse(as, client, current_url, state)

  const grantResponse = await oauth.authorizationCodeGrantRequest(
    as,
    client,
    clientAuth,
    params,
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

  const userData = {
    email: userInfo.email,
    name: userInfo.name ?? "",
    sub: userInfo.sub ?? userInfo.id,
    scope: providerConfig.scope,
    issuer: providerConfig.authorization_server.issuer,
    picture: userInfo.picture ?? "",
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
