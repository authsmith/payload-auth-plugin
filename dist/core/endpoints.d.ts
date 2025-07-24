import type { BasePayload, Endpoint } from "payload";
import type { AccountInfo, OAuthProviderConfig, PasswordProviderConfig } from "../types.js";
/**
 * Base interface for all endpoint strategies. Useful to keep extending for providers with
 * different requirements to interact with
 *
 * @interface EndpointStrategy
 *
 * @typedef {EndpointStrategy}
 *
 */
interface EndpointStrategy {
    createEndpoints(config: unknown): Endpoint[];
}
/**
 * Oauth endpoint strategy to implement dynamic enpoints for all type of Oauth providers
 *
 * @export
 * @class OAuthEndpointStrategy
 * @typedef {OAuthEndpointStrategy}
 * @internal
 */
export declare class OAuthEndpointStrategy implements EndpointStrategy {
    private providers;
    constructor(providers: Record<string, OAuthProviderConfig>);
    createEndpoints({ pluginType, collections, allowOAuthAutoSignUp, useAdmin, successRedirectPath, errorRedirectPath, }: {
        pluginType: string;
        collections: {
            usersCollection: string;
            accountsCollection: string;
        };
        allowOAuthAutoSignUp: boolean;
        useAdmin: boolean;
        successRedirectPath: string;
        errorRedirectPath: string;
    }): Endpoint[];
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
export declare class PasskeyEndpointStrategy implements EndpointStrategy {
    createEndpoints({ pluginType, rpID, sessionCallback, }: {
        pluginType: string;
        collections: {
            usersCollection: string;
            accountsCollection: string;
        };
        rpID: string;
        sessionCallback: (accountInfo: AccountInfo, issuerName: string, payload: BasePayload) => Promise<Response>;
    }): Endpoint[];
}
/**
 * Endpoint strategy for Password based authentication
 */
export declare class PasswordAuthEndpointStrategy implements EndpointStrategy {
    private internals;
    private providerConfig;
    constructor(internals: {
        usersCollectionSlug: string;
    }, providerConfig: PasswordProviderConfig);
    createEndpoints({ pluginType, useAdmin, successRedirectPath, errorRedirectPath, }: {
        pluginType: string;
        useAdmin: boolean;
        successRedirectPath: string;
        errorRedirectPath: string;
    }): Endpoint[];
}
/**
 * Endpoint strategy for managing sessions
 */
export declare class SessionEndpointStrategy implements EndpointStrategy {
    private internals;
    constructor(internals: {
        usersCollectionSlug: string;
    });
    createEndpoints({ pluginType }: {
        pluginType: string;
    }): Endpoint[];
}
/**
 * The generic endpoint factory class
 *
 * @export
 * @class EndpointsFactory
 * @typedef {EndpointsFactory}
 * @internal
 */
type Strategies = "oauth" | "passkey" | "password" | "session";
export declare class EndpointsFactory {
    private pluginType;
    private collections;
    private allowOAuthAutoSignUp;
    private useAdmin;
    private successRedirectPath;
    private errorRedirectPath;
    private strategies;
    constructor(pluginType: string, collections: {
        usersCollection: string;
        accountsCollection: string;
    }, allowOAuthAutoSignUp: boolean, useAdmin: boolean, successRedirectPath: string, errorRedirectPath: string);
    registerStrategy(name: Strategies, strategy: EndpointStrategy): void;
    createEndpoints(strategyName: Strategies, config?: Record<string, unknown> | undefined): Endpoint[];
}
export {};
//# sourceMappingURL=endpoints.d.ts.map