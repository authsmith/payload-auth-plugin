import { InvalidOAuthAlgorithm, InvalidOAuthResource, InvalidProvider, } from "../errors/consoleErrors";
import { OIDCAuthorization } from "../protocols/oauth/oidc_authorization";
import { OAuth2Authorization } from "../protocols/oauth/oauth2_authorization";
import { OIDCCallback } from "../protocols/oauth/oidc_callback";
import { OAuth2Callback } from "../protocols/oauth/oauth2_callback";
/**
 * Safely parse OAuth state parameter
 */
function parseOAuthState(state) {
    if (!state)
        return null;
    try {
        return JSON.parse(decodeURIComponent(state));
    }
    catch (error) {
        console.warn("Failed to parse OAuth state:", error);
        return null;
    }
}
/**
 * Create OAuth state parameter
 */
export function createOAuthState(data) {
    return encodeURIComponent(JSON.stringify({
        ...data,
        timestamp: Date.now(),
    }));
}
/**
 * Main OAuth handler that routes to appropriate authorization or callback handlers
 */
export async function OAuthHandlers(params) {
    const { pluginType, collections, allowOAuthAutoSignUp, secret, useAdmin, request, provider, successRedirectPath, errorRedirectPath, state, } = params;
    if (!provider) {
        throw new InvalidProvider();
    }
    const resource = request.routeParams?.resource;
    const parsedState = parseOAuthState(state);
    // Create callback params with parsed state
    const callbackParams = {
        pluginType,
        collections,
        allowOAuthAutoSignUp,
        secret,
        useAdmin,
        request,
        provider,
        successRedirectPath: parsedState?.redirectPath || successRedirectPath,
        errorRedirectPath,
    };
    switch (resource) {
        case "authorization":
            switch (provider.algorithm) {
                case "oidc":
                    return OIDCAuthorization(pluginType, request, provider, parsedState);
                case "oauth2":
                    return OAuth2Authorization(pluginType, request, provider, undefined, parsedState);
                default:
                    throw new InvalidOAuthAlgorithm();
            }
        case "callback":
            switch (provider.algorithm) {
                case "oidc": {
                    return OIDCCallback(callbackParams, parsedState);
                }
                case "oauth2": {
                    return OAuth2Callback(callbackParams, parsedState);
                }
                default:
                    throw new InvalidOAuthAlgorithm();
            }
        default:
            throw new InvalidOAuthResource();
    }
}
//# sourceMappingURL=oauth.js.map