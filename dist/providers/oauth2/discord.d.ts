import type { OAuth2ProviderConfig, OAuthBaseProviderConfig } from "../../types.js";
type DiscordAuthConfig = OAuthBaseProviderConfig;
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
declare function DiscordAuthProvider(config: DiscordAuthConfig): OAuth2ProviderConfig;
export default DiscordAuthProvider;
//# sourceMappingURL=discord.d.ts.map