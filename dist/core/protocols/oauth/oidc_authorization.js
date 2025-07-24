import * as oauth from "oauth4webapi";
import { createOAuthState } from "../../routeHandlers/oauth";
import { getCallbackURL } from "../../utils/cb";
export async function OIDCAuthorization(pluginType, request, providerConfig, parsedState) {
    const callback_url = getCallbackURL(request.payload.config.serverURL, pluginType, providerConfig.id);
    const code_verifier = parsedState?.codeVerifier || oauth.generateRandomCodeVerifier();
    const code_challenge = await oauth.calculatePKCECodeChallenge(code_verifier);
    const code_challenge_method = "S256";
    const { client_id, issuer, algorithm, scope, params } = providerConfig;
    const client = {
        client_id,
    };
    const issuer_url = new URL(issuer);
    const as = await oauth
        .discoveryRequest(issuer_url, { algorithm })
        .then((response) => oauth.processDiscoveryResponse(issuer_url, response));
    const cookies = [];
    const cookieMaxage = new Date(Date.now() + 300 * 1000);
    const authorizationURL = new URL(as.authorization_endpoint);
    authorizationURL.searchParams.set("client_id", client.client_id);
    authorizationURL.searchParams.set("redirect_uri", callback_url.toString());
    authorizationURL.searchParams.set("response_type", "code");
    authorizationURL.searchParams.set("scope", scope);
    authorizationURL.searchParams.set("code_challenge", code_challenge);
    authorizationURL.searchParams.set("code_challenge_method", code_challenge_method);
    // Create and store state parameter
    let stateValue;
    if (parsedState) {
        stateValue = createOAuthState(parsedState);
        authorizationURL.searchParams.set("state", stateValue);
        // Store the state in a cookie for callback validation
        cookies.push(`__session-oauth-state=${stateValue};Path=/;HttpOnly;SameSite=lax;Expires=${cookieMaxage.toUTCString()}`);
    }
    if (params) {
        Object.entries(params).map(([key, value]) => {
            // Don't override the state if we already set it
            if (key !== "state" || !stateValue) {
                authorizationURL.searchParams.set(key, value);
                // If state comes from params and we haven't set it yet, store it in cookie
                if (key === "state" && !stateValue) {
                    cookies.push(`__session-oauth-state=${value};Path=/;HttpOnly;SameSite=lax;Expires=${cookieMaxage.toUTCString()}`);
                }
            }
        });
    }
    if (as.code_challenge_methods_supported?.includes("S256") !== true) {
        const nonce = parsedState?.nonce || oauth.generateRandomNonce();
        authorizationURL.searchParams.set("nonce", nonce);
        cookies.push(`__session-oauth-nonce=${nonce};Path=/;HttpOnly;SameSite=lax;Expires=${cookieMaxage.toUTCString()}`);
    }
    cookies.push(`__session-code-verifier=${code_verifier};Path=/;HttpOnly;SameSite=lax;Expires=${cookieMaxage.toUTCString()}`);
    const res = new Response(null, {
        status: 302,
        headers: {
            Location: authorizationURL.href,
        },
    });
    for (const c of cookies) {
        res.headers.append("Set-Cookie", c);
    }
    return res;
}
//# sourceMappingURL=oidc_authorization.js.map