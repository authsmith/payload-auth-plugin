import * as jwt from "jose";
import { getCookieExpiration } from "payload";
export async function createSessionCookies(name, secret, fieldsToSign, expiration) {
    const tokenExpiration = expiration ??
        getCookieExpiration({
            seconds: 7200,
        }).getTime();
    const secretKey = new TextEncoder().encode(secret);
    const issuedAt = Math.floor(Date.now() / 1000);
    const exp = issuedAt + tokenExpiration;
    const token = await new jwt.SignJWT(fieldsToSign)
        .setProtectedHeader({ alg: "HS256", typ: "JWT" })
        .setIssuedAt(issuedAt)
        .setExpirationTime(exp)
        .sign(secretKey);
    const cookies = [];
    cookies.push(`${name}=${token};Path=/;HttpOnly;SameSite=lax;Expires=${getCookieExpiration({ seconds: expiration }).toUTCString()}`);
    return cookies;
}
export async function verifySessionCookie(token, secret) {
    const secretKey = new TextEncoder().encode(secret);
    return await jwt.jwtVerify(token, secretKey);
}
export function invalidateOAuthCookies(cookies) {
    const expired = "Thu, 01 Jan 1970 00:00:00 GMT";
    cookies.push(`__session-oauth-state=; Path=/; HttpOnly; SameSite=Lax; Expires=${expired}`);
    cookies.push(`__session-oauth-nonce=; Path=/; HttpOnly; SameSite=Lax; Expires=${expired}`);
    cookies.push(`__session-code-verifier=; Path=/; HttpOnly; SameSite=Lax; Expires=${expired}`);
    cookies.push(`__session-webpk-challenge=; Path=/; HttpOnly; SameSite=Lax; Expires=${expired}`);
    return cookies;
}
export const invalidateSessionCookies = (name, cookies) => {
    const expired = "Thu, 01 Jan 1970 00:00:00 GMT";
    cookies.push(`${name}=; Path=/; HttpOnly; SameSite=Lax; Expires=${expired}`);
    return cookies;
};
//# sourceMappingURL=cookies.js.map