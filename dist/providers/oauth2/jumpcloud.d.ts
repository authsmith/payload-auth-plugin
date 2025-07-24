import type { OAuthBaseProviderConfig, OAuth2ProviderConfig } from "../../types.js";
type JumpCloudAuthConfig = OAuthBaseProviderConfig;
/**
 * Add Jump Cloud OAuth2 Provider
 *
 * #### Callback or Redirect URL pattern
 *
 * ```
 * https://example.com/api/{name}/oauth/callback/jumpcloud
 * ```
 *
 * #### Plugin Setup
 *
 * ```ts
 * import { Plugin } from 'payload'
 * import {authPlugin} from "payload-auth-plugin"
 * import {JumpCloudAuthProvider} from "payload-auth-plugin/providers"
 *
 * export const plugins: Plugin[] = [
 *  authPlugin({
 *    providers:[
 *      JumpCloudAuthProvider({
 *          client_id: process.env.JUMP_CLOUD_CLIENT_ID as string,
 *          client_secret: process.env.JUMP_CLOUD_CLIENT_SECRET as string,
 *      })
 *    ]
 *  })
 * ]
 */
declare function JumpCloudAuthProvider(config: JumpCloudAuthConfig): OAuth2ProviderConfig;
export default JumpCloudAuthProvider;
//# sourceMappingURL=jumpcloud.d.ts.map