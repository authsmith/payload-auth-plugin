import type { PayloadRequest } from "payload";
import { OAuthAccountData, OAuthCollections } from "../../../types";
export declare function OAuthAuthentication(pluginType: string, collections: OAuthCollections, allowOAuthAutoSignUp: boolean, useAdmin: boolean, secret: string, request: PayloadRequest, successRedirectPath: string, errorRedirectPath: string, userData: OAuthAccountData): Promise<Response>;
//# sourceMappingURL=oauth_authentication.d.ts.map