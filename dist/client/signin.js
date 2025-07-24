import { passwordSignin } from "./password.js";
import { oauth } from "./oauth.js";
export const signin = (options) => {
    return {
        oauth: (provider) => oauth(options, provider),
        // passkey: () => passkeyInit(), NEEDS IMPROVEMENT
        password: async (payload) => await passwordSignin(options, payload),
    };
};
//# sourceMappingURL=signin.js.map