/**
 * The App plugin is used for authenticating users in the frontent app of the Payload CMS application.
 * It support magic link, password, OAuth, and Passkey based authentications.
 *
 * On top of it, to add additional security it also support 2FA using OTP, and TOTP.
 *
 * The set up is very lean and flexible to tailor the auth process in a specific way.
 *
 * ```ts
 * import {authPlugin} from "payload-auth-plugin";
 *
 * export const plugins = [
 *  authPlugin({
 *    name: "a-unique-name",
 *    usersCollectionSlug: "users-collection-slug",
 *    accountsCollectionSlug: "accounts-collection-slug",
 *    providers:[]
 *  })
 * ]
 *
 * ```
 * @packageDocumentation
 */
import { InvalidServerURL, MissingEmailAdapter, } from "./core/errors/consoleErrors.js";
import { getPasswordProvider, getOAuthProviders, getPasskeyProvider, } from "./providers/utils.js";
import { PasswordAuthEndpointStrategy, EndpointsFactory, OAuthEndpointStrategy, PasskeyEndpointStrategy, SessionEndpointStrategy, } from "./core/endpoints.js";
import { formatSlug } from "./core/utils/slug.js";
import { preflightCollectionCheck } from "./core/preflights/collections.js";
export const authPlugin = (pluginOptions) => (incomingConfig) => {
    const config = { ...incomingConfig };
    if (pluginOptions.enabled === false) {
        return config;
    }
    if (!config.serverURL) {
        throw new InvalidServerURL();
    }
    const { usersCollectionSlug, accountsCollectionSlug, providers, allowOAuthAutoSignUp, useAdmin, successRedirectPath, errorRedirectPath, } = pluginOptions;
    preflightCollectionCheck([usersCollectionSlug, accountsCollectionSlug], config.collections);
    const name = formatSlug(pluginOptions.name);
    const oauthProviders = getOAuthProviders(providers);
    const passkeyProvider = getPasskeyProvider(providers);
    const passwordProvider = getPasswordProvider(providers);
    const endpointsFactory = new EndpointsFactory(name, {
        usersCollection: usersCollectionSlug,
        accountsCollection: accountsCollectionSlug,
    }, allowOAuthAutoSignUp ?? false, !!useAdmin, successRedirectPath, errorRedirectPath);
    let oauthEndpoints = [];
    let passkeyEndpoints = [];
    let passwordEndpoints = [];
    if (Object.keys(oauthProviders).length > 0) {
        endpointsFactory.registerStrategy("oauth", new OAuthEndpointStrategy(oauthProviders));
        oauthEndpoints = endpointsFactory.createEndpoints("oauth");
    }
    if (passkeyProvider) {
        endpointsFactory.registerStrategy("passkey", new PasskeyEndpointStrategy());
        passkeyEndpoints = endpointsFactory.createEndpoints("passkey");
    }
    if (passwordProvider) {
        if (!config.email) {
            throw new MissingEmailAdapter();
        }
        endpointsFactory.registerStrategy("password", new PasswordAuthEndpointStrategy({
            usersCollectionSlug,
        }, passwordProvider));
        passwordEndpoints = endpointsFactory.createEndpoints("password");
    }
    endpointsFactory.registerStrategy("session", new SessionEndpointStrategy({ usersCollectionSlug }));
    const sessionEndpoints = endpointsFactory.createEndpoints("session");
    config.endpoints = [
        ...(config.endpoints ?? []),
        ...oauthEndpoints,
        ...passkeyEndpoints,
        ...passwordEndpoints,
        ...sessionEndpoints,
    ];
    return config;
};
//# sourceMappingURL=plugin.js.map