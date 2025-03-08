import { oauth, OauthProvider, OauthSigninOptions } from "./oauth.js"
import { init as passkeyInit } from "./passkey/index.js"

interface BaseSigninOptions {
  baseURL: string
}

interface AppSigninOptions extends BaseSigninOptions {
  /**
   * This will be the name of then frontend app. Example `app`.
   *
   * It should be same as the name used in the `appAuthPlugin` options.
   */
  name: string
}

interface AdminSigninOptions extends BaseSigninOptions {}

export function appSignin(options: AppSigninOptions) {
  return {
    oauth: (provider: OauthProvider, oauthSigniOptions?: OauthSigninOptions) =>
      oauth(options, provider, oauthSigniOptions),
    passkey: () => {
      passkeyInit()
    },
    credentials: async (payload: any) => {
      const base = options.baseURL
      await fetch(`${base}/${options.name}/auth/signin`, {
        method: "POST",
        body: JSON.stringify(payload),
      })
    },
  }
}
export function adminSignin(options: AdminSigninOptions) {
  return {
    oauth: (provider: OauthProvider, oauthSigniOptions?: OauthSigninOptions) =>
      oauth({ ...options, name: "admin" }, provider, oauthSigniOptions),
    passkey: () => {
      passkeyInit()
    },
  }
}
