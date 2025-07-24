import { type AuthPluginOutput } from "../types.js";
interface BaseOptions {
    name: string;
    baseURL: string;
}
export interface PasswordSigninPayload {
    email: string;
    password: string;
}
export declare const passwordSignin: (opts: BaseOptions, payload: PasswordSigninPayload) => Promise<AuthPluginOutput>;
export interface PasswordSignupPayload {
    email: string;
    password: string;
    allowAutoSignin?: boolean;
    userInfo?: Record<string, unknown>;
}
export declare const passwordSignup: (opts: BaseOptions, payload: PasswordSignupPayload) => Promise<AuthPluginOutput>;
export interface ForgotPasswordPayload {
    email: string;
}
export declare const forgotPassword: (opts: BaseOptions, payload: ForgotPasswordPayload) => Promise<AuthPluginOutput>;
export interface PasswordRecoverPayload {
    password: string;
    code: string;
}
export declare const recoverPassword: (opts: BaseOptions, payload: PasswordRecoverPayload) => Promise<AuthPluginOutput>;
export interface PasswordResetPayload {
    email: string;
    password: string;
}
export declare const resetPassword: (opts: BaseOptions, payload: PasswordResetPayload) => Promise<AuthPluginOutput>;
export {};
//# sourceMappingURL=password.d.ts.map