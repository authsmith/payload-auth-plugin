export const formatSlug = (val) => val
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "")
    .toLowerCase();
//# sourceMappingURL=slug.js.map