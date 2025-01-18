import { parseCookies, type PayloadRequest } from "payload"
import * as oauth from "oauth4webapi"
import type { OAuth2ProviderConfig, AccountInfo } from "../../../types"
import { getCallbackURL } from "../../utils/cb"
import { MissingOrInvalidSession } from "../../errors/consoleErrors"

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

  const client: oauth.Client = {
    client_id: providerConfig.client_id,
  }
  const clientAuth = oauth.ClientSecretPost(providerConfig.client_secret)

  const current_url = new URL(request.url as string)
  const callback_url = getCallbackURL(
    request.payload.config.serverURL,
    "admin",
    providerConfig.id,
  )
  const as = providerConfig.authorization_server

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
  const userInfo = await userInfoResponse.json()
  return session_callback(providerConfig.profile(userInfo))
}
