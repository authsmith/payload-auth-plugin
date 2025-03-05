import { parseCookies, type PayloadRequest } from "payload"
import * as oauth from "oauth4webapi"
import type { OAuth2ProviderConfig, AccountInfo } from "../../../types.js"
import { getCallbackURL } from "../../utils/cb.js"
import { MissingOrInvalidSession } from "../../errors/consoleErrors.js"

export async function OAuth2Callback(
  request: PayloadRequest,
  providerConfig: OAuth2ProviderConfig,
  session_callback: (oauthAccountInfo: AccountInfo) => Promise<Response>,
): Promise<Response> {
  const parsedCookies = parseCookies(request.headers)

  const code_verifier = parsedCookies.get("__session-code-verifier")
  const state = parsedCookies.get("__session-oauth-state")

  if (!code_verifier) {
    throw new MissingOrInvalidSession()
  }

  const { client_id, client_secret, authorization_server, profile, client_auth_type } =
    providerConfig

  const client: oauth.Client = {
    client_id,
  }

  const clientAuth = client_auth_type === "client_secret_basic" ? oauth.ClientSecretBasic(client_secret ?? "") : oauth.ClientSecretPost(client_secret ?? "");

  const current_url = new URL(request.url as string) as URL
  const callback_url = getCallbackURL(
    request.payload.config.serverURL,
    "admin",
    providerConfig.id,
  )
  const as = authorization_server

  const params = oauth.validateAuthResponse(as, client, current_url, state!)

  const response = await oauth.authorizationCodeGrantRequest(
    as,
    client,
    clientAuth,
    params,
    callback_url.toString(),
    code_verifier,
  )

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
  return session_callback(profile(userInfo))
}
