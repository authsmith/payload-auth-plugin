import type {
  BasePayload,
  Config,
  Endpoint,
  PayloadRequest,
  Plugin,
} from "payload"
import {
  EndpointsFactory,
  OAuthEndpointStrategy,
  PasskeyEndpointStrategy,
} from "../core/endpoints.js"
import type { AccountInfo, ProvidersConfig } from "../types.js"
import { PayloadSession } from "../core/session/payload.js"
import { InvalidServerURL } from "../core/errors/consoleErrors.js"
import { getOAuthProviders, getPasskeyProvider } from "../providers/utils.js"
import { preflightCollectionCheck } from "../core/preflights/collections.js"

interface PluginOptions {
  /* Enable or disable plugin
   * @default true
   */
  enabled?: boolean
  /*
   * OAuth Providers
   */
  providers: ProvidersConfig[]

  /*
   * Accounts collections config
   */
  accountsCollectionSlug: string

  /* Enable or disable user creation. WARNING: If applied to your admin users collection it will allow ANYONE to sign up as an admin.
   * @default false
   */
  allowSignUp?: boolean
}

export const adminAuthPlugin =
  (pluginOptions: PluginOptions): Plugin =>
  (incomingConfig: Config): Config => {
    const config = { ...incomingConfig }

    if (pluginOptions.enabled === false) {
      return config
    }

    if (!config.serverURL) {
      throw new InvalidServerURL()
    }

    const { accountsCollectionSlug, providers, allowSignUp } = pluginOptions

    preflightCollectionCheck(
      [config.admin?.user!, accountsCollectionSlug],
      config.collections,
    )

    config.admin = {
      ...(config.admin ?? {}),
    }

    const session = new PayloadSession(
      {
        accountsCollectionSlug: accountsCollectionSlug,
        usersCollectionSlug: config.admin.user!,
      },
      allowSignUp,
    )

    const oauthProviders = getOAuthProviders(providers)
    const passkeyProvider = getPasskeyProvider(providers)

    const endpointsFactory = new EndpointsFactory("admin")

    let oauthEndpoints: Endpoint[] = []
    let passkeyEndpoints: Endpoint[] = []

    if (Object.keys(oauthProviders).length > 0) {
      endpointsFactory.registerStrategy(
        "oauth",
        new OAuthEndpointStrategy(oauthProviders),
      )
      oauthEndpoints = endpointsFactory.createEndpoints("oauth", {
        sessionCallback: (
          oauthAccountInfo: AccountInfo,
          scope: string,
          issuerName: string,
          request: PayloadRequest,
        ) =>
          session.createSession(oauthAccountInfo, scope, issuerName, request),
      })
    }

    if (passkeyProvider) {
      endpointsFactory.registerStrategy(
        "passkey",
        new PasskeyEndpointStrategy(),
      )
      passkeyEndpoints = endpointsFactory.createEndpoints("passkey")
    }

    config.endpoints = [
      ...(config.endpoints ?? []),
      ...oauthEndpoints,
      ...passkeyEndpoints,
    ]
    return config
  }
