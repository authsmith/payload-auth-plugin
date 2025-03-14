import { CollectionConfig } from "payload"

interface UsersCollection {
  /**
   * Collection name
   *
   * @type {string}
   */
  name: string
  /**
   * Collection slug but optional
   *
   * @type {?string}
   */
  slug?: string | undefined
  /**
   * Hide the collection but optional. Not hidden by default
   *
   * @type {?(boolean | undefined)}
   */
  hidden?: boolean | undefined
}

export const buildUsersCollection = ({
  collection,
}: {
  collection: UsersCollection
}) => {
  return {
    slug: collection.slug ?? "app-users",
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
        name: "email",
        type: "email",
        required: true,
      },
      {
        name: "password",
        type: "text",
      },
    ],
  } satisfies CollectionConfig
}
