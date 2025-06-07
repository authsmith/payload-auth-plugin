/**
 * The App plugin is used for authenticating users in the frontent app of the Payload CMS application.
 * It support magic link, password, OAuth, and Passkey based authentications.
 *
 * On top of it, to add additional security it also support 2FA using OTP, and TOTP.
 *
 * The set up is very lean and flexible to tailor the auth process in a specific way.
 *
 * ```ts
 * import {authPlugin} from "payload-auth-plugin";
 *
 * export const plugins = [
 *  authPlugin({
 *    name: "a-unique-name",
 *    usersCollectionSlug: "users-collection-slug",
 *    accountsCollectionSlug: "accounts-collection-slug",
 *    providers:[]
 *  })
 * ]
 *
 * ```
 * @packageDocumentation
 */

import type { Config, Endpoint, PayloadRequest, Plugin } from "payload"
import type {
  PasswordProviderConfig,
  OAuthProviderConfig,
  PasskeyProviderConfig,
} from "./types.js"
import {
  InvalidServerURL,
  MissingEmailAdapter,
} from "./core/errors/consoleErrors.js"
import {
  getPasswordProvider,
  getOAuthProviders,
  getPasskeyProvider,
} from "./providers/utils.js"
import {
  PasswordAuthEndpointStrategy,
  EndpointsFactory,
  OAuthEndpointStrategy,
  PasskeyEndpointStrategy,
  SessionEndpointStrategy,
} from "./core/endpoints.js"
import { formatSlug } from "./core/utils/slug.js"
import { preflightCollectionCheck } from "./core/preflights/collections.js"

/**
 * Adds authentication to the Payload app.
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
   * This name will be used to created endpoints, tokens, and etc.
   * For example, if you want to pass
   */
  name: string

  /**
   *
   * Enable authuentication only-for Admin
   *
   */

  useAdmin?: boolean | undefined

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
   * Users collection slug.
   *
   * The collection to store all the user records.
   *
   */
  usersCollectionSlug: string

  /**
   * User accounts collection slug.
   *
   * The collection to store all the account records thant belongs to a user.
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
  allowOAuthAutoSignUp?: boolean | undefined

  /**
   * Path to redirect upon successful signin, signups and etc
   *
   * Example: /dashboard or /admin or /profile
   */
  successRedirectPath: string

  /**
   * Path to redirect upon failed signin, signups and etc.
   *
   * Example: /dashboard or /admin or /profile
   */
  errorRedirectPath: string
}

export const authPlugin =
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
      allowOAuthAutoSignUp,
      useAdmin,
      successRedirectPath,
      errorRedirectPath,
    } = pluginOptions

    preflightCollectionCheck(
      [usersCollectionSlug, accountsCollectionSlug],
      config.collections,
    )

    const name = formatSlug(pluginOptions.name)

    const oauthProviders = getOAuthProviders(providers)
    const passkeyProvider = getPasskeyProvider(providers)
    const passwordProvider = getPasswordProvider(providers)

    const endpointsFactory = new EndpointsFactory(
      name,
      {
        usersCollection: usersCollectionSlug,
        accountsCollection: accountsCollectionSlug,
      },
      allowOAuthAutoSignUp ?? false,
      !!useAdmin,
      successRedirectPath,
      errorRedirectPath,
    )

    let oauthEndpoints: Endpoint[] = []
    let passkeyEndpoints: Endpoint[] = []
    let passwordEndpoints: Endpoint[] = []

    if (Object.keys(oauthProviders).length > 0) {
      endpointsFactory.registerStrategy(
        "oauth",
        new OAuthEndpointStrategy(oauthProviders),
      )
      oauthEndpoints = endpointsFactory.createEndpoints("oauth")
    }

    if (passkeyProvider) {
      endpointsFactory.registerStrategy(
        "passkey",
        new PasskeyEndpointStrategy(),
      )
      passkeyEndpoints = endpointsFactory.createEndpoints("passkey")
    }

    if (passwordProvider) {
      if (!config.email) {
        throw new MissingEmailAdapter()
      }
      endpointsFactory.registerStrategy(
        "password",
        new PasswordAuthEndpointStrategy({ usersCollectionSlug }),
      )
      passwordEndpoints = endpointsFactory.createEndpoints("password")
    }

    endpointsFactory.registerStrategy(
      "session",
      new SessionEndpointStrategy({ usersCollectionSlug }),
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
