import { init } from "./passkey/index.js"

type Provider =
  | "google"
  | "github"
  | "passkey"
  | "apple"
  | "cognito"
  | "gitlab"
  | "msft-entra"
  | "slack"
  | "atlassian"
  | "auth0"
  | "discord"
  | "facebook"

type AppSigninOptions = {
  provider: Provider
  name: string
  customEndpointBase?: string
}

export function appSignin(options: AppSigninOptions) {
  if (options.provider === "passkey") {
    init()
  } else {
    const link = document.createElement("a")
    const base = options.customEndpointBase ?? "/api"
    link.href = `${base}/${options.name}/oauth/authorization/${options.provider}`
    link.click()
  }
}

export function adminSignin(provider: Provider, apiBase: string = "/api") {
  if (provider === "passkey") {
    init()
  } else {
    const link = document.createElement("a")
    link.href = `${apiBase}/admin/oauth/authorization/${provider}`
    link.click()
  }
}
