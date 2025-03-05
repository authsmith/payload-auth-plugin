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
  | "jumpcloud"

export function signin(provider: Provider, apiBase: string = "/api") {
  if (provider === "passkey") {
    init()
  } else {
    window.location.href = `${apiBase}/admin/oauth/authorization/${provider}`
  }
}
