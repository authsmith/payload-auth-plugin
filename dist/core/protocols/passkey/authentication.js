import { parseCookies } from "payload";
import { generateAuthenticationOptions, verifyAuthenticationResponse, } from "@simplewebauthn/server";
import { PasskeyVerificationAPIError } from "../../errors/apiErrors.js";
import { MissingOrInvalidSession } from "../../errors/consoleErrors.js";
import { hashCode } from "../../utils/hash.js";
export async function GeneratePasskeyAuthentication(request, rpID) {
    // @ts-expect-error TODO: Fix undefined object method
    const { data } = (await request.json());
    const registrationOptions = {
        rpID,
        timeout: 60000,
        allowCredentials: [
            {
                id: data.passkey.credentialId,
                transports: data.passkey.transports,
            },
        ],
        userVerification: "required",
    };
    const options = await generateAuthenticationOptions(registrationOptions);
    const cookieMaxage = new Date(Date.now() + 300 * 1000);
    const cookies = [];
    cookies.push(`__session-webpk-challenge=${options.challenge};Path=/;HttpOnly;SameSite=lax;Expires=${cookieMaxage.toUTCString()}`);
    const res = new Response(JSON.stringify({ options }), { status: 201 });
    cookies.forEach((cookie) => {
        res.headers.append("Set-Cookie", cookie);
    });
    return res;
}
export async function VerifyPasskeyAuthentication(request, rpID, session_callback) {
    try {
        const parsedCookies = parseCookies(request.headers);
        const challenge = parsedCookies.get("__session-webpk-challenge");
        if (!challenge) {
            throw new MissingOrInvalidSession();
        }
        // @ts-expect-error TODO: Fix undefined object method
        const { data } = (await request.json());
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
        });
        if (!verification.verified) {
            throw new PasskeyVerificationAPIError();
        }
        const { credentialID, credentialDeviceType, credentialBackedUp, newCounter, } = verification.authenticationInfo;
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
        });
    }
    catch (error) {
        console.error(error);
        return Response.json({});
    }
}
//# sourceMappingURL=authentication.js.map