import { SuccessKind } from "../types.js";
export const passwordSignin = async (opts, payload) => {
    const response = await fetch(`${opts.baseURL}/api/${opts.name}/auth/signin`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
    if (response.redirected) {
        window.location.href = response.url;
        return {
            data: {},
            message: "Redirecting user...",
            kind: SuccessKind.Retrieved,
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
export const passwordSignup = async (opts, payload) => {
    const response = await fetch(`${opts.baseURL}/api/${opts.name}/auth/signup`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
    if (response.redirected) {
        window.location.href = response.url;
        return {
            data: {},
            message: "Redirecting user...",
            kind: SuccessKind.Retrieved,
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
export const forgotPassword = async (opts, payload) => {
    const response = await fetch(`${opts.baseURL}/api/${opts.name}/auth/forgot-password?stage=init`, {
        method: "POST",
        body: JSON.stringify(payload),
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
export const recoverPassword = async (opts, payload) => {
    const response = await fetch(`${opts.baseURL}/api/${opts.name}/auth/forgot-password?stage=verify`, {
        method: "POST",
        body: JSON.stringify(payload),
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
export const resetPassword = async (opts, payload) => {
    const response = await fetch(`${opts.baseURL}/api/${opts.name}/auth/reset-password`, {
        method: "POST",
        body: JSON.stringify(payload),
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
//# sourceMappingURL=password.js.map