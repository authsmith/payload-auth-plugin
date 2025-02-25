import { parseCookies, PayloadRequest } from "payload"
import {
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
  generateAuthenticationOptions,
  GenerateAuthenticationOptionsOpts,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server"
import { PasskeyVerificationAPIError } from "../../errors/apiErrors.js"
import { MissingOrInvalidSession } from "../../errors/consoleErrors.js"
import { AccountInfo } from "../../../types.js"
import { hashCode } from "../../utils/hash.js"

export async function GeneratePasskeyAuthentication(
  request: PayloadRequest,
  rpID: string,
): Promise<Response> {
  // @ts-expect-error TODO: Fix undefined object method
  const { data } = (await request.json()) as {
    data: {
      passkey: {
        backedUp: boolean
        counter: number
        credentialId: string
        deviceType: string
        publicKey: Uint8Array
        transports: AuthenticatorTransportFuture[]
      }
    }
  }

  const registrationOptions: GenerateAuthenticationOptionsOpts = {
    rpID,
    timeout: 60000,
    allowCredentials: [
      {
        id: data.passkey.credentialId,
        transports: data.passkey.transports,
      },
    ],
    userVerification: "required",
  }
  const options = await generateAuthenticationOptions(registrationOptions)
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

export async function VerifyPasskeyAuthentication(
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
    const { data } = (await request.json()) as {
      data: {
        email: string
        authentication: AuthenticationResponseJSON
        passkey: {
          backedUp: boolean
          counter: 0
          credentialId: string
          deviceType: string
          publicKey: Record<string, number>
          transports: AuthenticatorTransportFuture[]
        }
      }
    }

    const verification = await verifyAuthenticationResponse({
      response: data.authentication,
      expectedChallenge: challenge,
      expectedOrigin: request.payload.config.serverURL,
      expectedRPID: rpID,
      credential: {
        id: data.passkey.credentialId,
        publicKey: new Uint8Array(Object.values(data.passkey.publicKey)),
        counter: data.passkey.counter,
        transports: data.passkey.transports,
      },
    })
    if (!verification.verified) {
      throw new PasskeyVerificationAPIError()
    }
    const {
      credentialID,
      credentialDeviceType,
      credentialBackedUp,
      newCounter,
    } = verification.authenticationInfo!
    return await session_callback({
      sub: hashCode(data.email + request.payload.secret).toString(),
      name: "",
      picture: "",
      email: data.email,
      passKey: {
        credentialId: credentialID,
        counter: newCounter,
        deviceType: credentialDeviceType,
        backedUp: credentialBackedUp,
      },
    })
  } catch (error) {
    console.error(error)
    return Response.json({})
  }
}
