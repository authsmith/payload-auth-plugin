# Apple Auth Provider

> Authenticate users with their Apple ID using either OpenID Connect (OIDC) or plain OAuth 2.0.

Sources:
- OIDC: [`src/providers/oidc/apple.ts`](../../src/providers/oidc/apple.ts)
- OAuth 2.0: [`src/providers/oauth2/apple.ts`](../../src/providers/oauth2/apple.ts)

---

## Table of Contents

- [Overview](#overview)
- [Which Variant Should I Use?](#which-variant-should-i-use)
- [Setup in Apple Developer Console](#setup-in-apple-developer-console)
- [Configuration](#configuration)
  - [OIDC variant — `AppleOIDCAuthProvider`](#oidc-variant--appleoidcauthprovider)
  - [OAuth 2.0 variant — `AppleOAuth2Provider`](#oauth-20-variant--appleoauth2provider)
- [Usage](#usage)
- [Parameters Reference](#parameters-reference)
  - [`AppleOIDCAuthProvider` params](#appleoidcauthprovider-params)
  - [`AppleOAuth2Provider` params](#appleoauth2provider-params)
- [Default Scope](#default-scope)
- [Returns](#returns)
- [Known Limitations](#known-limitations)

---

## Overview

Apple Sign In is supported through two variants:

| Variant | Import | Protocol | `client_secret` required |
|---------|--------|----------|--------------------------|
| OIDC | `AppleOIDCAuthProvider` | OpenID Connect | **No** |
| OAuth 2.0 | `AppleOAuth2Provider` | OAuth 2.0 | **Yes** |

**Protocol:** OIDC or OAuth 2.0
**Callback ID:** `apple`
**Default scope:** `name email`

---

## Which Variant Should I Use?

- Use **`AppleOIDCAuthProvider`** if you want the simplest setup. Apple's OIDC discovery document is used to resolve endpoints automatically, and no `client_secret` is required (Apple uses a JWT-based private key flow instead, handled by the plugin).
- Use **`AppleOAuth2Provider`** if you need to explicitly supply a `client_secret` (e.g. a pre-generated JWT) and want full control over the authorization server configuration.

For most applications, **`AppleOIDCAuthProvider`** is the recommended choice.

---

## Setup in Apple Developer Console

1. Sign in to the [Apple Developer Portal](https://developer.apple.com/).
2. Navigate to **Certificates, Identifiers & Profiles → Identifiers**.
3. Register a new **App ID** (or use an existing one) and enable **Sign In with Apple**.
4. Create a **Services ID** (this is your OAuth `client_id`):
   - Register a new identifier, select **Services IDs**.
   - Enable **Sign In with Apple** and click **Configure**.
   - Set **Domains and Subdomains** to your domain (e.g. `your-domain.com`).
   - Set **Return URLs** to your callback URL:
     ```
     https://your-domain.com/api/{name}/oauth/callback/apple
     ```
     Replace `{name}` with the `name` passed to `authPlugin()` (e.g. `admin`, `storefront`).
5. For local development, Apple **does not** support `localhost` redirect URIs. Use a tunnelling tool such as [ngrok](https://ngrok.com/) or [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) to expose your local server over HTTPS.
6. Copy your **Services ID** (Client ID) into your `.env` file:

   ```sh
   APPLE_CLIENT_ID=com.yourcompany.yourapp
   # Only needed for AppleOAuth2Provider:
   APPLE_CLIENT_SECRET=your-generated-jwt
   ```

---

## Configuration

### OIDC variant — `AppleOIDCAuthProvider`

```ts
// payload.config.ts
import { buildConfig } from 'payload'
import { authPlugin } from 'payload-auth-plugin'
import { AppleOIDCAuthProvider } from 'payload-auth-plugin/providers'

export default buildConfig({
  plugins: [
    authPlugin({
      name: 'admin',
      usersCollectionSlug: 'users',
      accountsCollectionSlug: 'accounts',
      successRedirectPath: '/admin',
      errorRedirectPath: '/admin/login',
      providers: [
        AppleOIDCAuthProvider({
          client_id: process.env.APPLE_CLIENT_ID!,
          // No client_secret needed for the OIDC variant
        }),
      ],
    }),
  ],
})
```

### OAuth 2.0 variant — `AppleOAuth2Provider`

```ts
// payload.config.ts
import { buildConfig } from 'payload'
import { authPlugin } from 'payload-auth-plugin'
import { AppleOAuth2Provider } from 'payload-auth-plugin/providers'

export default buildConfig({
  plugins: [
    authPlugin({
      name: 'admin',
      usersCollectionSlug: 'users',
      accountsCollectionSlug: 'accounts',
      successRedirectPath: '/admin',
      errorRedirectPath: '/admin/login',
      providers: [
        AppleOAuth2Provider({
          client_id: process.env.APPLE_CLIENT_ID!,
          client_secret: process.env.APPLE_CLIENT_SECRET!,
        }),
      ],
    }),
  ],
})
```

---

## Usage

### Trigger sign-in from a component

```tsx
// src/components/AppleSignIn.tsx
'use client'
import { adminAuthClient } from '@/lib/auth'

export function AppleSignInButton() {
  const { oauth } = adminAuthClient.signin()

  return (
    <button
      onClick={() => oauth('apple')}
      style={{ backgroundColor: '#000', color: '#fff' }}
    >
      Sign in with Apple
    </button>
  )
}
```

Clicking the button redirects the browser to:

```
{baseURL}/api/{name}/oauth/authorize/apple
```

After the user authenticates with Apple, they are redirected back to:

```
https://your-domain.com/api/{name}/oauth/callback/apple
```

> **Important:** Apple sends the user's name and email **only on the first sign-in**. On subsequent sign-ins, Apple only provides the `sub` (user identifier). The plugin stores the name and email in the Account and User documents on first sign-in so they are available going forward.

---

## Parameters Reference

### `AppleOIDCAuthProvider` params

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `client_id` | `string` | Yes | Your Apple Services ID (e.g. `com.yourcompany.yourapp`). |
| `client_auth_type` | `'client_secret_basic' \| 'client_secret_post'` | No | Token endpoint authentication method. |
| `params` | `Record<string, string>` | No | Extra query parameters for the authorization request. |
| `overrideScope` | `string` | No | Replace the default scope with a custom value. |

### `AppleOAuth2Provider` params

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `client_id` | `string` | Yes | Your Apple Services ID. |
| `client_secret` | `string` | Yes | Your pre-generated Apple client secret JWT. |
| `client_auth_type` | `'client_secret_basic' \| 'client_secret_post'` | No | Token endpoint authentication method. |
| `params` | `Record<string, string>` | No | Extra query parameters for the authorization request. |
| `overrideScope` | `string` | No | Replace the default scope with a custom value. |

---

## Default Scope

```
name email
```

- `name` — requests the user's full name
- `email` — requests the user's email address

> As noted above, Apple only returns `name` and `email` on the **first** authorization. Store them during the initial sign-in.

---

## Returns

### `AppleOIDCAuthProvider`

Returns an `OIDCProviderConfig`:

```ts
{
  id: 'apple',
  name: 'Apple',
  algorithm: 'oidc',
  kind: 'oauth',
  issuer: 'https://appleid.apple.com',
  scope: 'name email',
  profile: (profile) => ({
    sub: profile.sub,
    name: profile.name,
    email: profile.email,
    picture: profile.picture,
  }),
}
```

### `AppleOAuth2Provider`

Returns an `OAuth2ProviderConfig`:

```ts
{
  id: 'apple',
  name: 'Apple',
  algorithm: 'oauth2',
  kind: 'oauth',
  authorization_server: {
    issuer: 'https://appleid.apple.com',
    authorization_endpoint: 'https://appleid.apple.com/auth/authorize',
    token_endpoint: 'https://appleid.apple.com/auth/token',
    userinfo_endpoint: 'https://appleid.apple.com/auth/userinfo',
  },
  scope: 'name email',
  profile: (profile) => ({
    sub: profile.sub,
    name: profile.name,
    email: profile.email,
    picture: profile.picture,
  }),
}
```

---

## Known Limitations

- **No localhost redirect URIs** — Apple does not allow `localhost` in redirect URIs. Use a tunnelling solution during development.
- **Name only available on first sign-in** — Apple sends the user's name and email only during the very first authorization. Subsequent sign-ins only provide the `sub`.
- **`client_secret` is a JWT** — Apple's client secret is not a static string. It is a signed JWT generated from your private key. Refer to the [Apple developer documentation](https://developer.apple.com/documentation/sign_in_with_apple/generate_and_validate_tokens) for how to generate it.

---

## See Also

- [Providers Overview](./README.md) — all supported providers
- [Configuration](../configuration.md) — full `authPlugin()` options
- [Auth Client](../auth-client.md) — triggering OAuth sign-in from the browser
- [Setup Guide](../setup.md) — end-to-end integration walkthrough