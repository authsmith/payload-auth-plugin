import { passwordSignin, type PasswordSigninPayload } from "./password.js"
import { oauth, type OauthProvider } from "./oauth.js"
interface BaseOptions {
  name: string
  baseURL: string
  redirectUrl?: string
}

export const signin = (options: BaseOptions) => {
  return {
    oauth: (provider: OauthProvider) => oauth(options, provider),
    // passkey: () => passkeyInit(), NEEDS IMPROVEMENT
    password: async (payload: PasswordSigninPayload) =>
      await passwordSignin(options, payload),
  }
}
