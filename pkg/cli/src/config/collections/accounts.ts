export const accountsCollection = (
  accountsCollectionSlug: string,
) => `import { CollectionConfig } from "payload"

export const Accounts: CollectionConfig = {
    slug: '${accountsCollectionSlug}',
    admin: {
      useAsTitle: "id",
      hidden: true
    },
    access: {
      read: ({ req: { user } }) => Boolean(user),
      create: () => false,
      update: () => false,
      delete: () => false,
    },
    fields: [
      {
        name: "name",
        type: "text",
      },
      {
        name: "picture",
        type: "text",
      },
      {
        name: "user",
        type: "relationship",
        relationTo: "users",
        hasMany: false,
        required: true,
        label: "User",
      },
      {
        name: "issuerName",
        type: "text",
        required: true,
        label: "Issuer Name",
      },
      {
        name: "scope",
        type: "text",
      },
      {
        name: "sub",
        type: "text",
        required: true,
      },
      {
        name: "passkey",
        type: "group",
        fields: [
            {
                name: "credentialId",
                type: "text",
                required: true,
            },
            {
                name: "publicKey",
                type: "json",
                required: true,
            },
            {
                name: "counter",
                type: "number",
                required: true,
            },
            {
                name: "transports",
                type: "json",
                required: true,
            },
            {
                name: "deviceType",
                type: "text",
                required: true,
            },
            {
                name: "backedUp",
                type: "checkbox",
                required: true,
            },
        ],
        admin: {
          condition: (_data, peerData) => {
            if (peerData.issuerName === "Passkey") {
              return true
            }
            return false
          },
        },
      },
    ],
  }
`
