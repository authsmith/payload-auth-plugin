import { CollectionConfig, Field } from "payload"
import { MissingCollectionSlug } from "../core/errors/consoleErrors.js"

export const withAppUsersCollection = (
  incomingCollection: CollectionConfig,
): CollectionConfig => {
  if (!incomingCollection.slug) {
    throw new MissingCollectionSlug()
  }
  const baseFields: Field[] = [
    {
      name: "name",
      type: "text",
    },
    {
      name: "email",
      type: "email",
      unique: true,
      required: true,
    },
    {
      name: "hashedPassword",
      type: "text",
      unique: true,
    },
    {
      name: "salt",
      type: "text",
      unique: true,
    },
    {
      name: "hashIterations",
      type: "number",
    },
  ]
  incomingCollection.fields = [
    ...baseFields,
    ...(incomingCollection.fields ?? []),
  ]
  incomingCollection.access = {
    admin: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
    read: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    ...(incomingCollection.access ?? {}),
  }
  incomingCollection.admin = {
    defaultColumns: ["name", "email"],
    useAsTitle: "name",
    ...incomingCollection.admin,
  }
  incomingCollection.timestamps = true

  return incomingCollection
}

export const withAppAccountCollection = (
  incomingCollection: CollectionConfig,
): CollectionConfig => {
  if (!incomingCollection.slug) {
    throw new MissingCollectionSlug()
  }
  const baseFields: Field[] = [
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
      relationTo: "appUsers",
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
  ]

  incomingCollection.fields = [
    ...baseFields,
    ...(incomingCollection.fields ?? []),
  ]

  incomingCollection.access = {
    admin: ({ req: { user } }) => Boolean(user),
    read: ({ req: { user } }) => Boolean(user),
    create: () => false,
    update: () => false,
    delete: () => true,
    ...(incomingCollection.access ?? {}),
  }
  incomingCollection.admin = {
    defaultColumns: ["issuerName", "scope", "user"],
    useAsTitle: "id",
    ...incomingCollection.admin,
  }
  incomingCollection.timestamps = true
  return incomingCollection
}
