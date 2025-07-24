import { ForgotPasswordInit, ForgotPasswordVerify, PasswordSignin, PasswordSignup, ResetPassword, } from "../protocols/password.js";
import { InvalidAPIRequest } from "../errors/apiErrors.js";
import { APP_COOKIE_SUFFIX } from "../../constants.js";
export function PasswordAuthHandlers(request, pluginType, kind, internal, secret, useAdmin, successRedirectPath, errorRedirectPath, providerConfig, stage) {
    switch (kind) {
        case "signin":
            return PasswordSignin(pluginType, request, internal, useAdmin, secret, successRedirectPath, errorRedirectPath);
        case "signup":
            return PasswordSignup(pluginType, request, internal, useAdmin, secret, successRedirectPath, errorRedirectPath);
        case "forgot-password":
            switch (stage) {
                case "init":
                    return ForgotPasswordInit(request, internal, providerConfig.emailTemplates.forgotPassword);
                case "verify":
                    return ForgotPasswordVerify(request, internal);
                default:
                    throw new InvalidAPIRequest();
            }
        case "reset-password":
            return ResetPassword(`__${pluginType}-${APP_COOKIE_SUFFIX}`, secret, internal, request);
        default:
            throw new InvalidAPIRequest();
    }
}
//# sourceMappingURL=password.js.map