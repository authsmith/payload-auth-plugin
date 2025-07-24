import type { OAuth2ProviderConfig, OAuthBaseProviderConfig } from "../../types.js";
interface Auth0AuthConfig extends OAuthBaseProviderConfig {
    domain: string;
}
/**
 * Add Auth0 OAuth2 Provider
 *
 * #### Callback or Redirect URL pattern
 *
 * ```
 * https://example.com/api/{name}/oauth/callback/auth0
 * ```
 *
 * #### Plugin Setup
 *
 * ```ts
 * import { Plugin } from 'payload'
 * import {authPlugin} from "payload-auth-plugin"
 * import {Auth0AuthProvider} from "payload-auth-plugin/providers"
 *
 * export const plugins: Plugin[] = [
 *  authPlugin({
 *    providers:[
 *      Auth0AuthProvider({
 *          client_id: process.env.AUTH0_CLIENT_ID as string,
 *          client_secret: process.env.AUTH0_CLIENT_SECRET as string,
 *          domain: process.env.AUTH0_DOMAIN as string,
 *      })
 *    ]
 *  })
 * ]
 * ```
 *
 */
declare function Auth0AuthProvider(config: Auth0AuthConfig): OAuth2ProviderConfig;
export default Auth0AuthProvider;
//# sourceMappingURL=auth0.d.ts.map