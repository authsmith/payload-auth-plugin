/**
 * Add Okta OIDC Provider
 *
 * #### Callback or Redirect URL pattern
 *
 * ```
 * https://example.com/api/{name}/oauth/callback/{name}
 * ```
 *
 * #### Plugin Setup
 *
 * ```ts
 * import { Plugin } from 'payload'
 * import {authPlugin} from "payload-auth-plugin"
 * import {OktaAuthProvider} from "payload-auth-plugin/providers"
 *
 * export const plugins: Plugin[] = [
 *  authPlugin({
 *    providers:[
 *      OktaAuthProvider({g,
 *          domain: process.env.KEYCLOAK_DOMAIN as string,
 *          client_id: process.env.KEYCLOAK_CLIENT_ID as string,
 *          client_secret: process.env.KEYCLOAK_CLIENT_SECRET as string,
 *      })
 *    ]
 *  })
 * ]
 * ```
 *
 */
function encodeString(s) {
    let h = 0;
    const l = s.length;
    let i = 0;
    if (l > 0) {
        while (i < l) {
            h = ((h << 5) - h + s.charCodeAt(i++)) | 0; // Bitwise operations to create a hash
        }
    }
    return h;
}
function OktaAuthProvider(config) {
    const { domain, overrideScope, ...restConfig } = config;
    const stateCode = encodeString(config.client_id).toString();
    return {
        ...restConfig,
        id: "okta",
        scope: overrideScope ?? "email openid profile",
        issuer: `https://${domain}`,
        name: "Okta",
        algorithm: "oidc",
        kind: "oauth",
        params: {
            state: `state-${stateCode}`,
        },
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
export default OktaAuthProvider;
//# sourceMappingURL=okta.js.map