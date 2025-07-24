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
function AppleOIDCAuthProvider(config) {
    const { overrideScope, ...restConfig } = config;
    return {
        ...restConfig,
        id: "apple",
        scope: overrideScope ?? "openid name email",
        issuer: "https://appleid.apple.com",
        name: "Apple",
        algorithm: "oidc",
        kind: "oauth",
        profile: (profile) => {
            return {
                sub: profile.sub,
                name: profile.name,
                email: profile.email,
                picture: profile.picture,
            };
        },
    };
}
export default AppleOIDCAuthProvider;
//# sourceMappingURL=apple.js.map