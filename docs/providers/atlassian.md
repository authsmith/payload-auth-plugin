# Atlassian Auth Provider

> Authenticate users with their Atlassian account (Jira, Confluence, Bitbucket, etc.) using OAuth 2.0.

Source: [`src/providers/oauth2/atlassian.ts`](../../src/providers/oauth2/atlassian.ts)

---

## Table of Contents

- [Overview](#overview)
- [Setup in Atlassian Developer Console](#setup-in-atlassian-developer-console)
- [Configuration](#configuration)
- [Usage](#usage)
- [Parameters Reference](#parameters-reference)
- [Default Scope](#default-scope)
- [Returns](#returns)

---

## Overview

`AtlassianAuthProvider` implements OAuth 2.0 authentication via Atlassian's identity platform. It supports signing in with any Atlassian account that has access to Jira, Confluence, Bitbucket, or other Atlassian products.

**Protocol:** OAuth 2.0
**Callback ID:** `atlassian`
**Default scope:** `read:me read:account`

---

## Setup in Atlassian Developer Console

1. Go to the [Atlassian Developer Console](https://developer.atlassian.com/console/myapps/).
2. Click **Create** and choose **OAuth 2.0 integration**.
3. Give your app a name and click **Create**.
4. In the left sidebar, navigate to **Authorization**.
5. Next to **OAuth 2.0 (3LO)**, click **Configure**.
6. Set the **Callback URL** to your plugin callback URL:

   ```
   https://your-domain.com/api/{name}/oauth/callback/atlassian
   ```

   For local development, also add:

   ```
   http://localhost:3000/api/{name}/oauth/callback/atlassian
   ```

   Replace `{name}` with the `name` you passed to `authPlugin()` (e.g. `admin`, `storefront`).

7. Click **Save changes**.
8. In the left sidebar, navigate to **Permissions** and add the **User identity API** permission, which grants `read:me` and `read:account` scopes.
9. In the left sidebar, navigate to **Settings** to find your **Client ID** and **Secret**. Copy them into your `.env` file:

   ```sh
   ATLASSIAN_CLIENT_ID=your-client-id
   ATLASSIAN_CLIENT_SECRET=your-client-secret
   ```

> **Note:** Atlassian OAuth 2.0 apps require enabling **3-legged OAuth (3LO)** and adding the appropriate API scopes via the Permissions section in the developer console. The app must be **distributed** (not just development-mode) for users outside your organization to sign in.

---

## Configuration

```ts
// payload.config.ts
import { buildConfig } from 'payload'
import { authPlugin } from 'payload-auth-plugin'
import { AtlassianAuthProvider } from 'payload-auth-plugin/providers'

export default buildConfig({
  plugins: [
    authPlugin({
      name: 'admin',
      usersCollectionSlug: 'users',
      accountsCollectionSlug: 'accounts',
      successRedirectPath: '/admin',
      errorRedirectPath: '/admin/login',
      providers: [
        AtlassianAuthProvider({
          client_id: process.env.ATLASSIAN_CLIENT_ID!,
          client_secret: process.env.ATLASSIAN_CLIENT_SECRET!,
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
// src/components/AtlassianSignIn.tsx
'use client'
import { adminAuthClient } from '@/lib/auth'

export function AtlassianSignInButton() {
  const { oauth } = adminAuthClient.signin()

  return (
    <button
      onClick={() => oauth('atlassian')}
      style={{ backgroundColor: '#0052CC', color: '#fff' }}
    >
      Sign in with Atlassian
    </button>
  )
}
```

Clicking the button redirects the browser to:

```
{baseURL}/api/{name}/oauth/authorize/atlassian
```

After the user authenticates with their Atlassian account, they are redirected back to:

```
https://your-domain.com/api/{name}/oauth/callback/atlassian
```

The plugin exchanges the authorization code for tokens, fetches the user profile from Atlassian's identity API (`https://api.atlassian.com/me`), upserts the Account and User documents, issues a session cookie, and redirects to `successRedirectPath`.

---

## Parameters Reference

`AtlassianAuthProvider` accepts a config object with the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `client_id` | `string` | Yes | Client ID from the Atlassian Developer Console. |
| `client_secret` | `string` | Yes | Client Secret from the Atlassian Developer Console. |
| `client_auth_type` | `'client_secret_basic' \| 'client_secret_post'` | No | Token endpoint authentication method. Defaults to Atlassian's standard (`client_secret_post`). |
| `params` | `Record<string, string>` | No | Extra query parameters appended to the authorization request URL. |
| `overrideScope` | `string` | No | Replace the default scope (`read:me read:account`) with a custom scope string. |

---

## Default Scope

```
read:me read:account
```

- `read:me` — grants access to the current user's profile information via the User Identity API
- `read:account` — grants access to the user's Atlassian account details

To request additional Atlassian API scopes (e.g. Jira or Confluence access), use `overrideScope`:

```ts
AtlassianAuthProvider({
  client_id: process.env.ATLASSIAN_CLIENT_ID!,
  client_secret: process.env.ATLASSIAN_CLIENT_SECRET!,
  overrideScope: 'read:me read:account offline_access read:jira-work',
})
```

> Additional Atlassian API scopes must be added under the **Permissions** section of your app in the developer console before they can be requested.

---

## Returns

`AtlassianAuthProvider` returns an `OAuth2ProviderConfig` object:

```ts
{
  id: 'atlassian',
  name: 'Atlassian',
  algorithm: 'oauth2',
  kind: 'oauth',
  authorization_server: {
    issuer: 'https://auth.atlassian.com',
    authorization_endpoint: 'https://auth.atlassian.com/authorize',
    token_endpoint: 'https://auth.atlassian.com/oauth/token',
    userinfo_endpoint: 'https://api.atlassian.com/me',
  },
  scope: 'read:me read:account',  // or overrideScope
  client_id: '...',
  client_secret: '...',
  profile: (profile) => ({
    sub: profile.account_id,
    name: profile.name,
    email: profile.email,
    picture: profile.picture,
  }),
}
```

**`AccountInfo` fields populated from Atlassian:**

| Field | Atlassian claim | Description |
|-------|----------------|-------------|
| `sub` | `account_id` | Stable, unique Atlassian account ID (e.g. `5b10a2844c20165700ede21g`) |
| `name` | `name` | User's display name |
| `email` | `email` | User's primary email address |
| `picture` | `picture` | URL of the user's profile photo |

> Atlassian uses `account_id` (not `sub`) as the unique identifier in its API responses. The plugin's `profile` callback maps `account_id` to the `sub` field of `AccountInfo` for consistency.

---

## See Also

- [Providers Overview](./README.md) — all supported providers
- [Configuration](../configuration.md) — full `authPlugin()` options
- [Auth Client](../auth-client.md) — triggering OAuth sign-in from the browser
- [Setup Guide](../setup.md) — end-to-end integration walkthrough