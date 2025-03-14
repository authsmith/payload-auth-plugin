import { PayloadRequest } from "payload"
import { InvalidAPIRequest } from "../errors/apiErrors.js"
import { SessionRefresh } from "../protocols/session.js"
import { APP_COOKIE_SUFFIX } from "../../constants.js"

export function SessionHandlers(
  request: PayloadRequest,
  pluginType: string,
  kind: string,
  secret: string,
) {
  if (pluginType === "admin") {
    // TODO: Implementation is not necessary as it is already handled by Payload. But can be customised.
    throw new InvalidAPIRequest()
  }
  switch (kind) {
    case "refresh":
      return SessionRefresh(
        `__${pluginType}-${APP_COOKIE_SUFFIX}`,
        secret,
        request,
      )
    default:
      throw new InvalidAPIRequest()
  }
}
