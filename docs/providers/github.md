# GitHub Auth Provider

> Authenticate users with their GitHub account using OAuth 2.0.

Source: [`src/providers/oauth2/github.ts`](../../src/providers/oauth2/github.ts)

---

## Table of Contents

- [Overview](#overview)
- [Setup in GitHub](#setup-in-github)
- [Configuration](#configuration)
- [Usage](#usage)
- [Parameters Reference](#parameters-reference)
- [Default Scope](#default-scope)
- [Returns](#returns)

---

## Overview

`GitHubAuthProvider` implements OAuth 2.0 authentication via GitHub. Because GitHub does not support OIDC discovery, the provider uses explicit authorization server endpoint URLs.

**Protocol:** OAuth 2.0
**Callback ID:** `github`
**Default scope:** `read:user user:email`

---

## Setup in GitHub

1. Go to **GitHub → Settings → Developer settings → OAuth Apps**.
2. Click **New OAuth App**.
3. Fill in:
   - **Application name** — your app's display name
   - **Homepage URL** — your app's URL (e.g. `https://your-domain.com`)
   - **Authorization callback URL** — your plugin callback URL:
     ```
     https://your-domain.com/api/{name}/oauth/callback/github
     ```
     For local development, also register:
     ```
     http://localhost:3000/api/{name}/oauth/callback/github
     ```
     Replace `{name}` with the `name` passed to `authPlugin()` (e.g. `admin`, `storefront`).
4. Click **Register application**.
5. On the next screen, click **Generate a new client secret**.
6. Copy the **Client ID** and **Client Secret** into your `.env` file:

   ```sh
   GITHUB_CLIENT_ID=your-client-id
   GITHUB_CLIENT_SECRET=your-client-secret
   ```

> **Note:** GitHub OAuth Apps only support a single callback URL per app. For multiple environments (staging, production), create a separate OAuth App per environment, or use a GitHub App which supports multiple callback URLs.

---

## Configuration

```ts
// payload.config.ts
import { buildConfig } from 'payload'
import { authPlugin } from 'payload-auth-plugin'
import { GitHubAuthProvider } from 'payload-auth-plugin/providers'

export default buildConfig({
  plugins: [
    authPlugin({
      name: 'admin',
      usersCollectionSlug: 'users',
      accountsCollectionSlug: 'accounts',
      successRedirectPath: '/admin',
      errorRedirectPath: '/admin/login',
      providers: [
        GitHubAuthProvider({
          client_id: process.env.GITHUB_CLIENT_ID!,
          client_secret: process.env.GITHUB_CLIENT_SECRET!,
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
// src/components/GitHubSignIn.tsx
'use client'
import { adminAuthClient } from '@/lib/auth'

export function GitHubSignInButton() {
  const { oauth } = adminAuthClient.signin()

  return (
    <button onClick={() => oauth('github')}>
      Sign in with GitHub
    </button>
  )
}
```

Clicking the button redirects the browser to:

```
{baseURL}/api/{name}/oauth/authorize/github
```

After the user authenticates with GitHub, they are redirected back to:

```
https://your-domain.com/api/{name}/oauth/callback/github
```

The plugin validates the OAuth tokens, fetches the user profile from GitHub's userinfo endpoint, upserts the Account and User documents, issues a session cookie, and redirects to `successRedirectPath`.

---

## Parameters Reference

`GitHubAuthProvider` accepts a config object with the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `client_id` | `string` | Yes | OAuth client ID from the GitHub OAuth App. |
| `client_secret` | `string` | Yes | OAuth client secret from the GitHub OAuth App. |
| `client_auth_type` | `'client_secret_basic' \| 'client_secret_post'` | No | Token endpoint authentication method. Defaults to GitHub's standard. |
| `params` | `Record<string, string>` | No | Extra query parameters appended to the authorization request URL. |
| `overrideScope` | `string` | No | Replace the default scope (`read:user user:email`) with a custom scope string. |

---

## Default Scope

```
read:user user:email
```

- `read:user` — grants read access to the user's profile data (name, avatar, etc.)
- `user:email` — grants access to the user's email addresses (including private emails)

> GitHub does not expose email addresses in the standard userinfo response unless `user:email` is requested. This scope is included by default to ensure the plugin can reliably retrieve the user's email.

To request additional GitHub scopes (e.g. repository access), use `overrideScope`:

```ts
GitHubAuthProvider({
  client_id: process.env.GITHUB_CLIENT_ID!,
  client_secret: process.env.GITHUB_CLIENT_SECRET!,
  overrideScope: 'read:user user:email repo',
})
```

---

## Returns

`GitHubAuthProvider` returns an `OAuth2ProviderConfig` object:

```ts
{
  id: 'github',
  name: 'GitHub',
  algorithm: 'oauth2',
  kind: 'oauth',
  authorization_server: {
    issuer: 'https://github.com',
    authorization_endpoint: 'https://github.com/login/oauth/authorize',
    token_endpoint: 'https://github.com/login/oauth/access_token',
    userinfo_endpoint: 'https://api.github.com/user',
  },
  scope: 'read:user user:email',   // or overrideScope
  client_id: '...',
  client_secret: '...',
  profile: (profile) => ({
    sub: profile.id,
    name: profile.name,
    email: profile.email,
    picture: profile.avatar_url,
  }),
}
```

**`AccountInfo` fields populated from GitHub:**

| Field | GitHub claim | Description |
|-------|-------------|-------------|
| `sub` | `id` | Stable, unique GitHub numeric user ID |
| `name` | `name` | User's display name |
| `email` | `email` | Primary email address |
| `picture` | `avatar_url` | URL of the user's avatar |

---

## See Also

- [Providers Overview](./README.md) — all supported providers
- [Configuration](../configuration.md) — full `authPlugin()` options
- [Auth Client](../auth-client.md) — triggering OAuth sign-in from the browser
- [Setup Guide](../setup.md) — end-to-end integration walkthrough