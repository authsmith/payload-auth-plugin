import { parseCookies, type PayloadRequest } from "payload"
import * as oauth from "oauth4webapi"
import type { AccountInfo, OIDCProviderConfig } from "../../../types.js"
import { getCallbackURL } from "../../utils/cb.js"
import { MissingOrInvalidSession } from "../../errors/consoleErrors.js"

export async function OIDCCallback(
  pluginType: string,
  request: PayloadRequest,
  providerConfig: OIDCProviderConfig,
  session_callback: (oauthAccountInfo: AccountInfo) => Promise<Response>,
): Promise<Response> {
  const parsedCookies = parseCookies(request.headers)

  const code_verifier = parsedCookies.get("__session-code-verifier")
  const nonce = parsedCookies.get("__session-oauth-nonce")

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

  const params = oauth.validateAuthResponse(as, client, current_url)

  const grantResponse = await oauth.authorizationCodeGrantRequest(
    as,
    client,
    clientAuth,
    params,
    callback_url.toString(),
    code_verifier,
  )

  let body = (await grantResponse.json()) as { scope: string | string[] }
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

  const claims = oauth.getValidatedIdTokenClaims(token_result)!
  const userInfoResponse = await oauth.userInfoRequest(
    as,
    client,
    token_result.access_token,
  )

  const result = await oauth.processUserInfoResponse(
    as,
    client,
    claims.sub,
    userInfoResponse,
  )

  return session_callback(
    profile({
      sub: result.sub,
      name: result.name as string,
      email: result.email as string,
      picture: result.picture as string,
    }),
  )
}
