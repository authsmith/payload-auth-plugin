import { CollectionConfig } from "payload"
import { InvalidCollectionSlug } from "../errors/consoleErrors.js"

export function preflightCollectionCheck(
  slug: string,
  collections: CollectionConfig[],
) {
  if (!collections.some((c) => c.slug === slug)) {
    throw new InvalidCollectionSlug()
  }
  return
}
