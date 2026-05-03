# Slack Auth Provider

> Authenticate users with their Slack account using OpenID Connect (OIDC).

Source: [`src/providers/oidc/slack.ts`](../../src/providers/oidc/slack.ts)

---

## Table of Contents

- [Overview](#overview)
- [Setup in Slack](#setup-in-slack)
- [Configuration](#configuration)
- [Usage](#usage)
- [Parameters Reference](#parameters-reference)
- [Default Scope](#default-scope)
- [Returns](#returns)

---

## Overview

`SlackAuthProvider` implements OIDC-based authentication via Slack. It uses Slack's OIDC discovery document to resolve endpoints automatically from the issuer URL.

**Protocol:** OIDC
**Callback ID:** `slack`
**Default scope:** `openid profile email`

---

## Setup in Slack

1. Go to the [Slack API portal](https://api.slack.com/apps) and click **Create New App**.
2. Choose **From scratch**, give your app a name, and select a workspace for development.
3. In the left sidebar, navigate to **OAuth & Permissions**.
4. Under **Redirect URLs**, click **Add New Redirect URL** and enter your callback URL:

   ```
   https://your-domain.com/api/{name}/oauth/callback/slack
   ```

   For local development, also add:

   ```
   http://localhost:3000/api/{name}/oauth/callback/slack
   ```

   Replace `{name}` with the `name` you passed to `authPlugin()` (e.g. `admin`, `storefront`).

5. Click **Add** then **Save URLs**.
6. Under **Scopes → User Token Scopes**, add the following scopes:
   - `openid`
   - `profile`
   - `email`
7. In the left sidebar, navigate to **Basic Information**.
8. Copy the **Client ID** and **Client Secret** into your `.env` file:

   ```sh
   SLACK_CLIENT_ID=your-client-id
   SLACK_CLIENT_SECRET=your-client-secret
   ```

> **Note:** Slack requires that you use **Sign In With Slack** (OIDC) rather than the older OAuth 2.0 flow for user authentication. The `SlackAuthProvider` uses the OIDC endpoints which are automatically discovered from Slack's well-known configuration.

---

## Configuration

```ts
// payload.config.ts
import { buildConfig } from 'payload'
import { authPlugin } from 'payload-auth-plugin'
import { SlackAuthProvider } from 'payload-auth-plugin/providers'

export default buildConfig({
  plugins: [
    authPlugin({
      name: 'admin',
      usersCollectionSlug: 'users',
      accountsCollectionSlug: 'accounts',
      successRedirectPath: '/admin',
      errorRedirectPath: '/admin/login',
      providers: [
        SlackAuthProvider({
          client_id: process.env.SLACK_CLIENT_ID!,
          client_secret: process.env.SLACK_CLIENT_SECRET!,
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
// src/components/SlackSignIn.tsx
'use client'
import { adminAuthClient } from '@/lib/auth'

export function SlackSignInButton() {
  const { oauth } = adminAuthClient.signin()

  return (
    <button
      onClick={() => oauth('slack')}
      style={{ backgroundColor: '#4A154B', color: '#fff' }}
    >
      Sign in with Slack
    </button>
  )
}
```

Clicking the button redirects the browser to:

```
{baseURL}/api/{name}/oauth/authorize/slack
```

After the user authenticates with Slack, they are redirected back to:

```
https://your-domain.com/api/{name}/oauth/callback/slack
```

The plugin validates the OIDC tokens, fetches the user profile, upserts the Account and User documents, issues a session cookie, and redirects to `successRedirectPath`.

---

## Parameters Reference

`SlackAuthProvider` accepts a config object with the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `client_id` | `string` | Yes | Client ID from the Slack app's Basic Information page. |
| `client_secret` | `string` | Yes | Client Secret from the Slack app's Basic Information page. |
| `client_auth_type` | `'client_secret_basic' \| 'client_secret_post'` | No | Token endpoint authentication method. Defaults to Slack's standard. |
| `params` | `Record<string, string>` | No | Extra query parameters appended to the authorization request URL. |
| `overrideScope` | `string` | No | Replace the default scope (`openid profile email`) with a custom scope string. |

---

## Default Scope

```
openid profile email
```

- `openid` — enables OpenID Connect ID token issuance
- `profile` — grants access to the user's basic profile (name, avatar, etc.)
- `email` — grants access to the user's email address

---

## Returns

`SlackAuthProvider` returns an `OIDCProviderConfig` object:

```ts
{
  id: 'slack',
  name: 'Slack',
  algorithm: 'oidc',
  kind: 'oauth',
  issuer: 'https://slack.com',
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

**`AccountInfo` fields populated from Slack:**

| Field | Slack claim | Description |
|-------|------------|-------------|
| `sub` | `sub` | Stable, unique Slack user ID |
| `name` | `name` | User's display name |
| `email` | `email` | User's email address |
| `picture` | `picture` | URL of the user's profile photo |

---

## See Also

- [Providers Overview](./README.md) — all supported providers
- [Configuration](../configuration.md) — full `authPlugin()` options
- [Auth Client](../auth-client.md) — triggering OAuth sign-in from the browser
- [Setup Guide](../setup.md) — end-to-end integration walkthrough