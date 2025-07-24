import type { CollectionConfig, Field } from "payload";
/**
 * A higher order function that takes the collection config for the argument
 * @param incomingCollection
 * @returns {CollectionConfig}
 */
export declare const withUsersCollection: (incomingCollection: Omit<CollectionConfig, "fields"> & {
    fields?: Field[] | undefined;
}) => CollectionConfig;
/**
 * A higher order function that takes the collection config and a Users collection slug for the arguments
 * @param incomingCollection
 * @param userCollectionSlug
 * @returns {CollectionConfig}
 */
export declare const withAccountCollection: (incomingCollection: Omit<CollectionConfig, "fields"> & {
    fields?: Field[] | undefined;
}, usersCollectionSlug: string) => CollectionConfig;
//# sourceMappingURL=index.d.ts.map