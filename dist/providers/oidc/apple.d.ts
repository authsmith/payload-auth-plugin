import type { OAuthBaseProviderConfig, OIDCProviderConfig } from "../../types.js";
interface AppleAuthConfig extends OAuthBaseProviderConfig {
    client_id: string;
    params?: Record<string, string>;
}
/**
 * Add Apple OIDC Provider
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
 * import { authPlugin } from "payload-auth-plugin"
 * import { AppleOIDCAuthProvider } from "payload-auth-plugin/providers"
 *
 * export const plugins: Plugin[] = [
 *  authPlugin({
 *    providers:[
 *      AppleOIDCAuthProvider({
 *          client_id: process.env.APPLE_CLIENT_ID as string,
 *      })
 *    ]
 *  })
 * ```
 *
 */
declare function AppleOIDCAuthProvider(config: AppleAuthConfig): OIDCProviderConfig;
export default AppleOIDCAuthProvider;
//# sourceMappingURL=apple.d.ts.map