import { CollectionConfig, Field } from "payload"
import { MissingCollectionSlug } from "../core/errors/consoleErrors.js"

/**
 * A higher order function that takes the collection config for the argument
 * @param incomingCollection
 * @returns {CollectionConfig}
 */
export const withAppUsersCollection = (
  incomingCollection: Omit<CollectionConfig, "fields"> & {
    fields?: Field[] | undefined
  },
): CollectionConfig => {
  if (!incomingCollection.slug) {
    throw new MissingCollectionSlug()
  }

  const collectionConfig: CollectionConfig = {
    ...incomingCollection,
    fields: [],
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
  collectionConfig.fields = [
    ...baseFields,
    ...(incomingCollection.fields ?? []),
  ]
  collectionConfig.access = {
    admin: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
    read: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    ...(incomingCollection.access ?? {}),
  }
  collectionConfig.admin = {
    defaultColumns: ["name", "email"],
    useAsTitle: "name",
    ...incomingCollection.admin,
  }
  collectionConfig.timestamps = true

  return collectionConfig
}

/**
 * A higher order function that takes the collection config and a Users collection slug for the arguments
 * @param incomingCollection
 * @param userCollectionSlug
 * @returns {CollectionConfig}
 */
export const withAppAccountCollection = (
  incomingCollection: Omit<CollectionConfig, "fields"> & {
    fields?: Field[] | undefined
  },
  usersCollectionSlug: string,
): CollectionConfig => {
  if (!incomingCollection.slug) {
    throw new MissingCollectionSlug()
  }

  const collectionConfig: CollectionConfig = {
    ...incomingCollection,
    fields: [],
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
      relationTo: usersCollectionSlug,
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

  collectionConfig.fields = [
    ...baseFields,
    ...(incomingCollection.fields ?? []),
  ]

  collectionConfig.access = {
    admin: ({ req: { user } }) => Boolean(user),
    read: ({ req: { user } }) => Boolean(user),
    create: () => false,
    update: () => false,
    delete: () => true,
    ...(incomingCollection.access ?? {}),
  }
  collectionConfig.admin = {
    defaultColumns: ["issuerName", "scope", "user"],
    useAsTitle: "id",
    ...incomingCollection.admin,
  }
  collectionConfig.timestamps = true
  return collectionConfig
}
