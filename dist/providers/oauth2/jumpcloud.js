const authorization_server = {
    issuer: "https://oauth.id.jumpcloud.com/",
    authorization_endpoint: "https://oauth.id.jumpcloud.com/oauth2/auth",
    token_endpoint: "https://oauth.id.jumpcloud.com/oauth2/token",
    userinfo_endpoint: "https://oauth.id.jumpcloud.com/userinfo",
};
/**
 * Add Jump Cloud OAuth2 Provider
 *
 * #### Callback or Redirect URL pattern
 *
 * ```
 * https://example.com/api/{name}/oauth/callback/jumpcloud
 * ```
 *
 * #### Plugin Setup
 *
 * ```ts
 * import { Plugin } from 'payload'
 * import {authPlugin} from "payload-auth-plugin"
 * import {JumpCloudAuthProvider} from "payload-auth-plugin/providers"
 *
 * export const plugins: Plugin[] = [
 *  authPlugin({
 *    providers:[
 *      JumpCloudAuthProvider({
 *          client_id: process.env.JUMP_CLOUD_CLIENT_ID as string,
 *          client_secret: process.env.JUMP_CLOUD_CLIENT_SECRET as string,
 *      })
 *    ]
 *  })
 * ]
 */
function JumpCloudAuthProvider(config) {
    const { overrideScope, ...restConfig } = config;
    return {
        ...restConfig,
        id: "jumpcloud",
        scope: overrideScope ?? "openid email profile",
        authorization_server,
        name: "Jump Cloud",
        algorithm: "oauth2",
        kind: "oauth",
        profile: (profile) => {
            return {
                sub: profile.email,
                name: profile.name,
                email: profile.email,
                picture: profile.picture,
            };
        },
    };
}
export default JumpCloudAuthProvider;
//# sourceMappingURL=jumpcloud.js.map