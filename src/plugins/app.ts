/**
 * The App plugin is used for authenticating users in the frontent app of the Payload CMS application.
 * It support magic link, password, OAuth, and Passkey based authentications.
 *
 * On top of it, to add additional security it also support 2FA using OTP, and TOTP.
 *
 * The set up is very lean and flexible to tailor the auth process in a specific way.
 *
 * ```ts
 * import {appAuthPlugin} from "payload-auth-plugin";
 *
 * // TODO: Need complete implementation
 *
 * ```
 * @packageDocumentation
 */

import { Config, Endpoint, PayloadRequest, Plugin } from "payload"
import {
  AccountInfo,
  AuthenticationStrategy,
  PasswordProviderConfig,
  OAuthProviderConfig,
  PasskeyProviderConfig,
} from "../types.js"
import {
  InvalidServerURL,
  MissingEmailAdapter,
} from "../core/errors/consoleErrors.js"
import {
  getPasswordProvider,
  getOAuthProviders,
  getPasskeyProvider,
} from "../providers/utils.js"
import {
  PasswordAuthEndpointStrategy,
  EndpointsFactory,
  OAuthEndpointStrategy,
  PasskeyEndpointStrategy,
  SessionEndpointStrategy,
} from "../core/endpoints.js"
import { AppSession } from "../core/session/app.js"
import { formatSlug } from "../core/utils/slug.js"
import { preflightCollectionCheck } from "../core/preflights/collections.js"

/**
 * The App plugin to set up authentication to the intengrated frontend of Payload CMS.
 *
 * Add the plugin to your Payload project plugins.
 *
 */
interface PluginOptions {
  /**
   * Enable or disable plugin
   *
   * @default true
   *
   */
  enabled?: boolean | undefined

  /**
   * Unique name for your frontend app.
   *
   * This name will be used to created endpoints, tokens, and etc.
   */
  name: string

  /**
   * Auth providers supported by the plugin
   *
   */
  providers: (
    | OAuthProviderConfig
    | PasskeyProviderConfig
    | PasswordProviderConfig
  )[]

  /**
   * @description
   * App users collection slug.
   *
   * This collection will be used to store all the app user records.
   *
   */
  usersCollectionSlug: string

  /**
   * App user accounts collection slug.
   *
   * This collection will be used to store all the app user account records.
   * Multiple accounts can belong to one user
   *
   */
  accountsCollectionSlug: string

  /**
   * Allow auto signup if user doesn't have an account.
   *
   * @default false
   *
   */
  allowAutoSignUp?: boolean | undefined

  /**
   * Authentication strategies can be either JWT or Cookie based
   *
   * @default Cookie
   *
   */
  authenticationStrategy?: AuthenticationStrategy
  /**
   * Secret to use for JWT signing and decryption
   */
  secret: string
}

/**
 * App plugin funtion.
 *
 * @param {PluginOptions} pluginOptions
 * @returns {Plugin}
 */
export const appAuthPlugin =
  (pluginOptions: PluginOptions): Plugin =>
  (incomingConfig: Config): Config => {
    const config = { ...incomingConfig }

    if (pluginOptions.enabled === false) {
      return config
    }

    if (!config.serverURL) {
      throw new InvalidServerURL()
    }

    const {
      usersCollectionSlug,
      accountsCollectionSlug,
      providers,
      allowAutoSignUp,
      authenticationStrategy,
      secret,
    } = pluginOptions

    preflightCollectionCheck(
      [usersCollectionSlug, accountsCollectionSlug],
      config.collections,
    )

    const name = formatSlug(pluginOptions.name)

    const oauthProviders = getOAuthProviders(providers)
    const passkeyProvider = getPasskeyProvider(providers)
    const passwordProvider = getPasswordProvider(providers)

    const session = new AppSession(
      name,
      {
        usersCollection: usersCollectionSlug,
        accountsCollection: accountsCollectionSlug,
      },
      allowAutoSignUp ?? false,
      authenticationStrategy ?? "Cookie",
      secret,
    )

    const endpointsFactory = new EndpointsFactory(name)

    let oauthEndpoints: Endpoint[] = []
    let passkeyEndpoints: Endpoint[] = []
    let passwordEndpoints: Endpoint[] = []

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
          session.oauthSessionCallback(
            oauthAccountInfo,
            scope,
            issuerName,
            request,
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

    if (passwordProvider) {
      if (!!!config.email) {
        throw new MissingEmailAdapter()
      }
      endpointsFactory.registerStrategy(
        "password",
        new PasswordAuthEndpointStrategy({ usersCollectionSlug }, secret),
      )
      passwordEndpoints = endpointsFactory.createEndpoints("password", {
        sessionCallback: (user: { id: string; email: string }) =>
          session.passwordSessionCallback(user),
      })
    }

    endpointsFactory.registerStrategy(
      "session",
      new SessionEndpointStrategy(secret, { usersCollectionSlug }),
    )
    const sessionEndpoints = endpointsFactory.createEndpoints("session")

    config.endpoints = [
      ...(config.endpoints ?? []),
      ...oauthEndpoints,
      ...passkeyEndpoints,
      ...passwordEndpoints,
      ...sessionEndpoints,
    ]
    return config
  }
