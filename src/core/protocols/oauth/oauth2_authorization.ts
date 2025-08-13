import * as oauth from "oauth4webapi"
import type { PayloadRequest } from "payload"
import type { OAuth2ProviderConfig } from "../../../types.js"
import { getCallbackURL } from "../../utils/cb.js"

export async function OAuth2Authorization(
  pluginType: string,
  request: PayloadRequest,
  providerConfig: OAuth2ProviderConfig,
  clientOrigin?: string | undefined,
  additionalScope?: string,
): Promise<Response> {
  const callback_url = getCallbackURL(
    request.payload.config.serverURL,
    pluginType,
    providerConfig.id,
  )
  const code_verifier = oauth.generateRandomCodeVerifier()
  const code_challenge = await oauth.calculatePKCECodeChallenge(code_verifier)
  const code_challenge_method = "S256"
  const { authorization_server, client_id, scope, params } = providerConfig

  const client: oauth.Client = {
    client_id,
  }

  const as = authorization_server

  const cookies: string[] = []
  const cookieMaxage = new Date(Date.now() + 300 * 1000)

  const authorizationURL = new URL(as.authorization_endpoint as string)
  authorizationURL.searchParams.set("client_id", client.client_id)
  authorizationURL.searchParams.set("redirect_uri", callback_url.toString())
  authorizationURL.searchParams.set("response_type", "code")
  if (additionalScope) {
    const totalScope = `${scope} ${additionalScope}`
    authorizationURL.searchParams.set("scope", totalScope)
  } else {
    authorizationURL.searchParams.set("scope", scope as string)
  }
  authorizationURL.searchParams.set("code_challenge", code_challenge)
  authorizationURL.searchParams.set(
    "code_challenge_method",
    code_challenge_method,
  )

  if (params) {
    Object.entries(params).map(([key, value]) => {
      authorizationURL.searchParams.set(key, value)
    })
  }

  if (as.code_challenge_methods_supported?.includes("S256") !== true) {
    const state = oauth.generateRandomState()
    authorizationURL.searchParams.set("state", state)
    cookies.push(
      `__session-oauth-state=${state};Path=/;HttpOnly;SameSite=lax;Expires=${cookieMaxage.toUTCString()}`,
    )
  }
  cookies.push(
    `__session-code-verifier=${code_verifier};Path=/;HttpOnly;SameSite=lax;Expires=${cookieMaxage.toUTCString()}`,
  )
  if (clientOrigin && clientOrigin !== undefined) {
    cookies.push(
      `__session-client-origin=${clientOrigin};Path=/;HttpOnly;SameSite=lax;Expires=${cookieMaxage.toUTCString()}`,
    )
  }

  const res = new Response(null, {
    status: 302,
    headers: {
      Location: authorizationURL.href,
    },
  })

  for (const c of cookies) {
    res.headers.append("Set-Cookie", c)
  }
  return res
}
