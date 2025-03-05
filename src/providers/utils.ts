import { ProviderAlreadyExists } from "../core/errors/consoleErrors.js"
import { ProvidersConfig } from "../types.js"

export function mapProviders(providers: ProvidersConfig[]) {
  const providerRecords = providers.reduce(
    (record: Record<string, ProvidersConfig>, provider: ProvidersConfig) => {
      if (record[provider.id]) {
        throw new ProviderAlreadyExists()
      }
      const newRecord = {
        ...record,
        [provider.id]: provider,
      }
      return newRecord
    },
    {},
  )
  return providerRecords
}

/**
 * Helper function to extract name parts from a full name
 * @param fullName The full name to parse
 * @returns An object with firstName and lastName properties
 */
export function extractNameParts(fullName: string): {
  firstName?: string
  lastName?: string
} {
  if (!fullName) return {}

  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) {
    return { firstName: parts[0] }
  } else if (parts.length > 1) {
    const firstName = parts[0]
    const lastName = parts.slice(1).join(" ")
    return { firstName, lastName }
  }

  return {}
}

/**
 * Enhanced profile mapper that extracts additional fields from OAuth profiles
 * @param profile The profile data from the OAuth provider
 * @param options Additional mapping options
 * @returns A standardized AccountInfo object
 */
export function enhancedProfileMapper(
  profile: Record<string, any>,
  options: {
    subField?: string
    nameField?: string
    emailField?: string
    pictureField?: string
    firstNameField?: string
    lastNameField?: string
  } = {},
) {
  const {
    subField = "id",
    nameField = "name",
    emailField = "email",
    pictureField = "picture",
    firstNameField = "given_name",
    lastNameField = "family_name",
  } = options

  // Get the basic fields
  const sub = profile[subField]?.toString() || ""
  const name = profile[nameField]?.toString() || ""
  const email = profile[emailField]?.toString() || ""
  const picture = profile[pictureField]?.toString() || ""

  // Try to get firstName and lastName directly from the profile
  let firstName = profile[firstNameField]?.toString() || ""
  let lastName = profile[lastNameField]?.toString() || ""

  // If firstName or lastName are not available, try to extract them from the full name
  if (!firstName || !lastName) {
    const nameParts = extractNameParts(name)
    firstName = firstName || nameParts.firstName || ""
    lastName = lastName || nameParts.lastName || ""
  }

  return {
    sub,
    name,
    email,
    picture,
    firstName,
    lastName,
  }
}
