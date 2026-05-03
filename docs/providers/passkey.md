# Passkey Auth Provider

> WebAuthn / FIDO2 passkey authentication — biometric and hardware-key based sign-in.

Source: [`src/providers/passkey.ts`](../../src/providers/passkey.ts)

---

> ⚠️ **Experimental:** The Passkey provider is not yet stable and is **not recommended for production use**. The API and behaviour may change without notice in future releases. Use it to evaluate or prototype passkey authentication only.

---

## Table of Contents

- [Overview](#overview)
- [How Passkeys Work](#how-passkeys-work)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Registration (Creating a Passkey)](#registration-creating-a-passkey)
  - [Authentication (Signing In)](#authentication-signing-in)
- [Parameters Reference](#parameters-reference)
- [Account Storage](#account-storage)
- [Returns](#returns)
- [Known Limitations](#known-limitations)

---

## Overview

`PasskeyAuthProvider` enables [WebAuthn](https://www.w3.org/TR/webauthn-2/) / [FIDO2](https://fidoalliance.org/fido2/) passkey authentication. Users can sign in using:

- **Biometrics** — Touch ID, Face ID, Windows Hello
- **Hardware security keys** — YubiKey, Titan Key, etc.
- **Device PINs** — screen lock PINs on phones and computers

Passkeys are more secure than passwords (no phishing, no credential stuffing) and provide a frictionless user experience. The plugin uses the [`@simplewebauthn/server`](https://simplewebauthn.dev/) library on the server side and [`@simplewebauthn/browser`](https://simplewebauthn.dev/) on the client side.

**Protocol:** WebAuthn / FIDO2
**Provider ID:** `passkey`

---

## How Passkeys Work

```
Registration (creating a passkey):
  Browser           Server
    │                  │
    │ 1. Request options (challenge)
    │─────────────────►│
    │◄─────────────────│
    │                  │
    │ 2. Create credential (biometric prompt)
    │ (local to device)│
    │                  │
    │ 3. Send credential response
    │─────────────────►│
    │                  │ 4. Verify & store credential
    │◄─────────────────│
    │ 5. Session cookie│

Authentication (signing in with a passkey):
  Browser           Server
    │                  │
    │ 1. Request options (challenge)
    │─────────────────►│
    │◄─────────────────│
    │                  │
    │ 2. Sign challenge (biometric prompt)
    │ (local to device)│
    │                  │
    │ 3. Send assertion response
    │─────────────────►│
    │                  │ 4. Verify signature & counter
    │◄─────────────────│
    │ 5. Session cookie│
```

The private key **never leaves the user's device**. The server only stores the public key (in the `passkey` group field of the Accounts collection) and a counter that increments with each use to detect cloned keys.

---

## Configuration

```ts
// payload.config.ts
import { buildConfig } from 'payload'
import { authPlugin } from 'payload-auth-plugin'
import { PasskeyAuthProvider } from 'payload-auth-plugin/providers'

export default buildConfig({
  plugins: [
    authPlugin({
      name: 'app',
      usersCollectionSlug: 'users',
      accountsCollectionSlug: 'accounts',
      successRedirectPath: '/dashboard',
      errorRedirectPath: '/auth/signin',
      providers: [
        PasskeyAuthProvider(),
      ],
    }),
  ],
})
```

`PasskeyAuthProvider` takes no configuration arguments. All WebAuthn options (RP ID, origin, challenge TTL, etc.) are derived automatically from your Payload `serverURL`.

---

## Usage

The passkey flow requires two separate API calls per operation: one to **get options** (the server-generated challenge) and one to **verify** the credential response. The `@simplewebauthn/browser` package handles the browser-side interaction.

### Install the browser-side library

```sh
npm install @simplewebauthn/browser
```

### Registration (Creating a Passkey)

```tsx
// src/components/RegisterPasskey.tsx
'use client'
import { startRegistration } from '@simplewebauthn/browser'
import { appAuthClient } from '@/lib/auth'

export function RegisterPasskeyButton() {
  const handleRegister = async () => {
    // Step 1: Get registration options from the server
    const optionsRes = await fetch(
      `${process.env.NEXT_PUBLIC_PAYLOAD_AUTH_URL}/api/app/passkey/register-options`,
      { method: 'POST' }
    )
    const options = await optionsRes.json()

    // Step 2: Trigger the browser's WebAuthn dialog (biometric / security key prompt)
    let credential
    try {
      credential = await startRegistration(options)
    } catch (err) {
      console.error('Registration cancelled or failed:', err)
      return
    }

    // Step 3: Send the credential response to the server for verification
    const verifyRes = await fetch(
      `${process.env.NEXT_PUBLIC_PAYLOAD_AUTH_URL}/api/app/passkey/register`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credential),
      }
    )
    const result = await verifyRes.json()

    if (result.isSuccess) {
      console.log('Passkey registered successfully!')
    } else {
      console.error('Registration failed:', result.message)
    }
  }

  return (
    <button onClick={handleRegister}>
      Register a Passkey
    </button>
  )
}
```

### Authentication (Signing In)

```tsx
// src/components/PasskeySignIn.tsx
'use client'
import { startAuthentication } from '@simplewebauthn/browser'

export function PasskeySignInButton() {
  const handleSignIn = async () => {
    // Step 1: Get authentication options from the server
    const optionsRes = await fetch(
      `${process.env.NEXT_PUBLIC_PAYLOAD_AUTH_URL}/api/app/passkey/auth-options`,
      { method: 'POST' }
    )
    const options = await optionsRes.json()

    // Step 2: Trigger the browser's WebAuthn dialog
    let assertion
    try {
      assertion = await startAuthentication(options)
    } catch (err) {
      console.error('Authentication cancelled or failed:', err)
      return
    }

    // Step 3: Send the assertion to the server for verification
    const verifyRes = await fetch(
      `${process.env.NEXT_PUBLIC_PAYLOAD_AUTH_URL}/api/app/passkey/auth`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assertion),
      }
    )
    const result = await verifyRes.json()

    if (result.isSuccess) {
      // Session cookie is now set — navigate to the protected area
      window.location.href = '/dashboard'
    } else {
      console.error('Authentication failed:', result.message)
    }
  }

  return (
    <button onClick={handleSignIn}>
      Sign in with Passkey
    </button>
  )
}
```

---

## Parameters Reference

`PasskeyAuthProvider()` takes no arguments.

```ts
PasskeyAuthProvider()
// → PasskeyProviderConfig { id: 'passkey', kind: 'passkey' }
```

| Field | Type | Value | Description |
|-------|------|-------|-------------|
| `id` | `string` | `'passkey'` | Fixed provider identifier |
| `kind` | `string` | `'passkey'` | Fixed provider kind discriminant |

---

## Account Storage

When a passkey is successfully registered, a new Account document is created in the Accounts collection with `issuerName: 'Passkey'`. The credential data is stored in the `passkey` group field:

```ts
// Accounts collection — passkey account document
{
  issuerName: 'Passkey',
  user: { /* relationship to User doc */ },
  sub: credentialId,
  passkey: {
    credentialId: string,
    publicKey: Uint8Array,  // serialised as JSON
    counter: number,
    transports: string[],   // e.g. ['internal', 'usb']
    deviceType: 'singleDevice' | 'multiDevice',
    backedUp: boolean,
  }
}
```

The `passkey` group fields are conditionally shown in the Payload admin UI only when `issuerName === 'Passkey'`.

Source: [`src/collection/index.ts`](../../src/collection/index.ts) — see the `passkey` group field definition in `withAccountCollection`.

---

## Returns

`PasskeyAuthProvider` returns a `PasskeyProviderConfig` object:

```ts
{
  id: 'passkey',
  kind: 'passkey',
}
```

Source: [`src/types.ts`](../../src/types.ts)

---

## Known Limitations

| Limitation | Details |
|------------|---------|
| **Experimental** | The implementation is under active development. Breaking changes may occur without a major version bump. |
| **Not recommended for production** | Do not use in user-facing production applications until this warning is removed. |
| **Single passkey per account** | The current implementation stores one passkey per Account document. Multi-device / multi-passkey scenarios may not be fully supported. |
| **No `AuthClient` helpers** | Unlike password auth, there are no `AuthClient` helper methods for passkeys. You must make the raw API calls using `@simplewebauthn/browser` directly (as shown in the examples above). |
| **HTTPS required** | WebAuthn is only available in secure contexts (`https://`). Passkeys will not work on plain `http://` origins except `localhost`. |
| **Platform support** | Passkey support depends on the user's browser and operating system. Safari on iOS/macOS, Chrome on Android, and modern desktop browsers all support passkeys. Internet Explorer does not. |

---

## See Also

- [Providers Overview](./README.md) — all supported providers
- [Collections](../collections.md) — `passkey` group field in `withAccountCollection`
- [Configuration](../configuration.md) — full `authPlugin()` options
- [SimpleWebAuthn documentation](https://simplewebauthn.dev/) — the underlying WebAuthn library
- [WebAuthn guide (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API) — browser API reference