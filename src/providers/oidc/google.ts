import type {
  AccountInfo,
  OIDCProviderConfig,
  OAuthBaseProviderConfig,
} from "../../types.js"

type GoogleAuthConfig = OAuthBaseProviderConfig

/**
 * Add Google OIDC Provider
 *
 * ```
 * https://example.com/api/{name}/oauth/callback/google
 * ```
 *
 * #### Plugin Setup
 *
 * ```ts
 * import { Plugin } from 'payload'
 * import {authPlugin} from "payload-auth-plugin"
 * import {GoogleAuthProvider} from "payload-auth-plugin/providers"
 *
 * export const plugins: Plugin[] = [
 *  authPlugin({
 *    providers:[
 *      GoogleAuthProvider({
 *          client_id: process.env.GOOGLE_CLIENT_ID as string,
 *          client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
 *      })
 *    ]
 *  })
 * ]
 * ```
 */

function GoogleAuthProvider(config: GoogleAuthConfig): OIDCProviderConfig {
  const { overrideScope, ...restConfig } = config

  return {
    ...restConfig,
    id: "google",
    scope: overrideScope ?? "openid email profile",
    issuer: "https://accounts.google.com",
    name: "Google",
    algorithm: "oidc",
    kind: "oauth",
    profile: (profile): AccountInfo => {
      return {
        sub: profile.sub as string,
        name: profile.name as string,
        email: profile.email as string,
        picture: profile.picture as string,
      }
    },
  }
}

export default GoogleAuthProvider
