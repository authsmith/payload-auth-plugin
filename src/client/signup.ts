import { PasswordSignupPayload, passwordSignup } from "./password.js"

interface BaseOptions {
  name: string
}

export const appSignup = (options: BaseOptions) => {
  return {
    password: async (paylaod: PasswordSignupPayload) =>
      await passwordSignup(options, paylaod),
  }
}
