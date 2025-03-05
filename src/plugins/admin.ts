import type { Config, Plugin, Field } from "payload"
import { EndpointFactory } from "../core/endpoints.js"
import { ProvidersConfig } from "../types.js"
import { PayloadSession } from "../core/session/payload.js"
import {
  InvalidServerURL,
  MissingCollectionError,
} from "../core/errors/consoleErrors.js"
import { buildAccountsCollection } from "../core/collections/admin/accounts.js"
import { mapProviders } from "../providers/utils.js"

// Updated interface to support flexible relation configuration
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
    // Add support for custom fields
    additionalFields?: Field[]
  }

  /* 
   * Relation configuration for the accounts collection
   * This allows linking OAuth accounts to any collection (users, customers, etc.)
   */
  relationConfig: {
    fieldName: string           // The field name in the accounts collection (e.g., "user", "customer")
    relationTo: string          // The collection slug to relate to (e.g., "users", "customers")
    collectionField: string     // The field in the related collection to use for lookup (typically "email")
    hasMany: boolean            // Whether this relation can have multiple items
    required: boolean           // Whether this relation is required
    label: string               // The label for this relation in the admin UI
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

    // Set default relation config if not provided
    const relationConfig = pluginOptions.relationConfig || {
      fieldName: "user",
      relationTo: config.admin?.user || "users",
      collectionField: "email",
      hasMany: false,
      required: true,
      label: "User"
    };

    // Verify the related collection exists
    const relatedCollectionExists = config.collections?.some(
      collection => typeof collection === "object" && collection.slug === relationConfig.relationTo
    );
    
    if (!relatedCollectionExists && !config.admin?.user) {
      throw new MissingCollectionError(`Collection '${relationConfig.relationTo}' not found`);
    }

    config.admin = {
      ...(config.admin ?? {}),
    }

    const { accounts, providers, allowSignUp, successPath } = pluginOptions

    const session = new PayloadSession(
      {
        accountsCollectionSlug: accounts?.slug ?? "accounts",
        relationConfig
      },
      allowSignUp,
      successPath,
    )
    const mappedProviders = mapProviders(providers)
    const endpoints = new EndpointFactory(mappedProviders)

    // Create accounts collection if doesn't exists
    config.collections = [
      ...(config.collections ?? []),
      buildAccountsCollection(
        {
          slug: accounts?.slug ?? "accounts",
          hidden: accounts?.hidden ?? false,
          additionalFields: accounts?.additionalFields
        },
        {
          fieldName: relationConfig.fieldName,
          relationTo: relationConfig.relationTo,
          hasMany: relationConfig.hasMany,
          required: relationConfig.required,
          label: relationConfig.label
        }
      ),
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