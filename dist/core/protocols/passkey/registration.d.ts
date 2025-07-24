import { PayloadRequest } from "payload";
import { AccountInfo } from "../../../types.js";
export declare function GeneratePasskeyRegistration(request: PayloadRequest, rpID: string): Promise<Response>;
export declare function VerifyPasskeyRegistration(request: PayloadRequest, rpID: string, session_callback: (accountInfo: AccountInfo) => Promise<Response>): Promise<Response>;
//# sourceMappingURL=registration.d.ts.map