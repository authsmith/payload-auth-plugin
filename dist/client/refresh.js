import { WrongClientUsage } from "../core/errors/consoleErrors.js";
export const refresh = async (options) => {
    if (typeof window === "undefined") {
        throw new WrongClientUsage();
    }
    const response = await fetch(`${options.baseURL}/api/${options.name}/session/refresh`);
    const { message, kind, data, isError, isSuccess } = (await response.json());
    return {
        message,
        kind,
        data,
        isError,
        isSuccess,
    };
};
//# sourceMappingURL=refresh.js.map