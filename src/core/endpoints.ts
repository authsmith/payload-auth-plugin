import type { BasePayload, Endpoint, PayloadRequest } from "payload"
import type { AccountInfo, OAuthProviderConfig } from "../types.js"
import { OAuthHandlers } from "./routeHandlers/oauth.js"
import { PasskeyHandlers } from "./routeHandlers/passkey.js"
import { PasswordAuthHandlers } from "./routeHandlers/password.js"
import { SessionHandlers } from "./routeHandlers/session.js"
import { UserSession } from "./protocols/session.js"
import { APP_COOKIE_SUFFIX } from "../constants.js"
import * as qs from "qs-esm"
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
  createEndpoints(config: any): Endpoint[]
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
    sessionCallback,
  }: {
    pluginType: string
    sessionCallback: (
      oauthAccountInfo: AccountInfo,
      scope: string,
      issuerName: string,
      request: PayloadRequest,
      successRedirect?: string | undefined | null,
      errorRedirect?: string | undefined | null,
    ) => Promise<Response>
  }): Endpoint[] {
    return [
      {
        path: `/${pluginType}/oauth/:resource/:provider`,
        method: "get",
        handler: (request: PayloadRequest) => {
          const provider = this.providers[
            request.routeParams?.provider as string
          ] as OAuthProviderConfig

          return OAuthHandlers(
            pluginType,
            request,
            request.routeParams?.resource as string,
            provider,
            (oauthAccountInfo: any) => {
              return sessionCallback(
                oauthAccountInfo,
                provider.scope,
                provider.name,
                request,
                request.searchParams.get("successRedirect"),
                request.searchParams.get("errorRedirect"),
              )
            },
          )
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
            (accountInfo: any) => {
              return sessionCallback(accountInfo, "Passkey", request.payload)
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
    private secret: string,
  ) {}
  createEndpoints({
    pluginType,
    sessionCallback,
  }: {
    pluginType: string
    sessionCallback: (user: { id: string; email: string }) => Promise<Response>
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
            (user) => sessionCallback(user),
            this.secret,
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
    private secret: string,
    private internals: {
      usersCollectionSlug: string
    },
  ) {}
  createEndpoints({ pluginType }: { pluginType: string }): Endpoint[] {
    return [
      {
        path: `/${pluginType}/session`,
        handler: (request: PayloadRequest) => {
          const query = qs.parse(request.searchParams.toString())

          return UserSession(
            `__${pluginType}-${APP_COOKIE_SUFFIX}`,
            this.secret,
            request,
            this.internals,
            (query["fields"] as string[]) ?? [],
          )
        },
        method: "get",
      },
      {
        path: `/${pluginType}/session/:kind`,
        handler: (request: PayloadRequest) => {
          return SessionHandlers(
            request,
            pluginType,
            request.routeParams?.kind as string,
            this.secret,
          )
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
  constructor(private pluginType: string) {}

  registerStrategy(name: Strategies, strategy: EndpointStrategy): void {
    this.strategies[name] = strategy
  }

  createEndpoints(
    strategyName: Strategies,
    config?: any | undefined,
  ): Endpoint[] {
    const strategy = this.strategies[strategyName]
    if (!strategy) {
      throw new Error(`Strategy "${strategyName}" not found.`)
    }
    return strategy.createEndpoints({ pluginType: this.pluginType, ...config })
  }
}
