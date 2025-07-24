export declare const hashPassword: (password: string) => Promise<{
    hash: string;
    salt: string;
    iterations: number;
}>;
export declare const verifyPassword: (password: string, hashB64: string, saltB64: string, iterations: number) => Promise<boolean>;
//# sourceMappingURL=password.d.ts.map