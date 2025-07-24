import { PayloadRequest } from "payload";
import { AccountInfo } from "../../../types.js";
export declare function GeneratePasskeyAuthentication(request: PayloadRequest, rpID: string): Promise<Response>;
export declare function VerifyPasskeyAuthentication(request: PayloadRequest, rpID: string, session_callback: (accountInfo: AccountInfo) => Promise<Response>): Promise<Response>;
//# sourceMappingURL=authentication.d.ts.map