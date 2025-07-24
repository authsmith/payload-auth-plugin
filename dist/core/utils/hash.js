import * as jose from "jose";
export function hashCode(s) {
    let h = 0;
    const l = s.length;
    let i = 0;
    if (l > 0)
        while (i < l)
            h = ((h << 5) + h + s.charCodeAt(i++)) | 0;
    return h;
}
export const ephemeralCode = async (length, secret) => {
    const code = [];
    while (code.length < length) {
        const buffer = crypto.getRandomValues(new Uint8Array(length * 2));
        for (const byte of buffer) {
            if (byte < 250 && code.length < length) {
                code.push(byte % 10);
            }
        }
    }
    const codeStr = code.join("");
    const iterations = 600000;
    const encoder = new TextEncoder();
    const bytes = encoder.encode(codeStr);
    const salt = encoder.encode(secret);
    const keyMaterial = await crypto.subtle.importKey("raw", bytes, "PBKDF2", false, ["deriveBits"]);
    const hash = await crypto.subtle.deriveBits({
        name: "PBKDF2",
        hash: "SHA-256",
        salt: salt,
        iterations,
    }, keyMaterial, 256);
    const hashB64 = jose.base64url.encode(new Uint8Array(hash));
    return {
        hash: hashB64,
        code: codeStr,
    };
};
export const verifyEphemeralCode = async (code, hashB64, secret) => {
    const encoder = new TextEncoder();
    const codeBytes = encoder.encode(code);
    const salt = encoder.encode(secret);
    const params = {
        name: "PBKDF2",
        hash: "SHA-256",
        salt,
        iterations: 600000,
    };
    const keyMaterial = await crypto.subtle.importKey("raw", codeBytes, "PBKDF2", false, ["deriveBits"]);
    const hash = await crypto.subtle.deriveBits(params, keyMaterial, 256);
    const hashBase64 = jose.base64url.encode(new Uint8Array(hash));
    return hashBase64 === hashB64;
};
//# sourceMappingURL=hash.js.map