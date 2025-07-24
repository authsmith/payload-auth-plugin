import type { OAuth2ProviderConfig, OAuthBaseProviderConfig } from "../../types.js";
type GitHubAuthConfig = OAuthBaseProviderConfig;
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
declare function GitHubAuthProvider(config: GitHubAuthConfig): OAuth2ProviderConfig;
export default GitHubAuthProvider;
//# sourceMappingURL=github.d.ts.map