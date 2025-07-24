import { InvalidAPIRequest } from "../errors/apiErrors.js";
import { SessionRefresh, SessionSignout, SessionUser, } from "../protocols/session.js";
import { APP_COOKIE_SUFFIX } from "../../constants.js";
export function SessionHandlers(request, pluginType, internals) {
    if (pluginType === "admin") {
        // TODO: Implementation is not necessary as it is already handled by Payload. But can be customised.
        throw new InvalidAPIRequest();
    }
    const kind = request.routeParams?.kind;
    switch (kind) {
        case "refresh":
            return SessionRefresh(`__${pluginType}-${APP_COOKIE_SUFFIX}`, request);
        case "user":
            return SessionUser(`__${pluginType}-${APP_COOKIE_SUFFIX}`, request, internals, []);
        case "signout":
            return SessionSignout(`__${pluginType}-${APP_COOKIE_SUFFIX}`, request);
        default:
            throw new InvalidAPIRequest();
    }
}
//# sourceMappingURL=session.js.map