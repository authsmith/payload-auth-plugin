import type { AuthorizationServer } from "oauth4webapi";
import { PayloadRequest } from "payload";
export declare enum ErrorKind {
    NotFound = "NotFound",
    InternalServer = "InternalServer",
    BadRequest = "BadRequest",
    NotAuthorized = "NotAuthorized",
    NotAuthenticated = "NotAuthenticated",
    Conflict = "Conflict"
}
export declare enum SuccessKind {
    Created = "Created",
    Updated = "Updated",
    Retrieved = "Retrieved",
    Deleted = "Deleted"
}
export interface AuthPluginOutput {
    message: string;
    kind: ErrorKind | SuccessKind;
    data: unknown;
    isSuccess: boolean;
    isError: boolean;
}
/**
 * Generic OAuth provider callback output
 *
 * @interface OAuthProviderOutput
 * @internal
 */
interface OAuthProviderOutput {
    /**
     * OAuth Provider ID. Usually the slugified provider name
     *
     * @type {string}
     */
    id: string;
    /**
     * OAuth provider name. For example Google, Apple
     *
     * @type {string}
     */
    name: string;
    /**
     * Scope of account attributes to request from the provider
     *
     * @type {string}
     */
    scope: string;
    /**
     * Profile callback that returns account information requried to link with users
     *
     * @type {(
     *     profile: Record<string, string | number | boolean | object>,
     *   ) => AccountInfo}
     */
    profile: (profile: Record<string, string | number | boolean | object>) => AccountInfo;
}
export interface OAuthBaseProviderConfig {
    client_id: string;
    client_secret?: string;
    client_auth_type?: "client_secret_basic" | "client_secret_post";
    params?: Record<string, string>;
    /**
     * Override default scope of the provider
     */
    overrideScope?: string | undefined;
}
export interface OIDCProviderConfig extends OAuthProviderOutput, OAuthBaseProviderConfig {
    issuer: string;
    algorithm: "oidc";
    kind: "oauth";
    skip_email_verification?: boolean | undefined;
}
export interface OAuth2ProviderConfig extends OAuthProviderOutput, OAuthBaseProviderConfig {
    authorization_server: AuthorizationServer;
    algorithm: "oauth2";
    kind: "oauth";
}
export type OAuthProviderConfig = OIDCProviderConfig | OAuth2ProviderConfig;
export interface AccountInfo {
    sub: string;
    name: string;
    picture: string;
    email: string;
    passKey?: {
        credentialId: string;
        publicKey?: Uint8Array;
        counter: number;
        transports?: string[];
        deviceType: string;
        backedUp: boolean;
    };
    access_token?: string;
}
export type PasswordProviderConfig = {
    id: string;
    kind: "password";
    emailTemplates: {
        forgotPassword: any;
    };
};
export interface CredentialsAccountInfo {
    name: string;
    email: string;
}
export type PasskeyProviderConfig = {
    id: string;
    kind: "passkey";
};
export type ProvidersConfig = OAuthProviderConfig | PasskeyProviderConfig | PasswordProviderConfig;
export type AuthenticationStrategy = "Cookie";
export type UserSession = {
    createdAt: Date | string;
    expiresAt: Date | string;
    id: string;
};
export interface OAuthCollections {
    usersCollection: string;
    accountsCollection: string;
}
export interface OAuthBaseParams {
    pluginType: string;
    collections: OAuthCollections;
    allowOAuthAutoSignUp: boolean;
    secret: string;
    useAdmin: boolean;
    request: PayloadRequest;
    provider: OAuthProviderConfig;
    successRedirectPath: string;
    errorRedirectPath: string;
}
export interface OAuthHandlersParams extends OAuthBaseParams {
    state?: string;
}
export interface OAuthCallbackParams extends OAuthBaseParams {
}
export interface OAuthAccountData extends Omit<AccountInfo, "passKey"> {
    scope: string;
    issuer: string;
    access_token: string;
}
export interface ParsedOAuthState {
    redirectPath?: string;
    provider?: string;
    timestamp?: number;
    nonce?: string;
    codeVerifier?: string;
    [key: string]: unknown;
}
export {};
//# sourceMappingURL=types.d.ts.map