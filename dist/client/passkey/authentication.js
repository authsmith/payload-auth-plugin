import { startAuthentication } from "@simplewebauthn/browser";
export const authentication = async (passkey, email) => {
    const resp = await fetch("/api/admin/passkey/generate-authentication-options", {
        method: "POST",
        body: JSON.stringify({ data: { passkey } }),
    });
    const optionsJSON = await resp.json();
    try {
        const authenticationResp = await startAuthentication({
            optionsJSON: optionsJSON.options,
        });
        const response = await fetch("/api/admin/passkey/verify-authentication", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                data: { email, authentication: authenticationResp, passkey },
            }),
        });
        if (response.redirected) {
            window.location.href = response.url; // Redirect the user explicitly
        }
    }
    catch (error) {
        console.log(error);
    }
};
//# sourceMappingURL=authentication.js.map