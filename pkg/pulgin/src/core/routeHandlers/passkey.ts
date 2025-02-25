import type { PayloadRequest } from "payload"
import { InvalidPasskeyRequest } from "../errors/consoleErrors.js"
import { InitPasskey } from "../protocols/passkey/index.js"
import { AccountInfo } from "../../types.js"
import {
  GeneratePasskeyRegistration,
  VerifyPasskeyRegistration,
} from "../protocols/passkey/registration.js"
import {
  GeneratePasskeyAuthentication,
  VerifyPasskeyAuthentication,
} from "../protocols/passkey/authentication.js"

export function PasskeyHandlers(
  request: PayloadRequest,
  resource: string,
  rpID: string,
  sessionCallBack: (accountInfo: AccountInfo) => Promise<Response>,
): Promise<Response> {
  switch (resource) {
    case "init":
      return InitPasskey(request)
    case "generate-registration-options":
      return GeneratePasskeyRegistration(request, rpID)
    case "verify-registration":
      return VerifyPasskeyRegistration(request, rpID, sessionCallBack)
    case "generate-authentication-options":
      return GeneratePasskeyAuthentication(request, rpID)
    case "verify-authentication":
      return VerifyPasskeyAuthentication(request, rpID, sessionCallBack)
    default:
      throw new InvalidPasskeyRequest()
  }
}
