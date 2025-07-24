import { type PayloadRequest } from "payload";
export declare const PasswordSignin: (pluginType: string, request: PayloadRequest, internal: {
    usersCollectionSlug: string;
}, useAdmin: boolean, secret: string, successRedirectPath: string, errorRedirectPath: string) => Promise<Response>;
export declare const PasswordSignup: (pluginType: string, request: PayloadRequest, internal: {
    usersCollectionSlug: string;
}, useAdmin: boolean, secret: string, successRedirectPath: string, errorRedirectPath: string) => Promise<Response>;
export declare const ForgotPasswordInit: (request: PayloadRequest, internal: {
    usersCollectionSlug: string;
}, emailTemplate: any) => Promise<Response>;
export declare const ForgotPasswordVerify: (request: PayloadRequest, internal: {
    usersCollectionSlug: string;
}) => Promise<Response>;
export declare const ResetPassword: (cookieName: string, secret: string, internal: {
    usersCollectionSlug: string;
}, request: PayloadRequest) => Promise<Response>;
//# sourceMappingURL=password.d.ts.map