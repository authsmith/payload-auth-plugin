import { AuthenticatorTransportFuture } from "@simplewebauthn/server";
export declare const authentication: (passkey: {
    backedUp: boolean;
    counter: 0;
    credentialId: string;
    deviceType: string;
    publicKey: Uint8Array;
    transports: AuthenticatorTransportFuture[];
}, email: string) => Promise<void>;
//# sourceMappingURL=authentication.d.ts.map