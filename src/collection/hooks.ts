import { CollectionAfterDeleteHook } from "payload"

export const deleteLinkedAccounts =
  (accountsSlug: string): CollectionAfterDeleteHook =>
  async (args) => {
    const { payload } = args.req
    const { doc: user } = args
    await payload.delete({
      collection: accountsSlug,
      where: {
        user: { equals: user["id"] },
      },
    })
  }
