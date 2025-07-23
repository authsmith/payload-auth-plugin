import {
  resetPassword,
  forgotPassword,
  recoverPassword,
  type PasswordResetPayload,
  type ForgotPasswordPayload,
  type PasswordRecoverPayload,
} from "./password.js"
import { refresh } from "./refresh.js"
import { signin } from "./signin.js"
import { register } from "./register.js"
import { getSession, getClientSession } from "./session.js"
import { signout } from "./signout.js"
import { MissingPayloadAuthBaseURL } from "../core/errors/consoleErrors.js"

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

  signin(redirectUrl?: string) {
    console.error("the redirectUrl is: " + redirectUrl)
    return signin({
      name: this.name,
      baseURL: this.baseURL,
      redirectUrl,
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
