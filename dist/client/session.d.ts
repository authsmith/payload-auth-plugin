import type { AuthPluginOutput } from "../types.js";
interface BaseOptions {
    name: string;
    headers: HeadersInit;
    baseURL: string;
}
export declare const getSession: (opts: BaseOptions) => Promise<AuthPluginOutput>;
export declare const getClientSession: (opts: Pick<BaseOptions, "name" | "baseURL">) => Promise<{
    data: unknown;
    message: string;
    kind: import("../types.js").ErrorKind | import("../types.js").SuccessKind;
    isError: boolean;
    isSuccess: boolean;
}>;
export {};
//# sourceMappingURL=session.d.ts.map