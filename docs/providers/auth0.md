# Auth0 Auth Provider

> Authenticate users via Auth0 using OAuth 2.0.

Source: [`src/providers/oauth2/auth0.ts`](../../src/providers/oauth2/auth0.ts)

---

## Table of Contents

- [Overview](#overview)
- [Setup in Auth0](#setup-in-auth0)
- [Configuration](#configuration)
- [Usage](#usage)
- [Parameters Reference](#parameters-reference)
- [Default Scope](#default-scope)
- [Using a Custom Domain](#using-a-custom-domain)
- [Returns](#returns)

---

## Overview

`Auth0AuthProvider` implements OAuth 2.0 authentication via Auth0. Auth0 acts as an identity broker, meaning a single Auth0 application can aggregate multiple upstream identity providers (Google, GitHub, SAML, LDAP, etc.) and expose them through one OAuth 2.0 endpoint.

**Protocol:** OAuth 2.0
**Callback ID:** `auth0`
**Default scope:** `openid profile email`

---

## Setup in Auth0

1. Sign in to the [Auth0 Dashboard](https://manage.auth0.com/) and select your tenant.
2. Navigate to **Applications → Applications**.
3. Click **Create Application**.
4. Choose **Regular Web Applications** and click **Create**.
5. Go to the **Settings** tab of the newly created application.
6. Under **Allowed Callback URLs**, add your callback URL:

   ```
   https://your-domain.com/api/{name}/oauth/callback/auth0
   ```

   For local development, also add:

   ```
   http://localhost:3000/api/{name}/oauth/callback/auth0
   ```

   Replace `{name}` with the `name` you passed to `authPlugin()` (e.g. `admin`, `storefront`).

7. Click **Save Changes**.
8. Copy the **Domain**, **Client ID**, and **Client Secret** into your `.env` file:

   ```sh
   AUTH0_DOMAIN=your-tenant.auth0.com
   AUTH0_CLIENT_ID=your-client-id
   AUTH0_CLIENT_SECRET=your-client-secret
   ```

---

## Configuration

```ts
// payload.config.ts
import { buildConfig } from 'payload'
import { authPlugin } from 'payload-auth-plugin'
import { Auth0AuthProvider } from 'payload-auth-plugin/providers'

export default buildConfig({
  plugins: [
    authPlugin({
      name: 'admin',
      usersCollectionSlug: 'users',
      accountsCollectionSlug: 'accounts',
      successRedirectPath: '/admin',
      errorRedirectPath: '/admin/login',
      providers: [
        Auth0AuthProvider({
          client_id: process.env.AUTH0_CLIENT_ID!,
          client_secret: process.env.AUTH0_CLIENT_SECRET!,
          domain: process.env.AUTH0_DOMAIN!,
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
// src/components/Auth0SignIn.tsx
'use client'
import { adminAuthClient } from '@/lib/auth'

export function Auth0SignInButton() {
  const { oauth } = adminAuthClient.signin()

  return (
    <button onClick={() => oauth('auth0')}>
      Sign in with Auth0
    </button>
  )
}
```

Clicking the button redirects the browser to:

```
{baseURL}/api/{name}/oauth/authorize/auth0
```

After the user authenticates via Auth0 (and any upstream IdP configured in your Auth0 tenant), they are redirected back to:

```
https://your-domain.com/api/{name}/oauth/callback/auth0
```

The plugin validates the OAuth tokens, fetches the user profile from Auth0's userinfo endpoint, upserts the Account and User documents, issues a session cookie, and redirects to `successRedirectPath`.

---

## Parameters Reference

`Auth0AuthProvider` accepts a config object with the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `client_id` | `string` | Yes | Client ID from the Auth0 application settings. |
| `client_secret` | `string` | Yes | Client Secret from the Auth0 application settings. |
| `domain` | `string` | Yes | Your Auth0 tenant domain (e.g. `your-tenant.auth0.com`). Used to construct the authorization server endpoint URLs. |
| `client_auth_type` | `'client_secret_basic' \| 'client_secret_post'` | No | Token endpoint authentication method. Defaults to Auth0's standard. |
| `params` | `Record<string, string>` | No | Extra query parameters appended to the authorization request URL. |
| `overrideScope` | `string` | No | Replace the default scope (`openid profile email`) with a custom scope string. |

---

## Default Scope

```
openid profile email
```

- `openid` — enables OpenID Connect token issuance
- `profile` — grants access to the user's basic profile (name, picture, etc.)
- `email` — grants access to the user's email address and verification status

---

## Using a Custom Domain

Auth0 supports [custom domains](https://auth0.com/docs/customize/custom-domains) (e.g. `auth.mycompany.com` instead of `mycompany.auth0.com`). Pass your custom domain to the `domain` field:

```ts
Auth0AuthProvider({
  client_id: process.env.AUTH0_CLIENT_ID!,
  client_secret: process.env.AUTH0_CLIENT_SECRET!,
  domain: process.env.AUTH0_DOMAIN!,  // e.g. 'auth.mycompany.com'
})
```

The plugin constructs the authorization server URLs from the domain you provide, so custom domains work transparently.

---

## Passing Additional Parameters

Use the `params` field to pass Auth0-specific query parameters to the authorization endpoint:

```ts
Auth0AuthProvider({
  client_id: process.env.AUTH0_CLIENT_ID!,
  client_secret: process.env.AUTH0_CLIENT_SECRET!,
  domain: process.env.AUTH0_DOMAIN!,
  params: {
    // Force the Auth0 Universal Login screen to appear
    prompt: 'login',
    // Pre-fill the email field
    login_hint: 'user@example.com',
    // Request a specific Auth0 connection (e.g. 'google-oauth2', 'github', 'Username-Password-Authentication')
    connection: 'google-oauth2',
    // Request an Auth0 audience for an API
    audience: 'https://api.myapp.com',
  },
})
```

---

## Returns

`Auth0AuthProvider` returns an `OAuth2ProviderConfig` object:

```ts
{
  id: 'auth0',
  name: 'Auth0',
  algorithm: 'oauth2',
  kind: 'oauth',
  authorization_server: {
    issuer: `https://${domain}`,
    authorization_endpoint: `https://${domain}/authorize`,
    token_endpoint: `https://${domain}/oauth/token`,
    userinfo_endpoint: `https://${domain}/userinfo`,
  },
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

**`AccountInfo` fields populated from Auth0:**

| Field | Auth0 claim | Description |
|-------|-------------|-------------|
| `sub` | `sub` | Stable, unique Auth0 user identifier (e.g. `google-oauth2|1234567890`) |
| `name` | `name` | User's display name as returned by the upstream IdP |
| `email` | `email` | User's email address |
| `picture` | `picture` | URL of the user's profile photo |

---

## See Also

- [Providers Overview](./README.md) — all supported providers
- [Configuration](../configuration.md) — full `authPlugin()` options
- [Auth Client](../auth-client.md) — triggering OAuth sign-in from the browser
- [Setup Guide](../setup.md) — end-to-end integration walkthrough