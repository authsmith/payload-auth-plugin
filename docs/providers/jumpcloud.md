# JumpCloud Auth Provider

> Authenticate users with their JumpCloud account using OAuth 2.0.

Source: [`src/providers/oauth2/jumpcloud.ts`](../../src/providers/oauth2/jumpcloud.ts)

---

## Table of Contents

- [Overview](#overview)
- [Setup in JumpCloud](#setup-in-jumpcloud)
- [Configuration](#configuration)
- [Usage](#usage)
- [Parameters Reference](#parameters-reference)
- [Default Scope](#default-scope)
- [Returns](#returns)

---

## Overview

`JumpCloudAuthProvider` implements OAuth 2.0 authentication via JumpCloud. JumpCloud is a cloud-based directory platform often used for enterprise identity and device management. The provider uses explicit authorization server endpoint URLs from JumpCloud's OAuth 2.0 identity service.

**Protocol:** OAuth 2.0
**Callback ID:** `jumpcloud`
**Default scope:** `openid email profile`

---

## Setup in JumpCloud

### 1. Create an SSO Application

1. Sign in to the [JumpCloud Admin Console](https://console.jumpcloud.com/).
2. In the left sidebar, navigate to **SSO Applications**.
3. Click **+ Add New Application**.
4. Select **Custom Application** and click **Next**.
5. Under **Manage Single Sign-On (SSO)**, select **Configure SSO with OIDC**.
6. Click **Next** and give the application a display name.

### 2. Configure OAuth Settings

1. On the application's **SSO** tab:
   - Set **Redirect URIs** to your callback URL:
     ```
     https://your-domain.com/api/{name}/oauth/callback/jumpcloud
     ```
     For local development, also add:
     ```
     http://localhost:3000/api/{name}/oauth/callback/jumpcloud
     ```
     Replace `{name}` with the `name` you passed to `authPlugin()` (e.g. `admin`, `storefront`).
   - Set **Login URL** to your application's sign-in page.
   - Under **Attribute Mapping**, map the standard claims:
     - `email` → user's email attribute
     - `given_name` → user's first name
     - `family_name` → user's last name

2. Click **Activate** to save and activate the application.

### 3. Collect Credentials

1. On the application's **SSO** tab, find the **Client ID** and **Client Secret**.
2. Copy them into your `.env` file:

   ```sh
   JUMP_CLOUD_CLIENT_ID=your-client-id
   JUMP_CLOUD_CLIENT_SECRET=your-client-secret
   ```

### 4. Assign Users

1. Navigate to the **User Groups** tab on the application.
2. Add the user groups that should have access to this application.
3. Click **Save**.

---

## Configuration

```ts
// payload.config.ts
import { buildConfig } from 'payload'
import { authPlugin } from 'payload-auth-plugin'
import { JumpCloudAuthProvider } from 'payload-auth-plugin/providers'

export default buildConfig({
  plugins: [
    authPlugin({
      name: 'admin',
      usersCollectionSlug: 'users',
      accountsCollectionSlug: 'accounts',
      successRedirectPath: '/admin',
      errorRedirectPath: '/admin/login',
      providers: [
        JumpCloudAuthProvider({
          client_id: process.env.JUMP_CLOUD_CLIENT_ID!,
          client_secret: process.env.JUMP_CLOUD_CLIENT_SECRET!,
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
// src/components/JumpCloudSignIn.tsx
'use client'
import { adminAuthClient } from '@/lib/auth'

export function JumpCloudSignInButton() {
  const { oauth } = adminAuthClient.signin()

  return (
    <button
      onClick={() => oauth('jumpcloud')}
      style={{ backgroundColor: '#407BFF', color: '#fff' }}
    >
      Sign in with JumpCloud
    </button>
  )
}
```

Clicking the button redirects the browser to:

```
{baseURL}/api/{name}/oauth/authorize/jumpcloud
```

After the user authenticates via JumpCloud, they are redirected back to:

```
https://your-domain.com/api/{name}/oauth/callback/jumpcloud
```

The plugin exchanges the authorization code for tokens, fetches the user profile from JumpCloud's userinfo endpoint, upserts the Account and User documents, issues a session cookie, and redirects to `successRedirectPath`.

---

## Parameters Reference

`JumpCloudAuthProvider` accepts a config object with the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `client_id` | `string` | Yes | Client ID from the JumpCloud SSO application. |
| `client_secret` | `string` | Yes | Client Secret from the JumpCloud SSO application. |
| `client_auth_type` | `'client_secret_basic' \| 'client_secret_post'` | No | Token endpoint authentication method. Defaults to JumpCloud's standard. |
| `params` | `Record<string, string>` | No | Extra query parameters appended to the authorization request URL. |
| `overrideScope` | `string` | No | Replace the default scope (`openid email profile`) with a custom scope string. |

---

## Default Scope

```
openid email profile
```

- `openid` — enables OpenID Connect token issuance
- `email` — grants access to the user's email address
- `profile` — grants access to the user's basic profile information

To request additional scopes, use `overrideScope`:

```ts
JumpCloudAuthProvider({
  client_id: process.env.JUMP_CLOUD_CLIENT_ID!,
  client_secret: process.env.JUMP_CLOUD_CLIENT_SECRET!,
  overrideScope: 'openid email profile offline_access',
})
```

---

## Returns

`JumpCloudAuthProvider` returns an `OAuth2ProviderConfig` object:

```ts
{
  id: 'jumpcloud',
  name: 'Jump Cloud',
  algorithm: 'oauth2',
  kind: 'oauth',
  authorization_server: {
    issuer: 'https://oauth.id.jumpcloud.com/',
    authorization_endpoint: 'https://oauth.id.jumpcloud.com/oauth2/auth',
    token_endpoint: 'https://oauth.id.jumpcloud.com/oauth2/token',
    userinfo_endpoint: 'https://oauth.id.jumpcloud.com/userinfo',
  },
  scope: 'openid email profile',  // or overrideScope
  client_id: '...',
  client_secret: '...',
  profile: (profile) => ({
    sub: profile.email,   // JumpCloud uses email as the stable identifier
    name: profile.name,
    email: profile.email,
    picture: profile.picture,
  }),
}
```

> **Note:** Unlike most other providers, `JumpCloudAuthProvider` uses the user's **email address** as the `sub` (subject identifier) rather than an opaque internal ID. This means the `sub` will change if the user's email address changes in JumpCloud. Design your account linking logic accordingly if email mutability is a concern in your application.

**`AccountInfo` fields populated from JumpCloud:**

| Field | JumpCloud claim | Description |
|-------|----------------|-------------|
| `sub` | `email` | User's email address (used as unique identifier) |
| `name` | `name` | User's full display name |
| `email` | `email` | User's primary email address |
| `picture` | `picture` | URL of the user's profile photo (if set) |

---

## Troubleshooting

| Issue | Likely cause | Fix |
|-------|-------------|-----|
| `redirect_uri_mismatch` | Callback URL not registered | Add the exact callback URL under **Redirect URIs** in the JumpCloud application's SSO settings |
| `invalid_client` | Wrong credentials | Verify `JUMP_CLOUD_CLIENT_ID` and `JUMP_CLOUD_CLIENT_SECRET` |
| `User is not assigned` | User not in an assigned group | Add the user or their group under the application's **User Groups** tab in JumpCloud |
| Missing `email` in profile | Attribute not mapped | Check the **Attribute Mapping** section in the application's SSO settings and ensure `email` is mapped |
| Missing `name` in profile | Name attribute not mapped | Map `given_name` and `family_name` (or a combined `name` attribute) in the JumpCloud application SSO settings |

---

## See Also

- [Providers Overview](./README.md) — all supported providers
- [Configuration](../configuration.md) — full `authPlugin()` options
- [Auth Client](../auth-client.md) — triggering OAuth sign-in from the browser
- [Setup Guide](../setup.md) — end-to-end integration walkthrough