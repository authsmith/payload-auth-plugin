import type { PayloadRequest } from "payload"
import { AccountInfo } from "../../types.js"
import { CredentialSignin } from "../protocols/credentials.js"
import { InvalidAPIRequest } from "../errors/apiErrors.js"

export function CredentialsHandlers(
  request: PayloadRequest,
  resource: string,
  //   sessionCallBack: (accountInfo: AccountInfo) => Promise<Response>,
): Promise<Response> {
  switch (resource) {
    case "signin":
      return CredentialSignin(request)
    case "signup":
      return CredentialSignin(request)
    default:
      throw new InvalidAPIRequest()
  }
}
