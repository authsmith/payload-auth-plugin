import type { BasePayload, Endpoint, PayloadRequest } from "payload"
import type {
  AccountInfo,
  OAuthProviderConfig,
  PasswordProviderConfig,
} from "../types.js"
import { OAuthHandlers } from "./routeHandlers/oauth.js"
import { PasskeyHandlers } from "./routeHandlers/passkey.js"
import { PasswordAuthHandlers } from "./routeHandlers/password.js"
import { SessionHandlers } from "./routeHandlers/session.js"
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
  createEndpoints(config: unknown): Endpoint[]
}

/**
 * Oauth endpoint strategy to implement dynamic enpoints for all type of Oauth providers
 *
 * @export
 * @class OAuthEndpointStrategy
 * @typedef {OAuthEndpointStrategy}
 * @internal
 */
export class OAuthEndpointStrategy implements EndpointStrategy {
  constructor(private providers: Record<string, OAuthProviderConfig>) {}

  createEndpoints({
    pluginType,
    collections,
    allowOAuthAutoSignUp,
    useAdmin,
    successRedirectPath,
    errorRedirectPath,
  }: {
    pluginType: string
    collections: {
      usersCollection: string
      accountsCollection: string
    }
    allowOAuthAutoSignUp: boolean
    useAdmin: boolean
    successRedirectPath: string
    errorRedirectPath: string
  }): Endpoint[] {
    return [
      {
        path: `/${pluginType}/oauth/:resource/:provider`,
        method: "get",
        handler: (request: PayloadRequest) => {
          const provider = this.providers[
            request.routeParams?.provider as string
          ] as OAuthProviderConfig

          const state = request.searchParams.get("state") ?? undefined

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
          })
        },
      },
    ]
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
export class PasskeyEndpointStrategy implements EndpointStrategy {
  createEndpoints({
    pluginType,
    rpID,
    sessionCallback,
  }: {
    pluginType: string
    collections: {
      usersCollection: string
      accountsCollection: string
    }
    rpID: string
    sessionCallback: (
      accountInfo: AccountInfo,
      issuerName: string,
      payload: BasePayload,
    ) => Promise<Response>
  }): Endpoint[] {
    return [
      {
        path: `/${pluginType}/passkey/:resource`,
        method: "post",
        handler: (request: PayloadRequest) => {
          return PasskeyHandlers(
            request,
            request.routeParams?.resource as string,
            rpID,
            (accountInfo: unknown) => {
              return sessionCallback(
                accountInfo as AccountInfo,
                "Passkey",
                request.payload,
              )
            },
          )
        },
      },
    ]
  }
}

/**
 * Endpoint strategy for Password based authentication
 */
export class PasswordAuthEndpointStrategy implements EndpointStrategy {
  constructor(
    private internals: {
      usersCollectionSlug: string
    },
    private providerConfig: PasswordProviderConfig,
  ) {}
  createEndpoints({
    pluginType,
    useAdmin,
    successRedirectPath,
    errorRedirectPath,
  }: {
    pluginType: string
    useAdmin: boolean
    successRedirectPath: string
    errorRedirectPath: string
  }): Endpoint[] {
    return [
      {
        path: `/${pluginType}/auth/:kind`,
        handler: (request: PayloadRequest) => {
          const stage = request.searchParams.get("stage") ?? undefined
          return PasswordAuthHandlers(
            request,
            pluginType,
            request.routeParams?.kind as string,
            this.internals,
            request.payload.secret,
            useAdmin,
            successRedirectPath,
            errorRedirectPath,
            this.providerConfig,
            stage,
          )
        },
        method: "post",
      },
    ]
  }
}

/**
 * Endpoint strategy for managing sessions
 */
export class SessionEndpointStrategy implements EndpointStrategy {
  constructor(
    private internals: {
      usersCollectionSlug: string
    },
  ) {}
  createEndpoints({ pluginType }: { pluginType: string }): Endpoint[] {
    return [
      {
        path: `/${pluginType}/session/:kind`,
        handler: (request: PayloadRequest) => {
          return SessionHandlers(request, pluginType, this.internals)
        },
        method: "get",
      },
    ]
  }
}

/**
 * The generic endpoint factory class
 *
 * @export
 * @class EndpointsFactory
 * @typedef {EndpointsFactory}
 * @internal
 */

type Strategies = "oauth" | "passkey" | "password" | "session"
export class EndpointsFactory {
  private strategies: Record<string, EndpointStrategy> = {}
  constructor(
    private pluginType: string,
    private collections: {
      usersCollection: string
      accountsCollection: string
    },
    private allowOAuthAutoSignUp: boolean,
    private useAdmin: boolean,
    private successRedirectPath: string,
    private errorRedirectPath: string,
  ) {}

  registerStrategy(name: Strategies, strategy: EndpointStrategy): void {
    this.strategies[name] = strategy
  }

  createEndpoints(
    strategyName: Strategies,
    config?: Record<string, unknown> | undefined,
  ): Endpoint[] {
    const strategy = this.strategies[strategyName]
    if (!strategy) {
      throw new Error(`Strategy "${strategyName}" not found.`)
    }
    return strategy.createEndpoints({
      pluginType: this.pluginType,
      allowOAuthAutoSignUp: this.allowOAuthAutoSignUp,
      useAdmin: this.useAdmin,
      collections: this.collections,
      successRedirectPath: this.successRedirectPath,
      errorRedirectPath: this.errorRedirectPath,
      ...config,
    })
  }
}
