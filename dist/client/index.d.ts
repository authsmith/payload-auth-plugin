import { type PasswordResetPayload, type ForgotPasswordPayload, type PasswordRecoverPayload } from "./password.js";
declare class AuthClient {
    private name;
    private baseURL;
    constructor(name: string, options?: {
        payloadBaseURL?: string | undefined;
    } | undefined);
    signin(redirectUrl?: string): {
        oauth: (provider: import("./oauth.js").OauthProvider) => void;
        password: (payload: import("./password.js").PasswordSigninPayload) => Promise<import("../types.js").AuthPluginOutput>;
    };
    register(): {
        password: (paylaod: import("./password.js").PasswordSignupPayload) => Promise<import("../types.js").AuthPluginOutput>;
    };
    resetPassword(payload: PasswordResetPayload): Promise<import("../types.js").AuthPluginOutput>;
    forgotPassword(payload: ForgotPasswordPayload): Promise<import("../types.js").AuthPluginOutput>;
    recoverPassword(payload: PasswordRecoverPayload): Promise<import("../types.js").AuthPluginOutput>;
    getSession({ headers }: {
        headers: HeadersInit;
    }): Promise<import("../types.js").AuthPluginOutput>;
    getClientSession(): Promise<{
        data: unknown;
        message: string;
        kind: import("../types.js").ErrorKind | import("../types.js").SuccessKind;
        isError: boolean;
        isSuccess: boolean;
    }>;
    signout({ returnTo }: {
        returnTo?: string | undefined;
    }): Promise<{
        data: unknown;
        message: string;
        kind: import("../types.js").ErrorKind | import("../types.js").SuccessKind;
        isError: boolean;
        isSuccess: boolean;
    }>;
    refreshSession(): Promise<import("../types.js").AuthPluginOutput>;
}
export { AuthClient };
//# sourceMappingURL=index.d.ts.map