import type { BasePayload, Config, Endpoint, Plugin } from "payload"
import {
  EndpointsFactory,
  OAuthEndpointStrategy,
  PasskeyEndpointStrategy,
} from "../core/endpoints.js"
import type { AccountInfo, ProvidersConfig } from "../types.js"
import { PayloadSession } from "../core/session/payload.js"
import {
  InvalidServerURL,
  MissingUsersCollection,
} from "../core/errors/consoleErrors.js"
import { getOAuthProviders, getPasskeyProvider } from "../providers/utils.js"

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
  accounts?: {
    slug?: string | undefined
    hidden?: boolean | undefined
  }

  /*
   * Path to be redirected to upon successful login
   * @defuault /admin
   */
  successPath?: string

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

    if (!config.admin?.user) {
      throw new MissingUsersCollection()
    }

    config.admin = {
      ...(config.admin ?? {}),
    }

    const { accounts, providers, allowSignUp, successPath } = pluginOptions

    const session = new PayloadSession(
      {
        accountsCollectionSlug: accounts?.slug ?? "accounts",
        usersCollectionSlug: config.admin.user!,
      },
      allowSignUp,
      successPath,
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
          basePayload: BasePayload,
        ) =>
          session.createSession(
            oauthAccountInfo,
            scope,
            issuerName,
            basePayload,
          ),
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
