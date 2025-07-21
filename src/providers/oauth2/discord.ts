import type * as oauth from "oauth4webapi"
import type {
  OAuth2ProviderConfig,
  AccountInfo,
  OAuthBaseProviderConfig,
} from "../../types.js"

const authorization_server: oauth.AuthorizationServer = {
  issuer: "https://discord.com",
  authorization_endpoint: "https://discord.com/api/oauth2/authorize",
  token_endpoint: "https://discord.com/api/oauth2/token",
  userinfo_endpoint: "https://discord.com/api/users/@me",
}
type DiscordAuthConfig = OAuthBaseProviderConfig

/**
 * Add Discord OAuth2 Provider
 *
 * ```
 * https://example.com/api/{name}/oauth/callback/discord
 * ```
 *
 * #### Plugin Setup
 *
 * ```ts
 * import { Plugin } from 'payload'
 * import {authPlugin} from "payload-auth-plugin"
 * import {DiscordAuthProvider} from "payload-auth-plugin/providers"
 *
 * export const plugins: Plugin[] = [
 *  authPlugin({
 *    providers:[
 *      DiscordAuthProvider({
 *          client_id: process.env.DISCORD_CLIENT_ID as string,
 *          client_secret: process.env.DISCORD_CLIENT_SECRET as string,
 *      })
 *    ]
 *  })
 * ]
 * ```
 *
 */

function DiscordAuthProvider(config: DiscordAuthConfig): OAuth2ProviderConfig {
  const { overrideScope, ...restConfig } = config

  return {
    ...restConfig,
    id: "discord",
    scope: overrideScope ?? "identify email",
    authorization_server,
    name: "Discord",
    algorithm: "oauth2",
    kind: "oauth",
    profile: (profile): AccountInfo => {
      const format = profile.avatar?.toString().startsWith("a_") ? "gif" : "png"

      return {
        sub: profile.id as string,
        name: (profile.username as string) ?? (profile.global_name as string),
        email: profile.email as string,
        picture: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`,
      }
    },
  }
}

export default DiscordAuthProvider
