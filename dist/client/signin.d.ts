import { type PasswordSigninPayload } from "./password.js";
import { type OauthProvider } from "./oauth.js";
interface BaseOptions {
    name: string;
    baseURL: string;
    redirectUrl?: string;
}
export declare const signin: (options: BaseOptions) => {
    oauth: (provider: OauthProvider) => void;
    password: (payload: PasswordSigninPayload) => Promise<import("../types.js").AuthPluginOutput>;
};
export {};
//# sourceMappingURL=signin.d.ts.map