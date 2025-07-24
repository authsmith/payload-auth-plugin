import type { OIDCProviderConfig, OAuthBaseProviderConfig } from "../../types.js";
type MicrosoftEntraAuthConfig = OAuthBaseProviderConfig & {
    tenant_id: string;
    skip_email_verification?: boolean | undefined;
};
/**
 * Add Microsoft Entra OIDC Provider
 *
 * #### Callback or Redirect URL pattern
 *
 * ```
 * https://example.com/api/{name}/oauth/callback/msft-entra
 * ```
 *
 * #### Plugin Setup
 *
 * ```ts
 * import { Plugin } from 'payload'
 * import { authPlugin } from "payload-auth-plugin"
 * import { MicrosoftEntraAuthProvider } from "payload-auth-plugin/providers"
 *
 * export const plugins: Plugin[] = [
 *  authPlugin({
 *    providers:[
 *      MicrosoftEntraAuthProvider({
 *          tenant_id: process.env.MICROSOFTENTRA_TENANT_ID as string,
 *          client_id: process.env.MICROSOFTENTRA_CLIENT_ID as string,
 *          client_secret: process.env.MICROSOFTENTRA_CLIENT_SECRET as string,
 *      })
 *    ]
 *  })
 * ]
 * ```
 *
 */
declare function MicrosoftEntraAuthProvider(config: MicrosoftEntraAuthConfig): OIDCProviderConfig;
export default MicrosoftEntraAuthProvider;
//# sourceMappingURL=microsoft-entra.d.ts.map