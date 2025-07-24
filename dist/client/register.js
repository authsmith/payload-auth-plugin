import { passwordSignup } from "./password.js";
export const register = (options) => {
    return {
        password: async (paylaod) => await passwordSignup(options, paylaod),
    };
};
//# sourceMappingURL=register.js.map