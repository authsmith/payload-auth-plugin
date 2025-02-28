import { CollectionConfig } from "payload"
import { PasskeyFields } from "./accounts/passkeyFields.js"

export function buildAccountsCollection(
  account: {
    slug: string
    hidden: boolean
  },
  relationConfig: {
    fieldName: string
    relationTo: string
    hasMany: boolean
    required: boolean
    label: string
  }
) {
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
    fields: [
      {
        name: "name",
        type: "text"
      },
      {
        name: "picture",
        type: "text"
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
          condition: (_data, peerData) => {
            if (peerData.issuerName === "Passkey") {
              return true
            }
            return false
          }
        }
      }
    ]
  }
  return accountsCollection
}
