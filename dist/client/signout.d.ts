import { SuccessKind } from "../types.js";
interface BaseOptions {
    name: string;
    returnTo?: string | undefined;
    baseURL: string;
}
export declare const signout: (opts: BaseOptions) => Promise<{
    data: unknown;
    message: string;
    kind: import("../types.js").ErrorKind | SuccessKind;
    isError: boolean;
    isSuccess: boolean;
}>;
export {};
//# sourceMappingURL=signout.d.ts.map