import { CollectionConfig, Field } from "payload"
import { PasskeyFields } from "./accounts/passkeyFields.js"

export function buildAccountsCollection(
  account: {
    slug: string
    hidden: boolean
    additionalFields?: Field[]
  },
  relationConfig: {
    fieldName: string
    relationTo: string
    hasMany: boolean
    required: boolean
    label: string
  }
) {
  const defaultFields: Field[] = [
    {
      name: "name",
      type: "text"
    },
    {
      name: "picture",
      type: "text"
    },
    {
      name: "firstName",
      type: "text",
      admin: {
        description: "First name from OAuth provider if available"
      }
    },
    {
      name: "lastName",
      type: "text",
      admin: {
        description: "Last name from OAuth provider if available"
      }
    },
    {
      name: "email",
      type: "text",
      admin: {
        description: "Email from OAuth provider"
      }
    },
    {
      name: relationConfig.fieldName,
      type: "relationship",
      relationTo: relationConfig.relationTo,
      ...(relationConfig.hasMany ? { hasMany: true } : { hasMany: false }),
      required: relationConfig.required,
      label: relationConfig.label
    },
    {
      name: "issuerName",
      type: "text",
      required: true,
      label: "Issuer Name"
    },
    {
      name: "scope",
      type: "text"
    },
    {
      name: "sub",
      type: "text",
      required: true
    },
    {
      name: "passkey",
      type: "group",
      fields: PasskeyFields,
      admin: {
        condition: (_data: any, peerData: any) => {
          if (peerData.issuerName === "Passkey") {
            return true
          }
          return false
        }
      }
    }
  ]

  const allFields = account.additionalFields
    ? [...defaultFields, ...account.additionalFields]
    : defaultFields

  const accountsCollection: CollectionConfig = {
    slug: account.slug,
    admin: {
      useAsTitle: "id",
      hidden: account.hidden
    },
    access: {
      read: ({ req: { user } }) => Boolean(user),
      create: () => false,
      update: () => false,
      delete: () => false
    },
    fields: allFields
  }
  return accountsCollection
}
