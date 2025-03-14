import { passwordSignin, PasswordSigninPayload } from "./password.js"
import { oauth, OauthProvider, OauthSigninOptions } from "./oauth.js"
import { init as passkeyInit } from "./passkey/index.js"
interface BaseOptions {
  name: string
}

export const appSignin = (options: BaseOptions) => {
  return {
    oauth: (provider: OauthProvider, oauthSigniOptions?: OauthSigninOptions) =>
      oauth(options, provider, oauthSigniOptions),
    passkey: () => passkeyInit(),
    password: async (payload: PasswordSigninPayload) =>
      await passwordSignin(options, payload),
  }
}

export const adminSignin = () => {
  return {
    oauth: (provider: OauthProvider, oauthSigniOptions?: OauthSigninOptions) =>
      oauth({ name: "admin" }, provider, oauthSigniOptions),
    passkey: () => {
      passkeyInit()
    },
  }
}
