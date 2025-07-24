import * as jose from "jose";
export const hashPassword = async (password) => {
    const iterations = 600000;
    const encoder = new TextEncoder();
    const bytes = encoder.encode(password);
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const keyMaterial = await crypto.subtle.importKey("raw", bytes, "PBKDF2", false, ["deriveBits"]);
    const hash = await crypto.subtle.deriveBits({
        name: "PBKDF2",
        hash: "SHA-256",
        salt: salt,
        iterations,
    }, keyMaterial, 256);
    const hashB64 = jose.base64url.encode(new Uint8Array(hash));
    const saltB64 = jose.base64url.encode(salt);
    return {
        hash: hashB64,
        salt: saltB64,
        iterations,
    };
};
export const verifyPassword = async (password, hashB64, saltB64, iterations) => {
    const encoder = new TextEncoder();
    const passwordBytes = encoder.encode(password);
    const salt = jose.base64url.decode(saltB64);
    const params = {
        name: "PBKDF2",
        hash: "SHA-256",
        salt,
        iterations,
    };
    const keyMaterial = await crypto.subtle.importKey("raw", passwordBytes, "PBKDF2", false, ["deriveBits"]);
    const hash = await crypto.subtle.deriveBits(params, keyMaterial, 256);
    const hashBase64 = jose.base64url.encode(new Uint8Array(hash));
    return hashBase64 === hashB64;
};
//# sourceMappingURL=password.js.map