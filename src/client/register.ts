import { type PasswordSignupPayload, passwordSignup } from "./password.js"

interface BaseOptions {
  name: string
}

export const register = (options: BaseOptions) => {
  return {
    password: async (paylaod: PasswordSignupPayload) =>
      await passwordSignup(options, paylaod),
  }
}
