import type { AuthorizationServer } from "oauth4webapi"
import type {
  AccountInfo,
  OAuth2ProviderConfig,
  OAuthBaseProviderConfig,
} from "../../types.js"

type RobloxAuthConfig = OAuthBaseProviderConfig

const authorization_server: AuthorizationServer = {
  issuer: "https://apis.roblox.com/oauth/",
  authorization_endpoint: "https://apis.roblox.com/oauth/v1/authorize",
  token_endpoint: "https://apis.roblox.com/oauth/v1/token",
  userinfo_endpoint: "https://apis.roblox.com/oauth/v1/userinfo",
}

/**
 * Add Roblox OAuth2 Provider
 *
 * #### Callback or Redirect URL pattern
 *
 * ```
 * https://example.com/api/{name}/oauth/callback/roblox
 * ```
 *
 * #### Plugin Setup
 *
 * ```ts
 * import { Plugin } from 'payload'
 * import {authPlugin} from "payload-auth-plugin"
 * import {RobloxAuthProvider} from "payload-auth-plugin/providers"
 *
 * export const plugins: Plugin[] = [
 *  authPlugin({
 *    providers:[
 *      RobloxAuthProvider({
 *          client_id: process.env.ROBOLOX_CLIENT_ID as string,
 *          client_secret: process.env.ROBOLOR_CLIENT_SECRET as string,
 *      })
 *    ]
 *  })
 * ]
 * ```
 *
 */

function RobloxAuthProvider(config: RobloxAuthConfig): OAuth2ProviderConfig {
  const { overrideScope, ...restConfig } = config

  return {
    ...restConfig,
    id: "roblox",
    scope: overrideScope ?? "openid email profile",
    authorization_server,
    name: "Roblox",
    algorithm: "oauth2",
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

export default RobloxAuthProvider
