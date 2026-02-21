import { oauth, type OauthProvider } from "./oauth.js"
import { passwordSignin, type PasswordSigninPayload } from "./password.js"
interface BaseOptions {
  name: string
  baseURL: string
  additionalScope?: string
}

export const signin = (options: BaseOptions) => {
  return {
    oauth: (provider: OauthProvider) => oauth(options, provider),
    // passkey: () => passkeyInit(), NEEDS IMPROVEMENT
    password: async (payload: PasswordSigninPayload) =>
      await passwordSignin(options, payload),
  }
}
