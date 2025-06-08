import { passwordSignin, type PasswordSigninPayload } from "./password.js"
import { oauth, type OauthProvider } from "./oauth.js"
import { init as passkeyInit } from "./passkey/index.js"
interface BaseOptions {
  name: string
}

export const signin = (options: BaseOptions) => {
  return {
    oauth: async (provider: OauthProvider) => await oauth(options, provider),
    passkey: () => passkeyInit(),
    password: async (payload: PasswordSigninPayload) =>
      await passwordSignin(options, payload),
  }
}
