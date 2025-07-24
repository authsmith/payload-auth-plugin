/**
 * Add Slack OIDC Provider
 *
 * #### Callback or Redirect URL pattern
 *
 * ```
 * https://example.com/api/{name}/oauth/callback/slack
 * ```
 *
 * #### Plugin Setup
 *
 * ```ts
 * import { Plugin } from 'payload'
 * import {authPlugin} from "payload-auth-plugin"
 * import {SlackAuthProvider} from "payload-auth-plugin/providers"
 *
 * export const plugins: Plugin[] = [
 *  authPlugin({
 *    providers:[
 *      SlackAuthProvider({
 *          client_id: process.env.SLACK_CLIENT_ID as string,
 *          client_secret: process.env.SLACK_CLIENT_SECRET as string,
 *      })
 *    ]
 *  })
 * ]
 * ```
 *
 */
function SlackAuthProvider(config) {
    const { overrideScope, ...restConfig } = config;
    return {
        ...restConfig,
        id: "slack",
        scope: overrideScope ?? "openid email profile",
        issuer: "https://slack.com",
        name: "Slack",
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
export default SlackAuthProvider;
//# sourceMappingURL=slack.js.map