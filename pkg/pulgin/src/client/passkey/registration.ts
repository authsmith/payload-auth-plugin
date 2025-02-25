import { startRegistration } from "@simplewebauthn/browser"
export async function registration(email: string) {
  try {
    const resp = await fetch(
      "/api/admin/passkey/generate-registration-options",
      {
        method: "POST",
        body: JSON.stringify({ data: { email } }),
      },
    )
    const optionsJSON = await resp.json()

    const registrationResp = await startRegistration({
      optionsJSON: optionsJSON.options,
    })
    const response = await fetch("/api/admin/passkey/verify-registration", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: { email, registration: registrationResp } }),
    })
    if (response.redirected) {
      window.location.href = response.url
    }
  } catch (error) {
    console.log(error)
  }
}
