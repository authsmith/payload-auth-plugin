import type { OAuth2ProviderConfig, OAuthBaseProviderConfig } from "../../types.js";
type AppleAuthConfig = OAuthBaseProviderConfig;
/**
 * Add Apple OAuth2 Provider
 *
 * #### Callback or Redirect URL pattern
 *
 * ```
 * https://example.com/api/{name}/oauth/callback/apple
 * ```
 *
 * #### Plugin Setup
 *
 * ```ts
 * import { Plugin } from 'payload'
 * import {authPlugin} from "payload-auth-plugin"
 * import {AppleOAuth2Provider} from "payload-auth-plugin/providers"
 *
 * export const plugins: Plugin[] = [
 *  authPlugin({
 *    providers:[
 *      AppleOAuth2Provider({
 *          client_id: process.env.APPLE_CLIENT_ID as string,
 *          client_secret: process.env.APPLE_CLIENT_SECRET as string,
 *      })
 *    ]
 *  })
 *
 * ]
 * ```
 *
 */
declare function AppleOAuth2Provider(config: AppleAuthConfig): OAuth2ProviderConfig;
export default AppleOAuth2Provider;
//# sourceMappingURL=apple.d.ts.map