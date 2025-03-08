import * as qs from "qs-esm"

type BaseOptions = {
  baseURL: string
  name: string
}
export type OauthSigninOptions = {
  successRedirect?: string | undefined
  errorRedirect?: string | undefined
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

export function oauth(
  options: BaseOptions,
  provider: OauthProvider,
  oauthOptions?: OauthSigninOptions,
) {
  const base = options.baseURL
  const query: Record<string, string> = {}
  if (oauthOptions?.successRedirect) {
    query["successRedirect"] = oauthOptions.successRedirect
  }
  if (oauthOptions?.errorRedirect) {
    query["errorRedirect"] = oauthOptions.errorRedirect
  }
  const queryString = qs.stringify(query)
  window.location.href = `${base}/api/${options.name}/oauth/authorization/${provider}${queryString ? "?" + queryString : ""}`
}
