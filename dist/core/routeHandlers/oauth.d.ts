import type { OAuthHandlersParams, ParsedOAuthState } from "../../types";
/**
 * Create OAuth state parameter
 */
export declare function createOAuthState(data: ParsedOAuthState): string;
/**
 * Main OAuth handler that routes to appropriate authorization or callback handlers
 */
export declare function OAuthHandlers(params: OAuthHandlersParams): Promise<Response>;
//# sourceMappingURL=oauth.d.ts.map