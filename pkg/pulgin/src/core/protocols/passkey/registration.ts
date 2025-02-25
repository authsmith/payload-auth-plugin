import { parseCookies, PayloadRequest } from "payload"
import {
  generateRegistrationOptions,
  GenerateRegistrationOptionsOpts,
  RegistrationResponseJSON,
  verifyRegistrationResponse,
} from "@simplewebauthn/server"
import { PasskeyVerificationAPIError } from "../../errors/apiErrors.js"
import { MissingOrInvalidSession } from "../../errors/consoleErrors.js"
import { AccountInfo } from "../../../types.js"
import { hashCode } from "../../utils/hash.js"

export async function GeneratePasskeyRegistration(
  request: PayloadRequest,
  rpID: string,
): Promise<Response> {
  // @ts-expect-error TODO: Fix undefined object method
  const { data } = (await request.json()) as { data: { email: string } }

  const registrationOptions: GenerateRegistrationOptionsOpts = {
    rpName: "Payload Passkey Webauth",
    rpID,
    userName: data.email,
    timeout: 60000,
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "required",
      userVerification: "required",
    },
    supportedAlgorithmIDs: [-7, -257],
  }
  const options = await generateRegistrationOptions(registrationOptions)
  const cookieMaxage = new Date(Date.now() + 300 * 1000)
  const cookies: string[] = []
  cookies.push(
    `__session-webpk-challenge=${options.challenge};Path=/;HttpOnly;SameSite=lax;Expires=${cookieMaxage.toUTCString()}`,
  )
  const res = new Response(JSON.stringify({ options }), { status: 201 })
  cookies.forEach((cookie) => {
    res.headers.append("Set-Cookie", cookie)
  })
  return res
}

export async function VerifyPasskeyRegistration(
  request: PayloadRequest,
  rpID: string,
  session_callback: (accountInfo: AccountInfo) => Promise<Response>,
): Promise<Response> {
  try {
    const parsedCookies = parseCookies(request.headers)

    const challenge = parsedCookies.get("__session-webpk-challenge")
    if (!challenge) {
      throw new MissingOrInvalidSession()
    }
    // @ts-expect-error TODO: Fix undefined object method
    const body = (await request.json()) as {
      data: { email: string; registration: RegistrationResponseJSON }
    }
    const verification = await verifyRegistrationResponse({
      response: body.data.registration,
      expectedChallenge: challenge,
      expectedOrigin: request.payload.config.serverURL,
      expectedRPID: rpID,
    })
    if (!verification.verified) {
      throw new PasskeyVerificationAPIError()
    }
    const { credential, credentialDeviceType, credentialBackedUp } =
      verification.registrationInfo!

    return await session_callback({
      sub: hashCode(body.data.email + request.payload.secret).toString(),
      name: "",
      picture: "",
      email: body.data.email,
      passKey: {
        credentialId: credential.id,
        publicKey: credential.publicKey,
        counter: credential.counter,
        transports: credential.transports!,
        deviceType: credentialDeviceType,
        backedUp: credentialBackedUp,
      },
    })
  } catch (error) {
    console.error(error)
    return Response.json({})
  }
}
