# Keycloak Auth Provider

> Authenticate users via a self-hosted or cloud Keycloak instance using OpenID Connect (OIDC).

Source: [`src/providers/oidc/keycloak.ts`](../../src/providers/oidc/keycloak.ts)

---

## Table of Contents

- [Overview](#overview)
- [Setup in Keycloak](#setup-in-keycloak)
- [Configuration](#configuration)
- [Usage](#usage)
- [Parameters Reference](#parameters-reference)
- [Default Scope](#default-scope)
- [Multiple Keycloak Realms](#multiple-keycloak-realms)
- [Returns](#returns)

---

## Overview

`KeyCloakAuthProvider` implements OIDC-based authentication via Keycloak. Unlike most other providers, Keycloak is typically **self-hosted**, which means you configure the domain and realm that point to your own Keycloak instance. The plugin resolves endpoints automatically via Keycloak's OIDC discovery document.

**Protocol:** OIDC
**Callback ID:** Configurable via `identifier` (e.g. `keycloak`)
**Default scope:** `email openid profile`

> **Note:** Because Keycloak supports multiple realms and can be self-hosted at any domain, the `identifier`, `name`, `realm`, and `domain` fields are all required — unlike most other providers that have hardcoded IDs and issuer URLs.

---

## Setup in Keycloak

### 1. Create a Realm (or use an existing one)

1. Sign in to your Keycloak Admin Console (e.g. `https://your-keycloak-domain/admin`).
2. In the top-left dropdown, select the realm you want to use, or click **Create Realm** to create a new one.
3. Note your **realm name** (e.g. `myrealm`).

### 2. Create a Client

1. In the left sidebar, navigate to **Clients**.
2. Click **Create client**.
3. Set:
   - **Client type** — `OpenID Connect`
   - **Client ID** — a unique identifier for your Payload app (e.g. `payload-app`)
4. Click **Next**.
5. Enable **Client authentication** (this makes it a confidential client with a client secret).
6. Under **Valid redirect URIs**, add your callback URL:

   ```
   https://your-domain.com/api/{name}/oauth/callback/{identifier}
   ```

   For local development, also add:

   ```
   http://localhost:3000/api/{name}/oauth/callback/{identifier}
   ```

   Replace `{name}` with the `name` passed to `authPlugin()` and `{identifier}` with the `identifier` you'll pass to `KeyCloakAuthProvider` (e.g. `keycloak`).

7. Click **Save**.
8. Navigate to the **Credentials** tab and copy the **Client Secret**.

### 3. Set environment variables

```sh
KEYCLOAK_DOMAIN=your-keycloak-domain.com
KEYCLOAK_REALM=myrealm
KEYCLOAK_CLIENT_ID=payload-app
KEYCLOAK_CLIENT_SECRET=your-client-secret
```

---

## Configuration

```ts
// payload.config.ts
import { buildConfig } from 'payload'
import { authPlugin } from 'payload-auth-plugin'
import { KeyCloakAuthProvider } from 'payload-auth-plugin/providers'

export default buildConfig({
  plugins: [
    authPlugin({
      name: 'admin',
      usersCollectionSlug: 'users',
      accountsCollectionSlug: 'accounts',
      successRedirectPath: '/admin',
      errorRedirectPath: '/admin/login',
      providers: [
        KeyCloakAuthProvider({
          realm: process.env.KEYCLOAK_REALM!,
          domain: process.env.KEYCLOAK_DOMAIN!,
          identifier: 'keycloak',  // used as the provider ID in the callback URL
          name: 'Keycloak',        // display name shown in the UI
          client_id: process.env.KEYCLOAK_CLIENT_ID!,
          client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
        }),
      ],
    }),
  ],
})
```

The plugin constructs the OIDC issuer URL as:

```
https://{domain}/realms/{realm}
```

For example, with `domain: "auth.mycompany.com"` and `realm: "myrealm"`, the issuer becomes:

```
https://auth.mycompany.com/realms/myrealm
```

Keycloak publishes its OIDC discovery document at:

```
https://{domain}/realms/{realm}/.well-known/openid-configuration
```

---

## Usage

### Trigger sign-in from a component

```tsx
// src/components/KeycloakSignIn.tsx
'use client'
import { adminAuthClient } from '@/lib/auth'

export function KeycloakSignInButton() {
  const { oauth } = adminAuthClient.signin()

  // Use the same `identifier` you passed to KeyCloakAuthProvider
  return (
    <button onClick={() => oauth('keycloak')}>
      Sign in with Keycloak
    </button>
  )
}
```

Clicking the button redirects the browser to:

```
{baseURL}/api/{name}/oauth/authorize/keycloak
```

After the user authenticates via Keycloak, they are redirected back to:

```
https://your-domain.com/api/{name}/oauth/callback/keycloak
```

The plugin validates the OIDC tokens using Keycloak's discovery document, upserts the Account and User documents, issues a session cookie, and redirects to `successRedirectPath`.

---

## Parameters Reference

`KeyCloakAuthProvider` accepts a config object with the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `realm` | `string` | Yes | The Keycloak realm name (e.g. `myrealm`). Used to construct the OIDC issuer URL. |
| `domain` | `string` | Yes | The hostname of your Keycloak server (e.g. `auth.mycompany.com`). Do **not** include `https://` or a trailing slash. |
| `identifier` | `string` | Yes | A unique slug used as the provider ID in the callback URL path. You must use this same value when calling `oauth(identifier)` on the client. |
| `name` | `string` | Yes | Human-readable display name for this provider (e.g. `"Keycloak"`, `"Company SSO"`). |
| `client_id` | `string` | Yes | Client ID from the Keycloak client configuration. |
| `client_secret` | `string` | Yes | Client secret from the Keycloak client's **Credentials** tab. |
| `client_auth_type` | `'client_secret_basic' \| 'client_secret_post'` | No | Token endpoint authentication method. Defaults to `client_secret_basic`. |
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

To request additional Keycloak-specific scopes (e.g. custom realm roles), use `overrideScope`:

```ts
KeyCloakAuthProvider({
  realm: process.env.KEYCLOAK_REALM!,
  domain: process.env.KEYCLOAK_DOMAIN!,
  identifier: 'keycloak',
  name: 'Keycloak',
  client_id: process.env.KEYCLOAK_CLIENT_ID!,
  client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
  overrideScope: 'email openid profile roles',
})
```

> Custom scopes must be configured as **Client Scopes** or **Realm Roles** in your Keycloak realm and mapped to the client before they can be requested.

---

## Multiple Keycloak Realms

Because `identifier` is configurable, you can register multiple Keycloak providers for different realms simultaneously:

```ts
providers: [
  // Employee SSO — internal realm
  KeyCloakAuthProvider({
    realm: 'employees',
    domain: process.env.KEYCLOAK_DOMAIN!,
    identifier: 'keycloak-employees',
    name: 'Employee SSO',
    client_id: process.env.KEYCLOAK_EMPLOYEE_CLIENT_ID!,
    client_secret: process.env.KEYCLOAK_EMPLOYEE_CLIENT_SECRET!,
  }),

  // Partner SSO — external realm
  KeyCloakAuthProvider({
    realm: 'partners',
    domain: process.env.KEYCLOAK_DOMAIN!,
    identifier: 'keycloak-partners',
    name: 'Partner SSO',
    client_id: process.env.KEYCLOAK_PARTNER_CLIENT_ID!,
    client_secret: process.env.KEYCLOAK_PARTNER_CLIENT_SECRET!,
  }),
]
```

On the client, trigger each provider using its `identifier`:

```tsx
const { oauth } = authClient.signin()

<button onClick={() => oauth('keycloak-employees')}>Employee SSO</button>
<button onClick={() => oauth('keycloak-partners')}>Partner SSO</button>
```

Register the corresponding callback URLs in each Keycloak realm:

```
https://your-domain.com/api/{name}/oauth/callback/keycloak-employees
https://your-domain.com/api/{name}/oauth/callback/keycloak-partners
```

---

## Returns

`KeyCloakAuthProvider` returns an `OIDCProviderConfig` object:

```ts
{
  id: identifier,   // e.g. 'keycloak'
  name: name,       // e.g. 'Keycloak'
  algorithm: 'oidc',
  kind: 'oauth',
  issuer: `https://${domain}/realms/${realm}`,
  scope: 'email openid profile',  // or overrideScope
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

**`AccountInfo` fields populated from Keycloak:**

| Field | Keycloak claim | Description |
|-------|---------------|-------------|
| `sub` | `sub` | Stable, unique Keycloak user UUID |
| `name` | `name` | User's full name |
| `email` | `email` | User's primary email address |
| `picture` | `picture` | URL of the user's profile photo (if set) |

---

## Troubleshooting

| Issue | Likely cause | Fix |
|-------|-------------|-----|
| `invalid_redirect_uri` | Callback URL not registered | Add the exact callback URL under **Valid redirect URIs** in the Keycloak client settings |
| `Client not found` | Wrong `client_id` or wrong realm | Verify `KEYCLOAK_CLIENT_ID` and `KEYCLOAK_REALM` match the Keycloak client |
| `unauthorized_client` | Client authentication disabled | Enable **Client authentication** on the Keycloak client to make it confidential |
| Missing `email` in profile | Email scope not configured | Ensure the `email` client scope is added to the client's **Client Scopes** tab in Keycloak |
| Discovery document 404 | Wrong `domain` or `realm` | Verify the URL `https://{domain}/realms/{realm}/.well-known/openid-configuration` is reachable |

---

## See Also

- [Providers Overview](./README.md) — all supported providers
- [Configuration](../configuration.md) — full `authPlugin()` options
- [Auth Client](../auth-client.md) — triggering OAuth sign-in from the browser
- [Setup Guide](../setup.md) — end-to-end integration walkthrough