# Okta Auth Provider

> Authenticate users via Okta using OpenID Connect (OIDC).

Source: [`src/providers/oidc/okta.ts`](../../src/providers/oidc/okta.ts)

---

## Table of Contents

- [Overview](#overview)
- [Setup in Okta](#setup-in-okta)
- [Configuration](#configuration)
- [Usage](#usage)
- [Parameters Reference](#parameters-reference)
- [Default Scope](#default-scope)
- [Returns](#returns)

---

## Overview

`OktaAuthProvider` implements OIDC-based authentication via Okta. It uses Okta's OIDC discovery document to resolve endpoints automatically from the `issuer` URL, which is derived from the `domain` you provide.

**Protocol:** OIDC
**Callback ID:** `okta`
**Default scope:** `email openid profile`

---

## Setup in Okta

### 1. Create an OIDC Application

1. Sign in to your [Okta Admin Console](https://developer.okta.com/).
2. In the left sidebar, navigate to **Applications → Applications**.
3. Click **Create App Integration**.
4. Select **OIDC - OpenID Connect** as the sign-in method and **Web Application** as the application type.
5. Click **Next**.

### 2. Configure the Application

1. Give the app a name.
2. Under **Sign-in redirect URIs**, add your callback URL:

   ```
   https://your-domain.com/api/{name}/oauth/callback/okta
   ```

   For local development, also add:

   ```
   http://localhost:3000/api/{name}/oauth/callback/okta
   ```

   Replace `{name}` with the `name` you passed to `authPlugin()` (e.g. `admin`, `storefront`).

3. Under **Sign-out redirect URIs**, optionally add your sign-out landing page.
4. Under **Assignments**, choose who can use this application (everyone in the org, or specific groups).
5. Click **Save**.

### 3. Collect Credentials

1. On the application's **General** tab, copy the **Client ID** and **Client Secret**.
2. Your Okta domain is shown in the top-right corner of the Admin Console (e.g. `dev-12345678.okta.com`).

```sh
OKTA_CLIENT_ID=your-client-id
OKTA_CLIENT_SECRET=your-client-secret
OKTA_DOMAIN=dev-12345678.okta.com
```

> **Note:** For Okta Identity Engine (OIE) organizations the domain typically ends with `.okta.com`. For Okta Classic Engine organizations it may end with `.oktapreview.com` for sandbox environments.

---

## Configuration

```ts
// payload.config.ts
import { buildConfig } from 'payload'
import { authPlugin } from 'payload-auth-plugin'
import { OktaAuthProvider } from 'payload-auth-plugin/providers'

export default buildConfig({
  plugins: [
    authPlugin({
      name: 'admin',
      usersCollectionSlug: 'users',
      accountsCollectionSlug: 'accounts',
      successRedirectPath: '/admin',
      errorRedirectPath: '/admin/login',
      providers: [
        OktaAuthProvider({
          client_id: process.env.OKTA_CLIENT_ID!,
          client_secret: process.env.OKTA_CLIENT_SECRET!,
          domain: process.env.OKTA_DOMAIN!,
        }),
      ],
    }),
  ],
})
```

The plugin constructs the OIDC issuer URL as:

```
https://{domain}
```

Okta publishes its OIDC discovery document at:

```
https://{domain}/.well-known/openid-configuration
```

---

## Usage

### Trigger sign-in from a component

```tsx
// src/components/OktaSignIn.tsx
'use client'
import { adminAuthClient } from '@/lib/auth'

export function OktaSignInButton() {
  const { oauth } = adminAuthClient.signin()

  return (
    <button
      onClick={() => oauth('okta')}
      style={{ backgroundColor: '#007DC1', color: '#fff' }}
    >
      Sign in with Okta
    </button>
  )
}
```

Clicking the button redirects the browser to:

```
{baseURL}/api/{name}/oauth/authorize/okta
```

After the user authenticates via Okta, they are redirected back to:

```
https://your-domain.com/api/{name}/oauth/callback/okta
```

The plugin validates the OIDC tokens using Okta's discovery document, upserts the Account and User documents, issues a session cookie, and redirects to `successRedirectPath`.

---

## Parameters Reference

`OktaAuthProvider` accepts a config object with the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `client_id` | `string` | Yes | Client ID from the Okta application's General tab. |
| `client_secret` | `string` | Yes | Client Secret from the Okta application's General tab. |
| `domain` | `string` | Yes | Your Okta organization domain (e.g. `dev-12345678.okta.com`). Do **not** include `https://` or a trailing slash. |
| `client_auth_type` | `'client_secret_basic' \| 'client_secret_post'` | No | Token endpoint authentication method. Defaults to Okta's standard (`client_secret_basic`). |
| `params` | `Record<string, string>` | No | Extra query parameters appended to the authorization request URL. |
| `overrideScope` | `string` | No | Replace the default scope (`email openid profile`) with a custom scope string. |

---

## Default Scope

```
email openid profile
```

- `openid` — enables OIDC token issuance
- `email` — grants access to the user's email address
- `profile` — grants access to the user's basic profile (name, picture, etc.)

To request additional Okta scopes (e.g. `offline_access` for refresh tokens, or custom authorization server scopes), use `overrideScope`:

```ts
OktaAuthProvider({
  client_id: process.env.OKTA_CLIENT_ID!,
  client_secret: process.env.OKTA_CLIENT_SECRET!,
  domain: process.env.OKTA_DOMAIN!,
  overrideScope: 'email openid profile offline_access',
})
```

> Custom authorization server scopes must be defined in **Security → API → Authorization Servers** in your Okta Admin Console.

---

## Common `params` Options

Use the `params` field to pass Okta-specific query parameters:

```ts
OktaAuthProvider({
  client_id: process.env.OKTA_CLIENT_ID!,
  client_secret: process.env.OKTA_CLIENT_SECRET!,
  domain: process.env.OKTA_DOMAIN!,
  params: {
    // Force the Okta login page even if the user has an active session
    prompt: 'login',
    // Pre-fill the username/email field
    login_hint: 'user@company.com',
    // Specify a specific Identity Provider (IdP) to skip Okta's IdP chooser
    idp: 'your-idp-id',
  },
})
```

---

## Returns

`OktaAuthProvider` returns an `OIDCProviderConfig` object:

```ts
{
  id: 'okta',
  name: 'Okta',
  algorithm: 'oidc',
  kind: 'oauth',
  issuer: `https://${domain}`,
  scope: 'email openid profile',  // or overrideScope
  params: {
    state: `state-${encodedClientId}`,  // auto-generated state parameter
  },
  client_id: '...',
  client_secret: '...',
  profile: (profile) => ({
    sub: profile.sub,
    name: profile.name,
    email: profile.email,
    picture: profile.picture,
  }),
}
```

> The provider automatically encodes the `client_id` into a `state` parameter for additional CSRF protection during the OAuth flow.

**`AccountInfo` fields populated from Okta:**

| Field | Okta claim | Description |
|-------|-----------|-------------|
| `sub` | `sub` | Stable, unique Okta user identifier (UUID) |
| `name` | `name` | User's full name |
| `email` | `email` | User's primary email address |
| `picture` | `picture` | URL of the user's profile photo (if set) |

---

## Troubleshooting

| Issue | Likely cause | Fix |
|-------|-------------|-----|
| `redirect_uri_mismatch` | Callback URL not registered | Add the exact callback URL under **Sign-in redirect URIs** in the app settings |
| `invalid_client` | Wrong credentials | Verify `OKTA_CLIENT_ID` and `OKTA_CLIENT_SECRET` |
| `User is not assigned` | App assignment not configured | Add the user or group to the application under **Assignments** |
| Missing `email` in profile | Email scope not requested | Ensure `email` is in the scope and the user has an email set in their Okta profile |
| Discovery document 404 | Wrong `domain` | Verify the URL `https://{domain}/.well-known/openid-configuration` is reachable in a browser |

---

## See Also

- [Providers Overview](./README.md) — all supported providers
- [Configuration](../configuration.md) — full `authPlugin()` options
- [Auth Client](../auth-client.md) — triggering OAuth sign-in from the browser
- [Setup Guide](../setup.md) — end-to-end integration walkthrough