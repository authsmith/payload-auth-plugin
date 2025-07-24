import * as jwt from "jose";
export declare function createSessionCookies(name: string, secret: string, fieldsToSign: Record<string, unknown>, expiration?: number): Promise<string[]>;
export declare function verifySessionCookie(token: string, secret: string): Promise<jwt.JWTVerifyResult<{
    id: string;
    email: string;
    collection: string;
    iat: number;
    exp: number;
}>>;
export declare function invalidateOAuthCookies(cookies: string[]): string[];
export declare const invalidateSessionCookies: (name: string, cookies: string[]) => string[];
//# sourceMappingURL=cookies.d.ts.map