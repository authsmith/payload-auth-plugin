/**
 * The App plugin is used for authenticating users in the frontent app of the Payload CMS application.
 * It support magic link, credentials, OAuth, and Passkey based authentications.
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

import { BasePayload, Config, Endpoint, Plugin } from "payload"
import {
  AccountInfo,
  OAuthProviderConfig,
  PasskeyProviderConfig,
} from "../types.js"
import {
  InvalidServerURL,
  MissingCollections,
} from "../core/errors/consoleErrors.js"
import { getOAuthProviders, getPasskeyProvider } from "../providers/utils.js"
import {
  EndpointsFactory,
  OAuthEndpointStrategy,
  PasskeyEndpointStrategy,
} from "../core/endpoints.js"
import { AppSession } from "../core/session/app.js"
import { formatSlug } from "../core/utils/slug.js"
import { PluginError } from "../error.js"
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
  providers: (OAuthProviderConfig | PasskeyProviderConfig)[]
  /**
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
   * App user session collection slug.
   *
   * This collection will be used to store all the app user session records.
   *
   */
  sessionsCollectionSlug: string

  /**
   * Allow auto signup if user doesn't have an account.
   *
   * @default false
   *
   */
  allowAutoSignUp?: boolean | undefined

  /**
   * On success callback. This will be triggred upon successfull signin.
   *
   * Use it to redirect users to some page after signin
   *
   */
  onSuccess: (user: unknown) => void

  /**
   * On error callback. This will be triggred upon signup or signin failures.
   *
   * Handle errors and show error messages to the user
   */
  onError: (err: PluginError) => void
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

    if (!config.collections?.length) {
      throw new MissingCollections()
    }

    const {
      usersCollectionSlug,
      accountsCollectionSlug,
      sessionsCollectionSlug,
      providers,
      allowAutoSignUp,
      onSuccess,
      onError,
    } = pluginOptions

    preflightCollectionCheck(usersCollectionSlug, config.collections)
    preflightCollectionCheck(accountsCollectionSlug, config.collections)
    preflightCollectionCheck(sessionsCollectionSlug, config.collections)

    const name = formatSlug(pluginOptions.name)
    const oauthProviders = getOAuthProviders(providers)
    const passkeyProvider = getPasskeyProvider(providers)

    const session = new AppSession(
      name,
      {
        usersCollection: usersCollectionSlug,
        accountsCollection: accountsCollectionSlug,
        sessionsCollection: sessionsCollectionSlug,
      },
      onSuccess,
      onError,
      allowAutoSignUp ?? false,
    )

    const endpointsFactory = new EndpointsFactory(name)

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
          session.oauthSessionCallback(
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
