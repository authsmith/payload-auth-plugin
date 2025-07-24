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
function Auth0AuthProvider(config) {
    const { domain, overrideScope, ...restConfig } = config;
    const authorization_server = {
        issuer: `https://${domain}/`,
        authorization_endpoint: `https://${domain}/authorize`,
        token_endpoint: `https://${domain}/oauth/token`,
        userinfo_endpoint: `https://${domain}/userinfo`,
    };
    return {
        ...restConfig,
        id: "auth0",
        scope: overrideScope ?? "openid email profile",
        authorization_server,
        name: "Auth0",
        algorithm: "oauth2",
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
export default Auth0AuthProvider;
//# sourceMappingURL=auth0.js.map