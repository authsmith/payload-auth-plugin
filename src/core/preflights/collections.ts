import { CollectionConfig } from "payload"
import {
  InvalidCollectionSlug,
  MissingCollections,
} from "../errors/consoleErrors.js"

export function preflightCollectionCheck(
  slugs: string[],
  collections: CollectionConfig[] | undefined,
) {
  if (!collections?.length) {
    throw new MissingCollections()
  }
  slugs.forEach((slug) => {
    if (!collections.some((c) => c.slug === slug)) {
      throw new InvalidCollectionSlug()
    }
  })
  return
}
