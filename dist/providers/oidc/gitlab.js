/**
 * Add GitLab OIDC Provider
 *
 * #### Callback or Redirect URL pattern
 *
 * ```
 * https://example.com/api/{name}/oauth/callback/gitlab
 * ```
 *
 * #### Plugin Setup
 *
 * ```ts
 * import { Plugin } from 'payload'
 * import { authPlugin } from "payload-auth-plugin"
 * import { GitLabAuthProvider } from "payload-auth-plugin/providers"
 *
 * export const plugins: Plugin[] = [
 *  authPlugin({
 *    providers:[
 *      GitLabAuthProvider({
 *          client_id: process.env.GITLAB_CLIENT_ID as string,
 *          client_secret: process.env.GITLAB_CLIENT_SECRET as string,
 *      })
 *    ]
 *  })
 * ]
 * ```
 *
 */
function GitLabAuthProvider(config) {
    const { overrideScope, ...restConfig } = config;
    return {
        ...restConfig,
        id: "gitlab",
        scope: overrideScope ?? "openid email profile",
        issuer: "https://gitlab.com",
        name: "GitLab",
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
export default GitLabAuthProvider;
//# sourceMappingURL=gitlab.js.map