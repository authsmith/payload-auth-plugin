import { ErrorKind } from "../../types.js";
export declare class AuthAPIError extends Response {
    constructor(message: string, kind: ErrorKind);
}
export declare class MissingEmailAPIError extends AuthAPIError {
    constructor();
}
export declare class UnVerifiedAccountAPIError extends AuthAPIError {
    constructor();
}
export declare class UserNotFoundAPIError extends AuthAPIError {
    constructor();
}
export declare class EmailNotFoundAPIError extends AuthAPIError {
    constructor();
}
export declare class PasskeyVerificationAPIError extends AuthAPIError {
    constructor();
}
export declare class InvalidAPIRequest extends AuthAPIError {
    constructor();
}
export declare class UnauthorizedAPIRequest extends AuthAPIError {
    constructor();
}
export declare class AuthenticationFailed extends AuthAPIError {
    constructor();
}
export declare class InvalidCredentials extends AuthAPIError {
    constructor();
}
export declare class InvalidRequestBodyError extends AuthAPIError {
    constructor();
}
export declare class EmailAlreadyExistError extends AuthAPIError {
    constructor();
}
export declare class InternalServerError extends AuthAPIError {
    constructor();
}
export declare class MissingOrInvalidVerification extends AuthAPIError {
    constructor();
}
export declare class MissingCollection extends AuthAPIError {
    constructor();
}
//# sourceMappingURL=apiErrors.d.ts.map