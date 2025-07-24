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
function CognitoAuthProvider(config) {
    const { domain, overrideScope, ...restConfig } = config;
    return {
        ...restConfig,
        id: "cognito",
        scope: overrideScope ?? "email openid profile",
        issuer: domain,
        name: "Congnito",
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
export default CognitoAuthProvider;
//# sourceMappingURL=cognito.js.map