import type { PasswordProviderConfig } from "../types.js";
type PasswordProviderOptions = {
    /**
     * Email templates
     */
    emailTemplates: {
        forgotPassword: any;
    };
};
declare function PasswordProvider(options: PasswordProviderOptions): PasswordProviderConfig;
export default PasswordProvider;
//# sourceMappingURL=password.d.ts.map