export function getCallbackURL(baseURL, pluginType, provider) {
    const callback_url = new URL(baseURL);
    callback_url.pathname = `/api/${pluginType}/oauth/callback/${provider}`;
    callback_url.search = "";
    return callback_url;
}
//# sourceMappingURL=cb.js.map