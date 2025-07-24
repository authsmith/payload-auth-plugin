const authorization_server = {
    issuer: "https://github.com",
    authorization_endpoint: "https://github.com/login/oauth/authorize",
    token_endpoint: "https://github.com/login/oauth/access_token",
    userinfo_endpoint: "https://api.github.com/user",
};
/**
 * Add Github OAuth2 Provider
 *
 * #### Callback or Redirect URL pattern
 *
 * ```
 * https://example.com/api/{name}/oauth/callback/github
 * ```
 *
 * #### Plugin Setup
 *
 * ```ts
 * import { Plugin } from 'payload'
 * import {authPlugin} from "payload-auth-plugin"
 * import {GithubAuthProvider} from "payload-auth-plugin/providers"
 *
 * export const plugins: Plugin[] = [
 *  authPlugin({
 *    providers:[
 *      GithubAuthProvider({
 *          client_id: process.env.GITHUB_CLIENT_ID as string,
 *          client_secret: process.env.GITHUB_CLIENT_SECRET as string,
 *      })
 *    ]
 *  })
 * ]
 * ```
 *
 */
function GitHubAuthProvider(config) {
    const { overrideScope, ...restConfig } = config;
    return {
        ...restConfig,
        id: "github",
        scope: overrideScope ?? "openid email profile",
        authorization_server,
        name: "GitHub",
        algorithm: "oauth2",
        kind: "oauth",
        profile: (profile) => {
            return {
                sub: profile.id,
                name: profile.name,
                email: profile.email,
                picture: profile.picture,
            };
        },
    };
}
export default GitHubAuthProvider;
//# sourceMappingURL=github.js.map