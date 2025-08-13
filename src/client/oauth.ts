/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import Cookies from "js-cookie"

type BaseOptions = {
  name: string
  baseURL: string
  additionalScope?: string
}

export type OauthProvider =
  | "google"
  | "github"
  | "apple"
  | "cognito"
  | "gitlab"
  | "msft-entra"
  | "slack"
  | "atlassian"
  | "auth0"
  | "discord"
  | "facebook"
  | "jumpcloud"
  | "twitch"
  | "okta"

export const oauth = (options: BaseOptions, provider: OauthProvider): void => {
  const additionalScope = options.additionalScope || ""
  Cookies.set("oauth_scope", additionalScope, { expires: 1 / 288, path: "/" })

  const oauthURL = `${options.baseURL}/api/${options.name}/oauth/authorization/${provider}`
  window.location.href = oauthURL
}
