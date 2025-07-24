import type { OIDCProviderConfig, OAuthBaseProviderConfig } from "../../types.js";
type GoogleAuthConfig = OAuthBaseProviderConfig;
/**
 * Add Google OIDC Provider
 *
 * ```
 * https://example.com/api/{name}/oauth/callback/google
 * ```
 *
 * #### Plugin Setup
 *
 * ```ts
 * import { Plugin } from 'payload'
 * import {authPlugin} from "payload-auth-plugin"
 * import {GoogleAuthProvider} from "payload-auth-plugin/providers"
 *
 * export const plugins: Plugin[] = [
 *  authPlugin({
 *    providers:[
 *      GoogleAuthProvider({
 *          client_id: process.env.GOOGLE_CLIENT_ID as string,
 *          client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
 *      })
 *    ]
 *  })
 * ]
 * ```
 */
declare function GoogleAuthProvider(config: GoogleAuthConfig): OIDCProviderConfig;
export default GoogleAuthProvider;
//# sourceMappingURL=google.d.ts.map