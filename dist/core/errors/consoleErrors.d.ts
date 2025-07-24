declare class PluginError extends Error {
    constructor(message: string, cause?: string);
}
export declare class MissingPayloadAuthBaseURL extends PluginError {
    constructor();
}
export declare class InvalidServerURL extends PluginError {
    constructor();
}
export declare class InvalidProvider extends PluginError {
    constructor();
}
export declare class ProviderAlreadyExists extends PluginError {
    constructor();
}
export declare class InvalidOAuthAlgorithm extends PluginError {
    constructor();
}
export declare class InvalidOAuthResource extends PluginError {
    constructor();
}
export declare class MissingOrInvalidSession extends PluginError {
    constructor();
}
export declare class MissingOrInvalidParams extends PluginError {
    constructor();
}
export declare class MissingSecret extends PluginError {
    constructor();
}
export declare class AuthenticationFailed extends PluginError {
    constructor();
}
export declare class UserNotFound extends PluginError {
    constructor();
}
export declare class InvalidCredentials extends PluginError {
    constructor();
}
export declare class MissingUsersCollection extends PluginError {
    constructor();
}
export declare class InvalidPasskeyRequest extends PluginError {
    constructor();
}
export declare class InvalidCollectionSlug extends PluginError {
    constructor();
}
export declare class MissingCollections extends PluginError {
    constructor();
}
export declare class MissingEnv extends PluginError {
    constructor(env: string);
}
export declare class MissingEmailAdapter extends PluginError {
    constructor();
}
export declare class MissingCollectionSlug extends PluginError {
    constructor();
}
export declare class WrongClientUsage extends PluginError {
    constructor();
}
export {};
//# sourceMappingURL=consoleErrors.d.ts.map