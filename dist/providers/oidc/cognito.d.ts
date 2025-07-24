import type { OIDCProviderConfig, OAuthBaseProviderConfig } from "../../types.js";
interface CognitoAuthConfig extends OAuthBaseProviderConfig {
    domain: string;
}
/**
 * Add Cognito OIDC Provider
 *
 * #### Callback or Redirect URL pattern
 * ```
 * https://example.com/api/{name}/oauth/callback/cognito
 * ```
 *
 * #### Plugin Setup
 *
 * ```ts
 * import { Plugin } from 'payload'
 * import { authPlugin } from "payload-auth-plugin"
 * import { CognitoAuthProvider } from "payload-auth-plugin/providers"
 *
 * export const plugins: Plugin[] = [
 *  authPlugin({
 *    providers:[
 *      CognitoAuthProvider({
 *        client_id: process.env.COGNITO_CLIENT_ID as string,
 *        client_secret: process.env.COGNITO_CLIENT_SECRET as string,
 *      })
 *    ]
 *  })
 * ]
 * ```
 *
 */
declare function CognitoAuthProvider(config: CognitoAuthConfig): OIDCProviderConfig;
export default CognitoAuthProvider;
//# sourceMappingURL=cognito.d.ts.map