import jwt from "jsonwebtoken"
import { getCookieExpiration } from "payload"
import { APP_COOKIE_SUFFIX } from "../../constants.js"

export function createAppSessionCookies(
  name: string,
  secret: string,
  fieldsToSign: Record<string, unknown>,
) {
  const cookieExpiration = getCookieExpiration({
    seconds: 7200,
  })

  const token = jwt.sign(fieldsToSign, secret, {
    expiresIn: new Date(cookieExpiration).getTime(),
  })
  const cookies: string[] = []
  cookies.push(
    `${name}-${APP_COOKIE_SUFFIX}=${token};Path=/;HttpOnly;SameSite=lax;Expires=${cookieExpiration.toUTCString()}`,
  )
  return cookies
}

export function invalidateOAuthCookies(cookies: string[]) {
  const expired = "Thu, 01 Jan 1970 00:00:00 GMT"
  cookies.push(
    `__session-oauth-state=; Path=/; HttpOnly; SameSite=Lax; Expires=${expired}`,
  )
  cookies.push(
    `__session-oauth-nonce=; Path=/; HttpOnly; SameSite=Lax; Expires=${expired}`,
  )
  cookies.push(
    `__session-code-verifier=; Path=/; HttpOnly; SameSite=Lax; Expires=${expired}`,
  )
  cookies.push(
    `__session-webpk-challenge=; Path=/; HttpOnly; SameSite=Lax; Expires=${expired}`,
  )
  return cookies
}
