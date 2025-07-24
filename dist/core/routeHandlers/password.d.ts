import type { PayloadRequest } from "payload";
import type { PasswordProviderConfig } from "../../types.js";
export declare function PasswordAuthHandlers(request: PayloadRequest, pluginType: string, kind: string, internal: {
    usersCollectionSlug: string;
}, secret: string, useAdmin: boolean, successRedirectPath: string, errorRedirectPath: string, providerConfig: PasswordProviderConfig, stage?: string | undefined): Promise<Response>;
//# sourceMappingURL=password.d.ts.map