import type { BasePayload, Endpoint, PayloadRequest } from "payload"
import type { AccountInfo, OAuthProviderConfig } from "../types.js"
import { OAuthHandlers } from "./routeHandlers/oauth.js"
import { PasskeyHandlers } from "./routeHandlers/passkey.js"

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
      payload: BasePayload,
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
 * The generic endpoint factory class
 *
 * @export
 * @class EndpointsFactory
 * @typedef {EndpointsFactory}
 * @internal
 */
export class EndpointsFactory {
  private strategies: Record<string, EndpointStrategy> = {}
  constructor(private pluginType: string) {}

  registerStrategy(
    name: "oauth" | "passkey",
    strategy: EndpointStrategy,
  ): void {
    this.strategies[name] = strategy
  }

  createEndpoints(
    strategyName: "oauth" | "passkey",
    config?: any | undefined,
  ): Endpoint[] {
    const strategy = this.strategies[strategyName]
    if (!strategy) {
      throw new Error(`Strategy "${strategyName}" not found.`)
    }
    return strategy.createEndpoints({ pluginType: this.pluginType, ...config })
  }
}
