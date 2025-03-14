import { ProviderAlreadyExists } from "../core/errors/consoleErrors.js"
import {
  ProvidersConfig,
  OAuthProviderConfig,
  PasskeyProviderConfig,
  PasswordProviderConfig,
} from "../types.js"

/**
 * Reducer function to extract the OAuth providers
 *
 * @internal
 * @param {ProvidersConfig[]} providers
 * @returns {Record<string, OAuthProviderConfig>}
 */
export function getOAuthProviders(
  providers: ProvidersConfig[],
): Record<string, OAuthProviderConfig> {
  const records: Record<string, OAuthProviderConfig> = {}
  providers.map((provider: ProvidersConfig) => {
    if (records[provider.id]) {
      throw new ProviderAlreadyExists()
    }
    if (provider.kind === "oauth") {
      records[provider.id] = provider
    }
  })
  return records
}

/**
 * Function to get the Passkey provider
 *
 * @export
 * @param {ProvidersConfig[]} providers
 * @returns {(PasskeyProviderConfig | null)}
 */
export function getPasskeyProvider(
  providers: ProvidersConfig[],
): PasskeyProviderConfig | null {
  const passkeyProvider = providers.find(
    (provider) => provider.kind === "passkey",
  )
  if (passkeyProvider) {
    return passkeyProvider
  }
  return null
}

/**
 * Function to get the Password provider
 *
 * @internal
 */
export function getPasswordProvider(
  providers: ProvidersConfig[],
): PasswordProviderConfig | null {
  const provider = providers.find((provider) => provider.kind === "password")
  if (provider) {
    return provider
  }
  return null
}
