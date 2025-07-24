import type { OAuth2ProviderConfig, OAuthBaseProviderConfig } from "../../types.js";
type FacebookAuthConfig = OAuthBaseProviderConfig;
/**
 * Add Facebook OAuth2 Provider
 *
 * #### Callback or Redirect URL pattern
 *
 * ```
 * https://example.com/api/{name}/oauth/callback/facebook
 * ```
 *
 * #### Plugin Setup
 *
 * ```ts
 * import { Plugin } from 'payload'
 * import {authPlugin} from "payload-auth-plugin"
 * import {FacebookAuthProvider} from "payload-auth-plugin/providers"
 *
 * export const plugins: Plugin[] = [
 *  authPlugin({
 *    providers:[
 *      FacebookAuthProvider({
 *          client_id: process.env.FACEBOOK_CLIENT_ID as string,
 *          client_secret: process.env.FACEBOOK_CLIENT_SECRET as string,
 *      })
 *    ]
 *  })
 * ]
 * ```
 */
declare function FacebookAuthProvider(config: FacebookAuthConfig): OAuth2ProviderConfig;
export default FacebookAuthProvider;
//# sourceMappingURL=facebook.d.ts.map