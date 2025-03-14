import type { PayloadRequest } from "payload"
import {
  ForgotPasswordInit,
  ForgotPasswordVerify,
  PasswordSignin,
  PasswordSignup,
  ResetPassword,
} from "../protocols/password.js"
import { InvalidAPIRequest } from "../errors/apiErrors.js"
import { APP_COOKIE_SUFFIX } from "../../constants.js"

export function PasswordAuthHandlers(
  request: PayloadRequest,
  pluginType: string,
  kind: string,
  internal: {
    usersCollectionSlug: string
  },
  sessionCallBack: (user: { id: string; email: string }) => Promise<Response>,
  secret: string,
  stage?: string | undefined,
): Promise<Response> {
  switch (kind) {
    case "signin":
      return PasswordSignin(request, internal, sessionCallBack)
    case "signup":
      return PasswordSignup(request, internal, sessionCallBack)
    case "forgot-password":
      switch (stage) {
        case "init":
          return ForgotPasswordInit(request, internal)
        case "verify":
          return ForgotPasswordVerify(request, internal)
        default:
          throw new InvalidAPIRequest()
      }
    case "reset-password":
      return ResetPassword(
        `__${pluginType}-${APP_COOKIE_SUFFIX}`,
        secret,
        internal,
        request,
      )
    default:
      throw new InvalidAPIRequest()
  }
}
