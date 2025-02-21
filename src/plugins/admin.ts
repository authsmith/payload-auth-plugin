import type { Collection, CollectionConfig, Config, Plugin, CollectionAfterDeleteHook } from "payload"
import { EndpointFactory } from "../core/endpoints.js"
import { ProvidersConfig } from "../types.js"
import { PayloadSession } from "../core/session/payload.js"
import {
  InvalidServerURL,
  MissingUsersCollection,
} from "../core/errors/consoleErrors.js"
import { buildAccountsCollection } from "../core/collections/admin/accounts.js"
import { mapProviders } from "../providers/utils.js"

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
    const mappedProviders = mapProviders(providers)
    const endpoints = new EndpointFactory(mappedProviders)


    const addUserCollectionHook = (
      collections: CollectionConfig[] | undefined,
      collectionSlug: string,
      accountsSlug: string | undefined,
    ): CollectionConfig[] => {
      
      if (!collections) return []
      
      const userCollectionIndex = collections.findIndex(
        (collection) => collection.slug === collectionSlug,
      )

      if (userCollectionIndex === -1) {
        return collections // Return collections unchanged if not found
      }

      const afterDeleteHook: CollectionAfterDeleteHook = async ({
        req,
        id,
      }) => {
        const payload = req.payload
        const accounts = await payload.find({
          collection: accountsSlug ?? "accounts",
          where: { user: { equals: id } },
        })
        
        for (const account of accounts.docs) {
          await payload.delete({
            collection: accountsSlug ?? "accounts",
            id: account.id,
          })
        }
      }

      // Clone the collection to avoid mutating the original
      const updatedCollection = {
        ...collections[userCollectionIndex],
        hooks: {
          ...collections[userCollectionIndex].hooks,
          afterDelete: [
            ...(collections[userCollectionIndex].hooks?.afterDelete ?? []),
            afterDeleteHook,
          ],
        },
      }

      // Return updated collections with the modified user collection
      return collections.map((collection, index) =>
        index === userCollectionIndex ? updatedCollection : collection,
      )
    }
    
    // Create accounts collection if doesn't exists
    config.collections = [
      ...(addUserCollectionHook(config.collections, config.admin.user!, accounts?.slug) ?? []),
      buildAccountsCollection(
        {
          slug: accounts?.slug ?? "accounts",
          hidden: accounts?.hidden ?? false,
        },
        config.admin.user!,
      )
    ]

    config.endpoints = [
      ...(config.endpoints ?? []),
      ...endpoints.payloadOAuthEndpoints({
        sessionCallback: (oauthAccountInfo, scope, issuerName, basePayload) =>
          session.createSession(
            oauthAccountInfo,
            scope,
            issuerName,
            basePayload,
          ),
      }),
    ]
    if (mappedProviders["passkey"]) {
      config.endpoints.push(
        ...endpoints.payloadPasskeyEndpoints({
          rpID: "localhost",
          sessionCallback: (accountInfo, issuerName, basePayload) =>
            session.createSession(accountInfo, "", issuerName, basePayload),
        }),
      )
    }
    return config
  }
