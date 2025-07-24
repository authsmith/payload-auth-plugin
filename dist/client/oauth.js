/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
export const oauth = (options, provider) => {
    const oauthURL = `${options.baseURL}/api/${options.name}/oauth/authorization/${provider}${options.redirectUrl ? `?state=${encodeURIComponent(JSON.stringify({ redirectUrl: options.redirectUrl }))}` : ""}`;
    window.location.href = oauthURL;
};
//# sourceMappingURL=oauth.js.map