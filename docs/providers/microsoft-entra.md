# Microsoft Entra Auth Provider

> Authenticate users via Microsoft Entra ID (formerly Azure Active Directory) using OpenID Connect (OIDC).

Source: [`src/providers/oidc/microsoft-entra.ts`](../../src/providers/oidc/microsoft-entra.ts)

---

## Table of Contents

- [Overview](#overview)
- [Setup in Azure Portal](#setup-in-azure-portal)
- [Configuration](#configuration)
- [Usage](#usage)
- [Parameters Reference](#parameters-reference)
- [Default Scope](#default-scope)
- [Tenant Types](#tenant-types)
- [Returns](#returns)

---

## Overview

`MicrosoftEntraAuthProvider` implements OIDC-based authentication via Microsoft Entra ID (formerly Azure Active Directory). It uses the tenant-specific OIDC discovery document to resolve endpoints automatically.

**Protocol:** OIDC
**Callback ID:** `msft-entra`
**Default scope:** `openid profile email`

---

## Setup in Azure Portal

1. Sign in to the [Azure Portal](https://portal.azure.com/) and navigate to **Microsoft Entra ID** (search for "Entra ID" or "Azure Active Directory").
2. In the left sidebar, navigate to **App registrations**.
3. Click **New registration**.
4. Fill in:
   - **Name** — your application name
   - **Supported account types** — choose based on who should be able to sign in:
     - **Single tenant** — only users in your organization
     - **Multitenant** — users in any Microsoft Entra organization
     - **Multitenant + personal Microsoft accounts** — broadest support
5. Under **Redirect URI**, select **Web** and enter your callback URL:

   ```
   https://your-domain.com/api/{name}/oauth/callback/msft-entra
   ```

   For local development, also add:

   ```
   http://localhost:3000/api/{name}/oauth/callback/msft-entra
   ```

   Replace `{name}` with the `name` you passed to `authPlugin()` (e.g. `admin`, `storefront`).

6. Click **Register**.
7. On the **Overview** page, copy:
   - **Application (client) ID** → your `client_id`
   - **Directory (tenant) ID** → your `tenant_id`

8. Navigate to **Certificates & secrets → Client secrets**.
9. Click **New client secret**, give it a description, set an expiry, and click **Add**.
10. Copy the **Value** immediately (it is only shown once) → your `client_secret`.

11. Add the values to your `.env` file:

    ```sh
    MSFT_ENTRA_CLIENT_ID=your-application-client-id
    MSFT_ENTRA_CLIENT_SECRET=your-client-secret-value
    MSFT_ENTRA_TENANT_ID=your-directory-tenant-id
    ```

### Grant API Permissions

1. In your app registration, navigate to **API permissions**.
2. Click **Add a permission → Microsoft Graph → Delegated permissions**.
3. Search for and add:
   - `openid`
   - `profile`
   - `email`
   - `User.Read`
4. Click **Add permissions**.
5. If your organization requires admin consent, click **Grant admin consent for {your org}**.

---

## Configuration

```ts
// payload.config.ts
import { buildConfig } from 'payload'
import { authPlugin } from 'payload-auth-plugin'
import { MicrosoftEntraAuthProvider } from 'payload-auth-plugin/providers'

export default buildConfig({
  plugins: [
    authPlugin({
      name: 'admin',
      usersCollectionSlug: 'users',
      accountsCollectionSlug: 'accounts',
      successRedirectPath: '/admin',
      errorRedirectPath: '/admin/login',
      providers: [
        MicrosoftEntraAuthProvider({
          client_id: process.env.MSFT_ENTRA_CLIENT_ID!,
          client_secret: process.env.MSFT_ENTRA_CLIENT_SECRET!,
          tenant_id: process.env.MSFT_ENTRA_TENANT_ID!,
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
// src/components/MicrosoftSignIn.tsx
'use client'
import { adminAuthClient } from '@/lib/auth'

export function MicrosoftSignInButton() {
  const { oauth } = adminAuthClient.signin()

  return (
    <button
      onClick={() => oauth('msft-entra')}
      style={{ backgroundColor: '#0078D4', color: '#fff' }}
    >
      Sign in with Microsoft
    </button>
  )
}
```

Clicking the button redirects the browser to:

```
{baseURL}/api/{name}/oauth/authorize/msft-entra
```

After the user authenticates via the Microsoft identity platform, they are redirected back to:

```
https://your-domain.com/api/{name}/oauth/callback/msft-entra
```

The plugin validates the OIDC tokens using the tenant's discovery document, upserts the Account and User documents, issues a session cookie, and redirects to `successRedirectPath`.

---

## Parameters Reference

`MicrosoftEntraAuthProvider` accepts a config object with the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `client_id` | `string` | Yes | Application (client) ID from the Azure app registration overview page. |
| `client_secret` | `string` | Yes | Client secret value from **Certificates & secrets**. |
| `tenant_id` | `string` | Yes | Directory (tenant) ID from the Azure app registration overview page. Used to construct the tenant-specific OIDC issuer URL (`https://login.microsoftonline.com/{tenant_id}/v2.0`). |
| `client_auth_type` | `'client_secret_basic' \| 'client_secret_post'` | No | Token endpoint authentication method. Defaults to Microsoft's standard (`client_secret_post`). |
| `params` | `Record<string, string>` | No | Extra query parameters appended to the authorization request URL. |
| `overrideScope` | `string` | No | Replace the default scope (`openid profile email`) with a custom scope string. |

---

## Default Scope

```
openid profile email
```

- `openid` — enables OIDC token issuance
- `profile` — grants access to the user's basic profile claims (name, picture, etc.)
- `email` — grants access to the user's email address

To request Microsoft Graph API scopes (e.g. for accessing calendar or mail), use `overrideScope`:

```ts
MicrosoftEntraAuthProvider({
  client_id: process.env.MSFT_ENTRA_CLIENT_ID!,
  client_secret: process.env.MSFT_ENTRA_CLIENT_SECRET!,
  tenant_id: process.env.MSFT_ENTRA_TENANT_ID!,
  overrideScope: 'openid profile email User.Read Calendars.Read',
})
```

> Additional Microsoft Graph permissions must first be added to your app registration under **API permissions** before they can be requested.

---

## Tenant Types

The `tenant_id` controls which users can sign in:

| `tenant_id` value | Who can sign in |
|-------------------|-----------------|
| Your directory tenant ID (UUID) | Only users in your specific Entra ID organization |
| `common` | Users from any Entra ID organization **and** personal Microsoft accounts |
| `organizations` | Users from any Entra ID organization (no personal Microsoft accounts) |
| `consumers` | Personal Microsoft accounts only (Outlook, Xbox, Hotmail, etc.) |

**Example — allow all Microsoft accounts:**

```ts
MicrosoftEntraAuthProvider({
  client_id: process.env.MSFT_ENTRA_CLIENT_ID!,
  client_secret: process.env.MSFT_ENTRA_CLIENT_SECRET!,
  tenant_id: 'common',
})
```

> When using `common` or `organizations`, the app registration's **Supported account types** must be set to **Multitenant** (or **Multitenant + personal accounts** for `common`).

---

## Common `params` Options

Use the `params` field to pass Microsoft-specific query parameters:

```ts
MicrosoftEntraAuthProvider({
  client_id: process.env.MSFT_ENTRA_CLIENT_ID!,
  client_secret: process.env.MSFT_ENTRA_CLIENT_SECRET!,
  tenant_id: process.env.MSFT_ENTRA_TENANT_ID!,
  params: {
    // Force account picker even when user is already signed in
    prompt: 'select_account',
    // Pre-fill the email/username field
    login_hint: 'user@mycompany.com',
    // Restrict sign-in to a specific domain (for multitenant apps)
    domain_hint: 'mycompany.com',
  },
})
```

---

## Returns

`MicrosoftEntraAuthProvider` returns an `OIDCProviderConfig` object:

```ts
{
  id: 'msft-entra',
  name: 'Microsoft Entra',
  algorithm: 'oidc',
  kind: 'oauth',
  issuer: `https://login.microsoftonline.com/${tenant_id}/v2.0`,
  scope: 'openid profile email',  // or overrideScope
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

The `issuer` is constructed from the `tenant_id` you provide. Microsoft publishes its OIDC discovery document at:

```
https://login.microsoftonline.com/{tenant_id}/v2.0/.well-known/openid-configuration
```

**`AccountInfo` fields populated from Microsoft Entra:**

| Field | Entra claim | Description |
|-------|-------------|-------------|
| `sub` | `sub` | Stable, unique Microsoft user identifier (scoped to your app) |
| `name` | `name` | User's display name |
| `email` | `email` | User's primary email address |
| `picture` | `picture` | URL of the user's profile photo (if available) |

> Microsoft Entra's `sub` claim is unique per user **per application**. The same user will have different `sub` values in different app registrations. If you need a globally stable ID across apps, request the `oid` claim via the `params` field or by adding it to your token claims configuration in the app manifest.

---

## Troubleshooting

| Issue | Likely cause | Fix |
|-------|-------------|-----|
| `AADSTS50011` — redirect URI mismatch | The callback URL is not registered | Add the exact callback URL under **Authentication → Redirect URIs** in the app registration |
| `AADSTS700016` — application not found | Wrong `client_id` or wrong tenant | Verify `MSFT_ENTRA_CLIENT_ID` and `MSFT_ENTRA_TENANT_ID` match the app registration |
| `AADSTS7000215` — invalid client secret | Client secret expired or wrong | Generate a new client secret under **Certificates & secrets** |
| `AADSTS65001` — no consent | User/admin hasn't consented | Either grant admin consent or enable user consent in **Enterprise applications → User settings** |
| Missing `email` claim | Email not in token | Ensure `email` is added under **API permissions** and the user has an email set in their profile |

---

## See Also

- [Providers Overview](./README.md) — all supported providers
- [Configuration](../configuration.md) — full `authPlugin()` options
- [Auth Client](../auth-client.md) — triggering OAuth sign-in from the browser
- [Setup Guide](../setup.md) — end-to-end integration walkthrough