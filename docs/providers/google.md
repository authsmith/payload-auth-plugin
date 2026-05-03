# Google Auth Provider

> Authenticate users with their Google account using OpenID Connect (OIDC).

Source: [`src/providers/oidc/google.ts`](../../src/providers/oidc/google.ts)

---

## Table of Contents

- [Overview](#overview)
- [Setup in Google Cloud Console](#setup-in-google-cloud-console)
- [Configuration](#configuration)
- [Usage](#usage)
- [Parameters Reference](#parameters-reference)
- [Default Scope](#default-scope)
- [Common `params` Options](#common-params-options)
- [Returns](#returns)

---

## Overview

`GoogleAuthProvider` implements OIDC-based authentication via Google's identity platform. It uses Google's OIDC discovery document to resolve endpoints automatically from the `issuer` URL.

**Protocol:** OIDC
**Callback ID:** `google`
**Default scope:** `email openid profile`

---

## Setup in Google Cloud Console

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and open (or create) a project.
2. Navigate to **APIs & Services → Credentials**.
3. Click **Create Credentials → OAuth client ID**.
4. Set **Application type** to **Web application**.
5. Under **Authorized redirect URIs**, add your callback URL:

   ```
   https://your-domain.com/api/{name}/oauth/callback/google
   ```

   For local development, also add:

   ```
   http://localhost:3000/api/{name}/oauth/callback/google
   ```

   Replace `{name}` with the `name` you passed to `authPlugin()` (e.g. `admin`, `storefront`).

6. Copy the generated **Client ID** and **Client Secret** into your `.env` file:

   ```sh
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

---

## Configuration

```ts
// payload.config.ts
import { buildConfig } from 'payload'
import { authPlugin } from 'payload-auth-plugin'
import { GoogleAuthProvider } from 'payload-auth-plugin/providers'

export default buildConfig({
  plugins: [
    authPlugin({
      name: 'admin',
      usersCollectionSlug: 'users',
      accountsCollectionSlug: 'accounts',
      successRedirectPath: '/admin',
      errorRedirectPath: '/admin/login',
      providers: [
        GoogleAuthProvider({
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
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
// src/components/GoogleSignIn.tsx
'use client'
import { adminAuthClient } from '@/lib/auth'

export function GoogleSignInButton() {
  const { oauth } = adminAuthClient.signin()

  return (
    <button onClick={() => oauth('google')}>
      Sign in with Google
    </button>
  )
}
```

Clicking the button redirects the browser to:

```
{baseURL}/api/{name}/oauth/authorize/google
```

After the user authenticates with Google, they are redirected back to:

```
https://your-domain.com/api/{name}/oauth/callback/google
```

The plugin validates the OIDC tokens, upserts the Account and User documents, issues a session cookie, and redirects to `successRedirectPath`.

---

## Parameters Reference

`GoogleAuthProvider` accepts a config object with the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `client_id` | `string` | Yes | OAuth client ID from the Google Cloud Console. |
| `client_secret` | `string` | Yes | OAuth client secret from the Google Cloud Console. |
| `client_auth_type` | `'client_secret_basic' \| 'client_secret_post'` | No | Token endpoint authentication method. Defaults to Google's standard (`client_secret_basic`). |
| `params` | `Record<string, string>` | No | Extra query parameters appended to the authorization request URL. |
| `overrideScope` | `string` | No | Replace Google's default scope (`email openid profile`) with a custom scope string. |

---

## Default Scope

```
email openid profile
```

This requests the user's email address, a stable subject identifier (`sub`), and basic profile information (name, picture).

To request additional Google-specific scopes (e.g. Calendar, Drive), use `overrideScope`:

```ts
GoogleAuthProvider({
  client_id: process.env.GOOGLE_CLIENT_ID!,
  client_secret: process.env.GOOGLE_CLIENT_SECRET!,
  overrideScope: 'email openid profile https://www.googleapis.com/auth/calendar.readonly',
})
```

> Only request scopes your application actually needs. Requesting extra scopes requires additional review by Google for production apps.

---

## Common `params` Options

| Parameter | Example value | Description |
|-----------|---------------|-------------|
| `prompt` | `'select_account'` | Force the account picker even when the user has only one Google account. |
| `prompt` | `'consent'` | Force the consent screen to re-appear even if the user has previously granted access. |
| `hd` | `'mycompany.com'` | Restrict sign-in to users from a specific Google Workspace domain. |
| `login_hint` | `'user@example.com'` | Pre-fill the email field in Google's sign-in form. |
| `access_type` | `'offline'` | Request a refresh token alongside the access token. |

**Example:**

```ts
GoogleAuthProvider({
  client_id: process.env.GOOGLE_CLIENT_ID!,
  client_secret: process.env.GOOGLE_CLIENT_SECRET!,
  params: {
    prompt: 'select_account',
    hd: 'mycompany.com',       // only allow sign-in from mycompany.com accounts
  },
})
```

---

## Returns

`GoogleAuthProvider` returns an `OIDCProviderConfig` object:

```ts
{
  id: 'google',
  name: 'Google',
  algorithm: 'oidc',
  kind: 'oauth',
  issuer: 'https://accounts.google.com',
  scope: 'email openid profile',   // or overrideScope
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

The `profile` callback maps the OIDC `id_token` claims to the `AccountInfo` shape used internally by the plugin to create or update Account and User documents.

**`AccountInfo` fields populated from Google:**

| Field | Google claim | Description |
|-------|-------------|-------------|
| `sub` | `sub` | Stable, unique Google user ID |
| `name` | `name` | Full display name |
| `email` | `email` | Primary email address |
| `picture` | `picture` | URL of the profile photo |

---

## See Also

- [Providers Overview](./README.md) — all supported providers
- [Configuration](../configuration.md) — full `authPlugin()` options
- [Auth Client](../auth-client.md) — triggering OAuth sign-in from the browser
- [Setup Guide](../setup.md) — end-to-end integration walkthrough