export declare function hashCode(s: string): number;
export declare const ephemeralCode: (length: number, secret: string) => Promise<{
    hash: string;
    code: string;
}>;
export declare const verifyEphemeralCode: (code: string, hashB64: string, secret: string) => Promise<boolean>;
//# sourceMappingURL=hash.d.ts.map