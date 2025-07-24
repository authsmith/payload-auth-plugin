type BaseOptions = {
    name: string;
    baseURL: string;
    redirectUrl?: string;
};
export type OauthProvider = "google" | "github" | "apple" | "cognito" | "gitlab" | "msft-entra" | "slack" | "atlassian" | "auth0" | "discord" | "facebook" | "jumpcloud" | "twitch" | "okta";
export declare const oauth: (options: BaseOptions, provider: OauthProvider) => void;
export {};
//# sourceMappingURL=oauth.d.ts.map