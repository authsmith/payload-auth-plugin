import { MissingEnv } from "../core/errors/consoleErrors.js"
import {
  forgotPassword,
  ForgotPasswordPayload,
  passwordRecover,
  PasswordRecoverPayload,
  passwordReset,
  PasswordResetPayload,
} from "./password.js"
import { refresh } from "./refresh.js"
import { adminSignin, appSignin } from "./signin.js"
import { appSignup } from "./signup.js"

interface AppClientOptions {
  name: string
}

export const appClient = (options: AppClientOptions) => {
  if (!process.env.NEXT_PUBLIC_SERVER_URL) {
    throw new MissingEnv("NEXT_PUBLIC_SERVER_URL")
  }
  return {
    signin: () => appSignin(options),
    signup: () => appSignup(options),
    resetPassword: async (payload: PasswordResetPayload) =>
      await passwordReset(options, payload),
    forgotPassword: async (payload: ForgotPasswordPayload) =>
      await forgotPassword(options, payload),
    passwordRecover: async (payload: PasswordRecoverPayload) =>
      await passwordRecover(options, payload),
    refresh: async () => await refresh(options),
  }
}

export const adminClient = () => {
  return {
    signin: () => adminSignin(),
  }
}
