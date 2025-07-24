/**
 * Add KeyCloak OIDC Provider
 *
 * #### Callback or Redirect URL pattern
 *
 * ```
 * https://example.com/api/{app_name}/oauth/callback/{name}
 * ```
 *
 * #### Plugin Setup
 *
 * ```ts
 * import { Plugin } from 'payload'
 * import {authPlugin} from "payload-auth-plugin"
 * import {KeyCloakAuthProvider} from "payload-auth-plugin/providers"
 *
 * export const plugins: Plugin[] = [
 *  authPlugin({
 *    providers:[
 *      KeyCloakAuthProvider({
 *          realm: process.env.KEYCLOAK_REALM as string,
 *          domain: process.env.KEYCLOAK_DOMAIN as string,
 *          identifier: process.env.KEYCLOAK_IDENTIFIER as string,
 *          name: process.env.KEYCLOAK_NAME as string,
 *          client_id: process.env.KEYCLOAK_CLIENT_ID as string,
 *          client_secret: process.env.KEYCLOAK_CLIENT_SECRET as string,
 *      })
 *    ]
 *  })
 * ]
 * ```
 *
 */
function KeyCloakAuthProvider(config) {
    const { realm, domain, identifier, name, overrideScope, ...restConfig } = config;
    return {
        ...restConfig,
        id: identifier,
        scope: overrideScope ?? "email openid profile",
        issuer: `https://${domain}/realms/${realm}`,
        name,
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
export default KeyCloakAuthProvider;
//# sourceMappingURL=keycloak.js.map