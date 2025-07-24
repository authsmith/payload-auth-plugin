const authorization_server = {
    issuer: "https://www.facebook.com",
    authorization_endpoint: "https://www.facebook.com/v19.0/dialog/oauth",
    token_endpoint: "https://graph.facebook.com/oauth/access_token",
    userinfo_endpoint: "https://graph.facebook.com/me?fields=id,name,email,picture",
};
/**
 * Add Facebook OAuth2 Provider
 *
 * #### Callback or Redirect URL pattern
 *
 * ```
 * https://example.com/api/{name}/oauth/callback/facebook
 * ```
 *
 * #### Plugin Setup
 *
 * ```ts
 * import { Plugin } from 'payload'
 * import {authPlugin} from "payload-auth-plugin"
 * import {FacebookAuthProvider} from "payload-auth-plugin/providers"
 *
 * export const plugins: Plugin[] = [
 *  authPlugin({
 *    providers:[
 *      FacebookAuthProvider({
 *          client_id: process.env.FACEBOOK_CLIENT_ID as string,
 *          client_secret: process.env.FACEBOOK_CLIENT_SECRET as string,
 *      })
 *    ]
 *  })
 * ]
 * ```
 */
function FacebookAuthProvider(config) {
    const { overrideScope, ...restConfig } = config;
    return {
        ...restConfig,
        id: "facebook",
        scope: overrideScope ?? "email",
        authorization_server,
        name: "Facebook",
        algorithm: "oauth2",
        kind: "oauth",
        profile: (profile) => {
            let picture;
            if (typeof profile.picture === "object" && profile.picture !== null) {
                // Type assertion
                const dataContainer = profile.picture;
                if ("data" in dataContainer) {
                    picture = dataContainer.data.url;
                }
            }
            return {
                sub: profile.id,
                name: profile.name,
                email: profile.email,
                picture: picture,
            };
        },
    };
}
export default FacebookAuthProvider;
//# sourceMappingURL=facebook.js.map