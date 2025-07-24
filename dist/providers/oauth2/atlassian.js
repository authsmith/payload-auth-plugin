const algorithm = "oauth2";
const authorization_server = {
    issuer: "https://auth.atlassian.com",
    authorization_endpoint: "https://auth.atlassian.com/authorize",
    token_endpoint: "https://auth.atlassian.com/oauth/token",
    userinfo_endpoint: "https://api.atlassian.com/me",
};
/**
 * Add Atlassian OAuth2 Provider
 *
 * #### Callback or Redirect URL pattern
 *
 * ```
 * https://example.com/api/{name}/oauth/callback/atlassian
 * ```
 *
 * #### Plugin Setup
 *
 * ```ts
 * import { Plugin } from 'payload'
 * import {authPlugin} from "payload-auth-plugin"
 * import {AtlassianAuthProvider} from "payload-auth-plugin/providers"
 *
 * export const plugins: Plugins[] = [
 *  authPlugin({
 *    providers:[
 *      AtlassianAuthProvider({
 *          client_id: process.env.ATLASSIAN_CLIENT_ID as string,
 *          client_secret: process.env.ATLASSIAN_CLIENT_SECRET as string,
 *      })
 *    ]
 *  })
 *
 * ]
 * ```
 *
 */
function AtlassianAuthProvider(config) {
    const { overrideScope, ...restConfig } = config;
    return {
        ...restConfig,
        id: "atlassian",
        authorization_server,
        name: "Atlassian",
        algorithm,
        scope: overrideScope ?? "read:me read:account",
        kind: "oauth",
        profile: (profile) => {
            return {
                sub: profile.account_id,
                name: profile.name,
                email: profile.email,
                picture: profile.picture,
            };
        },
    };
}
export default AtlassianAuthProvider;
//# sourceMappingURL=atlassian.js.map