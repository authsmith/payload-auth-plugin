import { WrongClientUsage } from "../core/errors/consoleErrors.js";
import { SuccessKind } from "../types.js";
import * as qs from "qs-esm";
export const signout = async (opts) => {
    if (typeof window === "undefined") {
        throw new WrongClientUsage();
    }
    const query = {};
    if (opts.returnTo) {
        query.returnTo = opts.returnTo;
    }
    const response = await fetch(`${opts.baseURL}/api/${opts.name}/session/signout?${qs.stringify(query)}`);
    if (response.redirected) {
        window.location.href = response.url;
        return {
            data: {},
            message: "Signing out...",
            kind: SuccessKind.Deleted,
            isError: false,
            isSuccess: true,
        };
    }
    const { data, message, kind, isError, isSuccess } = (await response.json());
    return {
        data,
        message,
        kind,
        isError,
        isSuccess,
    };
};
//# sourceMappingURL=signout.js.map