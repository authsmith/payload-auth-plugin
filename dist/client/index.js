import { resetPassword, forgotPassword, recoverPassword, } from "./password.js";
import { refresh } from "./refresh.js";
import { signin } from "./signin.js";
import { register } from "./register.js";
import { getSession, getClientSession } from "./session.js";
import { signout } from "./signout.js";
import { MissingPayloadAuthBaseURL } from "../core/errors/consoleErrors.js";
class AuthClient {
    name;
    baseURL;
    constructor(name, options) {
        this.name = name;
        if (!options?.payloadBaseURL && !process.env.NEXT_PUBLIC_PAYLOAD_AUTH_URL) {
            throw new MissingPayloadAuthBaseURL();
        }
        this.baseURL =
            options?.payloadBaseURL ??
                process.env.NEXT_PUBLIC_PAYLOAD_AUTH_URL;
    }
    signin(redirectUrl) {
        console.error("the redirectUrl is: " + redirectUrl);
        return signin({
            name: this.name,
            baseURL: this.baseURL,
            redirectUrl,
        });
    }
    register() {
        return register({
            name: this.name,
            baseURL: this.baseURL,
        });
    }
    async resetPassword(payload) {
        return await resetPassword({
            name: this.name,
            baseURL: this.baseURL,
        }, payload);
    }
    async forgotPassword(payload) {
        return await forgotPassword({
            name: this.name,
            baseURL: this.baseURL,
        }, payload);
    }
    async recoverPassword(payload) {
        return await recoverPassword({
            name: this.name,
            baseURL: this.baseURL,
        }, payload);
    }
    async getSession({ headers }) {
        return await getSession({
            name: this.name,
            baseURL: this.baseURL,
            headers,
        });
    }
    async getClientSession() {
        return await getClientSession({
            name: this.name,
            baseURL: this.baseURL,
        });
    }
    async signout({ returnTo }) {
        return await signout({
            name: this.name,
            baseURL: this.baseURL,
            returnTo,
        });
    }
    async refreshSession() {
        return await refresh({
            name: this.name,
            baseURL: this.baseURL,
        });
    }
}
export { AuthClient };
//# sourceMappingURL=index.js.map