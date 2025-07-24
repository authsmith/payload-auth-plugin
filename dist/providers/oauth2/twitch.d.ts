import type { OAuth2ProviderConfig, OAuthBaseProviderConfig } from "../../types.js";
type TwitchAuthConfig = OAuthBaseProviderConfig;
/**
 * Add Twitch OAuth2 Provider
 *
 * #### Callback or Redirect URL pattern
 *
 * ```
 * https://example.com/api/{name}/oauth/callback/twitch
 * ```
 *
 * #### Plugin Setup
 *
 * ```ts
 * import { Plugin } from 'payload'
 * import {authPlugin} from "payload-auth-plugin"
 * import {TwitchAuthProvider} from "payload-auth-plugin/providers"
 *
 * export const plugins: Plugin[] = [
 *  authPlugin({
 *    providers:[
 *      TwitchAuthProvider({
 *          client_id: process.env.TWITCH_CLIENT_ID as string,
 *          client_secret: process.env.TWITCH_CLIENT_SECRET as string,
 *      })
 *    ]
 *  })
 * ]
 * ```
 */
declare function TwitchAuthProvider(config: TwitchAuthConfig): OAuth2ProviderConfig;
export default TwitchAuthProvider;
//# sourceMappingURL=twitch.d.ts.map