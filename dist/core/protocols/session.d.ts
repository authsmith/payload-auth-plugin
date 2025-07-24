import { type PayloadRequest } from "payload";
export declare const SessionRefresh: (cookieName: string, request: PayloadRequest) => Promise<Response>;
export declare const SessionUser: (cookieName: string, request: PayloadRequest, internal: {
    usersCollectionSlug: string;
}, fields: string[]) => Promise<Response>;
export declare const SessionSignout: (cookieName: string, request: PayloadRequest) => Promise<Response>;
//# sourceMappingURL=session.d.ts.map