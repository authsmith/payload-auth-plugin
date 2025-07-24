const authorization_server = {
    issuer: "https://appleid.apple.com",
    authorization_endpoint: "https://appleid.apple.com/auth/authorize",
    token_endpoint: "https://appleid.apple.com/auth/token",
};
/**
 * Add Apple OAuth2 Provider
 *
 * #### Callback or Redirect URL pattern
 *
 * ```
 * https://example.com/api/{name}/oauth/callback/apple
 * ```
 *
 * #### Plugin Setup
 *
 * ```ts
 * import { Plugin } from 'payload'
 * import {authPlugin} from "payload-auth-plugin"
 * import {AppleOAuth2Provider} from "payload-auth-plugin/providers"
 *
 * export const plugins: Plugin[] = [
 *  authPlugin({
 *    providers:[
 *      AppleOAuth2Provider({
 *          client_id: process.env.APPLE_CLIENT_ID as string,
 *          client_secret: process.env.APPLE_CLIENT_SECRET as string,
 *      })
 *    ]
 *  })
 *
 * ]
 * ```
 *
 */
function AppleOAuth2Provider(config) {
    const { overrideScope, ...restConfig } = config;
    return {
        ...restConfig,
        id: "apple",
        scope: overrideScope ?? "name email",
        authorization_server,
        name: "Apple",
        algorithm: "oauth2",
        params: {
            ...config.params,
            response_mode: "form_post",
        },
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
export default AppleOAuth2Provider;
//# sourceMappingURL=apple.js.map