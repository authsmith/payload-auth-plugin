export const deleteLinkedAccounts = (accountsSlug) => async (args) => {
    const { payload } = args.req;
    const { doc: user } = args;
    await payload.delete({
        collection: accountsSlug,
        where: {
            user: { equals: user["id"] },
        },
    });
};
//# sourceMappingURL=hooks.js.map