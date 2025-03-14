import * as qs from "qs-esm"

type BaseOptions = {
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
  | "twitch"

export const oauth = (
  options: BaseOptions,
  provider: OauthProvider,
  oauthOptions?: OauthSigninOptions,
) => {
  const base = process.env.NEXT_PUBLIC_SERVER_URL
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
