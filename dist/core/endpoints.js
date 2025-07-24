import { OAuthHandlers } from "./routeHandlers/oauth.js";
import { PasskeyHandlers } from "./routeHandlers/passkey.js";
import { PasswordAuthHandlers } from "./routeHandlers/password.js";
import { SessionHandlers } from "./routeHandlers/session.js";
/**
 * Oauth endpoint strategy to implement dynamic enpoints for all type of Oauth providers
 *
 * @export
 * @class OAuthEndpointStrategy
 * @typedef {OAuthEndpointStrategy}
 * @internal
 */
export class OAuthEndpointStrategy {
    providers;
    constructor(providers) {
        this.providers = providers;
    }
    createEndpoints({ pluginType, collections, allowOAuthAutoSignUp, useAdmin, successRedirectPath, errorRedirectPath, }) {
        return [
            {
                path: `/${pluginType}/oauth/:resource/:provider`,
                method: "get",
                handler: (request) => {
                    const provider = this.providers[request.routeParams?.provider];
                    const state = request.searchParams.get("state") ?? undefined;
                    return OAuthHandlers({
                        pluginType,
                        collections,
                        allowOAuthAutoSignUp,
                        secret: request.payload.secret,
                        useAdmin,
                        request,
                        provider,
                        successRedirectPath,
                        errorRedirectPath,
                        state,
                    });
                },
            },
        ];
    }
}
/**
 * Passkey endpoint strategy to implement enpoints for Passkey provider
 *
 * @export
 * @class PasskeyEndpointStrategy
 * @typedef {PasskeyEndpointStrategy}
 * @implements {EndpointStrategy}
 * @internal
 */
export class PasskeyEndpointStrategy {
    createEndpoints({ pluginType, rpID, sessionCallback, }) {
        return [
            {
                path: `/${pluginType}/passkey/:resource`,
                method: "post",
                handler: (request) => {
                    return PasskeyHandlers(request, request.routeParams?.resource, rpID, (accountInfo) => {
                        return sessionCallback(accountInfo, "Passkey", request.payload);
                    });
                },
            },
        ];
    }
}
/**
 * Endpoint strategy for Password based authentication
 */
export class PasswordAuthEndpointStrategy {
    internals;
    providerConfig;
    constructor(internals, providerConfig) {
        this.internals = internals;
        this.providerConfig = providerConfig;
    }
    createEndpoints({ pluginType, useAdmin, successRedirectPath, errorRedirectPath, }) {
        return [
            {
                path: `/${pluginType}/auth/:kind`,
                handler: (request) => {
                    const stage = request.searchParams.get("stage") ?? undefined;
                    return PasswordAuthHandlers(request, pluginType, request.routeParams?.kind, this.internals, request.payload.secret, useAdmin, successRedirectPath, errorRedirectPath, this.providerConfig, stage);
                },
                method: "post",
            },
        ];
    }
}
/**
 * Endpoint strategy for managing sessions
 */
export class SessionEndpointStrategy {
    internals;
    constructor(internals) {
        this.internals = internals;
    }
    createEndpoints({ pluginType }) {
        return [
            {
                path: `/${pluginType}/session/:kind`,
                handler: (request) => {
                    return SessionHandlers(request, pluginType, this.internals);
                },
                method: "get",
            },
        ];
    }
}
export class EndpointsFactory {
    pluginType;
    collections;
    allowOAuthAutoSignUp;
    useAdmin;
    successRedirectPath;
    errorRedirectPath;
    strategies = {};
    constructor(pluginType, collections, allowOAuthAutoSignUp, useAdmin, successRedirectPath, errorRedirectPath) {
        this.pluginType = pluginType;
        this.collections = collections;
        this.allowOAuthAutoSignUp = allowOAuthAutoSignUp;
        this.useAdmin = useAdmin;
        this.successRedirectPath = successRedirectPath;
        this.errorRedirectPath = errorRedirectPath;
    }
    registerStrategy(name, strategy) {
        this.strategies[name] = strategy;
    }
    createEndpoints(strategyName, config) {
        const strategy = this.strategies[strategyName];
        if (!strategy) {
            throw new Error(`Strategy "${strategyName}" not found.`);
        }
        return strategy.createEndpoints({
            pluginType: this.pluginType,
            allowOAuthAutoSignUp: this.allowOAuthAutoSignUp,
            useAdmin: this.useAdmin,
            collections: this.collections,
            successRedirectPath: this.successRedirectPath,
            errorRedirectPath: this.errorRedirectPath,
            ...config,
        });
    }
}
//# sourceMappingURL=endpoints.js.map