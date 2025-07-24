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
function GoogleAuthProvider(config) {
    const { overrideScope, ...restConfig } = config;
    return {
        ...config,
        id: "google",
        scope: overrideScope ?? "openid email profile",
        issuer: "https://accounts.google.com",
        name: "Google",
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
export default GoogleAuthProvider;
//# sourceMappingURL=google.js.map