import { type PasswordSignupPayload } from "./password.js";
interface BaseOptions {
    name: string;
    baseURL: string;
}
export declare const register: (options: BaseOptions) => {
    password: (paylaod: PasswordSignupPayload) => Promise<import("../types.js").AuthPluginOutput>;
};
export {};
//# sourceMappingURL=register.d.ts.map