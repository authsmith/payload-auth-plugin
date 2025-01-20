import { init } from "./passkey/index.js"
import { redirect } from "next/navigation"

type Provider = "google" | "github" | "passkey"

export function signin(provider: Provider) {
  if (provider === "passkey") {
    init()
  } else {
    const redirectURL = "/api/admin/oauth/authorization/" + provider
    if (!document) {
      redirect(redirectURL)
      return
    }

    const link = document.createElement("a")
    link.href = redirectURL
    link.click()
  }
}
