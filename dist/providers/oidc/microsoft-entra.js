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
function MicrosoftEntraAuthProvider(config) {
    const { overrideScope, ...restConfig } = config;
    return {
        ...restConfig,
        id: "msft-entra",
        scope: overrideScope ?? "openid profile email offline_access",
        issuer: `https://login.microsoftonline.com/${config.tenant_id}/v2.0`,
        name: "Microsoft Entra",
        algorithm: "oidc",
        kind: "oauth",
        profile: (profile) => {
            const email = profile.email;
            return {
                sub: profile.sub,
                name: profile.name,
                email: email.toLowerCase(),
                picture: profile.picture,
            };
        },
    };
}
export default MicrosoftEntraAuthProvider;
//# sourceMappingURL=microsoft-entra.js.map