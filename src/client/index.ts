import { MissingPayloadAuthBaseURL } from "../core/errors/consoleErrors.js"
import {
  forgotPassword,
  recoverPassword,
  resetPassword,
  type ForgotPasswordPayload,
  type PasswordRecoverPayload,
  type PasswordResetPayload,
} from "./password.js"
import { refresh } from "./refresh.js"
import { register } from "./register.js"
import { getClientSession, getSession } from "./session.js"
import { signin } from "./signin.js"
import { signout } from "./signout.js"

class AuthClient {
  private baseURL: string
  constructor(
    private name: string,
    options?:
      | {
          payloadBaseURL?: string | undefined
        }
      | undefined,
  ) {
    if (!options?.payloadBaseURL && !process.env.NEXT_PUBLIC_PAYLOAD_AUTH_URL) {
      throw new MissingPayloadAuthBaseURL()
    }

    this.baseURL =
      options?.payloadBaseURL ??
      (process.env.NEXT_PUBLIC_PAYLOAD_AUTH_URL as string)
  }

  /**
   * Sign in a user
   * @param additionalScope - Additional scope to request
   * @returns The sign in response
   */
  signin(additionalScope?: string) {
    return signin({
      name: this.name,
      baseURL: this.baseURL,
      additionalScope,
    })
  }
  register() {
    return register({
      name: this.name,
      baseURL: this.baseURL,
    })
  }
  async resetPassword(payload: PasswordResetPayload) {
    return await resetPassword(
      {
        name: this.name,
        baseURL: this.baseURL,
      },
      payload,
    )
  }
  async forgotPassword(payload: ForgotPasswordPayload) {
    return await forgotPassword(
      {
        name: this.name,
        baseURL: this.baseURL,
      },
      payload,
    )
  }
  async recoverPassword(payload: PasswordRecoverPayload) {
    return await recoverPassword(
      {
        name: this.name,
        baseURL: this.baseURL,
      },
      payload,
    )
  }
  async getSession({ headers }: { headers: HeadersInit }) {
    return await getSession({
      name: this.name,
      baseURL: this.baseURL,
      headers,
    })
  }
  async getClientSession() {
    return await getClientSession({
      name: this.name,
      baseURL: this.baseURL,
    })
  }
  async signout({ returnTo }: { returnTo?: string | undefined }) {
    return await signout({
      name: this.name,
      baseURL: this.baseURL,
      returnTo,
    })
  }
  async refreshSession() {
    return await refresh({
      name: this.name,
      baseURL: this.baseURL,
    })
  }
}

export { AuthClient }
