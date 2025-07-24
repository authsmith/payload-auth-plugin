import type { OIDCProviderConfig, OAuthBaseProviderConfig } from "../../types.js";
type SlackAuthConfig = OAuthBaseProviderConfig;
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
declare function SlackAuthProvider(config: SlackAuthConfig): OIDCProviderConfig;
export default SlackAuthProvider;
//# sourceMappingURL=slack.d.ts.map