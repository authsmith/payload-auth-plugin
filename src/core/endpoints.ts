import type { BasePayload, Endpoint, PayloadRequest } from "payload"
import type {
  AccountInfo,
  OAuthProviderConfig,
  ProvidersConfig,
} from "../types.js"
import { OAuthHandlers } from "./routeHandlers/oauth.js"
import { PasskeyHandlers } from "./routeHandlers/passkey.js"

export class EndpointFactory {
  readonly #providers: Record<string, ProvidersConfig>
  readonly #payloadOAuthPath: string = "/admin/oauth/:resource/:provider"
  readonly #payloadPasskeyPath: string = "/admin/passkey/:resource"
  constructor(providers: Record<string, ProvidersConfig>) {
    this.#providers = providers
  }
  payloadOAuthEndpoints({
    sessionCallback,
  }: {
    sessionCallback: (
      oauthAccountInfo: AccountInfo,
      scope: string,
      issuerName: string,
      payload: BasePayload,
    ) => Promise<Response>
  }): Endpoint[] {
    return [
      {
        path: this.#payloadOAuthPath,
        method: "get",
        handler: (request: PayloadRequest) => {
          const provider = this.#providers[
            request.routeParams?.provider as string
          ] as OAuthProviderConfig

          return OAuthHandlers(
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
  payloadPasskeyEndpoints({
    rpID,
    sessionCallback,
  }: {
    rpID: string
    sessionCallback: (
      accountInfo: AccountInfo,
      issuerName: string,
      payload: BasePayload,
    ) => Promise<Response>
  }): Endpoint[] {
    return [
      {
        path: this.#payloadPasskeyPath,
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
