# GitLab Auth Provider

> Authenticate users with their GitLab account using OpenID Connect (OIDC).

Source: [`src/providers/oidc/gitlab.ts`](../../src/providers/oidc/gitlab.ts)

---

## Table of Contents

- [Overview](#overview)
- [Setup in GitLab](#setup-in-gitlab)
- [Configuration](#configuration)
- [Usage](#usage)
- [Parameters Reference](#parameters-reference)
- [Default Scope](#default-scope)
- [Returns](#returns)

---

## Overview

`GitLabAuthProvider` implements OIDC-based authentication via GitLab. It works with both **GitLab.com** (the cloud-hosted service) and **self-hosted GitLab instances**.

**Protocol:** OIDC
**Callback ID:** `gitlab`
**Default scope:** `read_user openid`

---

## Setup in GitLab

### GitLab.com

1. Go to **GitLab → User Settings → Applications** (or **Group → Settings → Applications** for a group-level app).
2. Click **Add new application**.
3. Fill in:
   - **Name** — your application name
   - **Redirect URI** — your callback URL:
     ```
     https://your-domain.com/api/{name}/oauth/callback/gitlab
     ```
     For local development, also add:
     ```
     http://localhost:3000/api/{name}/oauth/callback/gitlab
     ```
4. Under **Scopes**, select **read_user** and **openid**.
5. Click **Save application**.
6. Copy the **Application ID** (Client ID) and **Secret** (Client Secret) into your `.env` file:

   ```sh
   GITLAB_CLIENT_ID=your-application-id
   GITLAB_CLIENT_SECRET=your-secret
   ```

### Self-hosted GitLab

Follow the same steps but on your self-hosted GitLab instance. The issuer URL defaults to `https://gitlab.com`; for self-hosted instances you will need to override it — see [Parameters Reference](#parameters-reference).

---

## Configuration

```ts
// payload.config.ts
import { buildConfig } from 'payload'
import { authPlugin } from 'payload-auth-plugin'
import { GitLabAuthProvider } from 'payload-auth-plugin/providers'

export default buildConfig({
  plugins: [
    authPlugin({
      name: 'admin',
      usersCollectionSlug: 'users',
      accountsCollectionSlug: 'accounts',
      successRedirectPath: '/admin',
      errorRedirectPath: '/admin/login',
      providers: [
        GitLabAuthProvider({
          client_id: process.env.GITLAB_CLIENT_ID!,
          client_secret: process.env.GITLAB_CLIENT_SECRET!,
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
// src/components/GitLabSignIn.tsx
'use client'
import { adminAuthClient } from '@/lib/auth'

export function GitLabSignInButton() {
  const { oauth } = adminAuthClient.signin()

  return (
    <button onClick={() => oauth('gitlab')}>
      Sign in with GitLab
    </button>
  )
}
```

---

## Parameters Reference

`GitLabAuthProvider` accepts a config object with the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `client_id` | `string` | Yes | Application ID from the GitLab OAuth application. |
| `client_secret` | `string` | Yes | Secret from the GitLab OAuth application. |
| `client_auth_type` | `'client_secret_basic' \| 'client_secret_post'` | No | Token endpoint authentication method. |
| `params` | `Record<string, string>` | No | Extra query parameters for the authorization request. |
| `overrideScope` | `string` | No | Replace the default scope (`read_user openid`) with a custom scope string. |

---

## Default Scope

```
read_user openid
```

- `read_user` — grants access to the authenticated user's profile data
- `openid` — enables OpenID Connect ID token issuance

---

## Returns

`GitLabAuthProvider` returns an `OIDCProviderConfig` object:

```ts
{
  id: 'gitlab',
  name: 'GitLab',
  algorithm: 'oidc',
  kind: 'oauth',
  issuer: 'https://gitlab.com',
  scope: 'read_user openid',
  profile: (profile) => ({
    sub: profile.sub,
    name: profile.name,
    email: profile.email,
    picture: profile.picture,
  }),
}
```

**`AccountInfo` fields populated from GitLab:**

| Field | GitLab claim | Description |
|-------|-------------|-------------|
| `sub` | `sub` | Stable, unique GitLab user identifier |
| `name` | `name` | User's display name |
| `email` | `email` | Primary email address |
| `picture` | `picture` | URL of the user's avatar |

---

## See Also

- [Providers Overview](./README.md) — all supported providers
- [Configuration](../configuration.md) — full `authPlugin()` options
- [Auth Client](../auth-client.md) — triggering OAuth sign-in from the browser
- [Setup Guide](../setup.md) — end-to-end integration walkthrough