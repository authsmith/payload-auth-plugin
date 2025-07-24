import type { OAuth2ProviderConfig, OAuthBaseProviderConfig } from "../../types.js";
type AtlassianAuthConfig = OAuthBaseProviderConfig;
/**
 * Add Atlassian OAuth2 Provider
 *
 * #### Callback or Redirect URL pattern
 *
 * ```
 * https://example.com/api/{name}/oauth/callback/atlassian
 * ```
 *
 * #### Plugin Setup
 *
 * ```ts
 * import { Plugin } from 'payload'
 * import {authPlugin} from "payload-auth-plugin"
 * import {AtlassianAuthProvider} from "payload-auth-plugin/providers"
 *
 * export const plugins: Plugins[] = [
 *  authPlugin({
 *    providers:[
 *      AtlassianAuthProvider({
 *          client_id: process.env.ATLASSIAN_CLIENT_ID as string,
 *          client_secret: process.env.ATLASSIAN_CLIENT_SECRET as string,
 *      })
 *    ]
 *  })
 *
 * ]
 * ```
 *
 */
declare function AtlassianAuthProvider(config: AtlassianAuthConfig): OAuth2ProviderConfig;
export default AtlassianAuthProvider;
//# sourceMappingURL=atlassian.d.ts.map