import { browserSupportsWebAuthn } from "@simplewebauthn/browser";
import { registration } from "./registration.js";
import { authentication } from "./authentication.js";
//NOTE: EXPERIMENTAL
export const init = async () => {
    if (!browserSupportsWebAuthn()) {
        console.log("It seems this browser does not support WebAuthn/Passkey. Reach out to the plugin author");
        return;
    }
    //TODO: Need a better way to implement email vaildation
    const emailInput = document.getElementById("field-email");
    const emailValue = emailInput.value;
    if (!emailValue) {
        alert("Enter your email");
        return;
    }
    const response = await fetch("/api/admin/passkey/init", {
        method: "POST",
        body: JSON.stringify({ data: { email: emailInput.value } }),
    });
    if (response.ok) {
        const { data } = await response.json();
        if (Object.entries(data).length === 0) {
            return await registration(emailInput.value);
        }
        return await authentication({
            backedUp: data["passkey"]["backedUp"],
            counter: data["passkey"]["counter"],
            credentialId: data["passkey"]["credentialId"],
            deviceType: data["passkey"]["deviceType"],
            publicKey: data["passkey"]["publicKey"],
            transports: data["passkey"]["transports"],
        }, emailInput.value);
    }
};
//# sourceMappingURL=index.js.map