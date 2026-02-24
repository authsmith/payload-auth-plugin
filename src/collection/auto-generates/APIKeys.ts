import { CollectionConfig } from "payload"
export const generateAPIKeysCollection = (
  existingCollections: CollectionConfig[],
): CollectionConfig<"apiKeys"> => ({
  slug: "apiKeys",
  access: {
    create: () => true,
    delete: () => true,
    read: () => true,
    update: () => true,
  },
  fields: [
    {
      name: "collections",
      label: "Collections",
      admin: {
        description:
          "Select the collections to protect operations with API Key",
      },
      type: "array",
      fields: [
        {
          name: "collection",
          type: "select",
          options: existingCollections.map((col) => ({
            label: (col.labels?.plural ?? col.labels?.singular) as string,
            value: col.slug,
          })),
        },
      ],
    },
  ],
})
