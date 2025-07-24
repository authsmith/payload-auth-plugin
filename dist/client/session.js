import { WrongClientUsage } from "../core/errors/consoleErrors.js";
export const getSession = async (opts) => {
    const response = await fetch(`${opts.baseURL}/api/${opts.name}/session/user`, {
        method: "GET",
        headers: opts.headers,
    });
    const { data, message, kind, isError, isSuccess } = (await response.json());
    return {
        data,
        message,
        kind,
        isError,
        isSuccess,
    };
};
export const getClientSession = async (opts) => {
    if (typeof window === "undefined") {
        throw new WrongClientUsage();
    }
    const response = await fetch(`${opts.baseURL}/api/${opts.name}/session/user`);
    const { data, message, kind, isError, isSuccess } = (await response.json());
    return {
        data,
        message,
        kind,
        isError,
        isSuccess,
    };
};
//# sourceMappingURL=session.js.map