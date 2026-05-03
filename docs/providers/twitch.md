# Twitch Auth Provider

> Authenticate users with their Twitch account using OAuth 2.0.

Source: [`src/providers/oauth2/twitch.ts`](../../src/providers/oauth2/twitch.ts)

---

## Table of Contents

- [Overview](#overview)
- [Setup in Twitch Developer Console](#setup-in-twitch-developer-console)
- [Configuration](#configuration)
- [Usage](#usage)
- [Parameters Reference](#parameters-reference)
- [Default Scope](#default-scope)
- [Returns](#returns)

---

## Overview

`TwitchAuthProvider` implements OAuth 2.0 authentication via Twitch. The provider uses explicit authorization server endpoint URLs from `https://id.twitch.tv/oauth2` and requests OIDC-style claims via the `claims` parameter for richer user profile data.

**Protocol:** OAuth 2.0
**Callback ID:** `twitch`
**Default scope:** `openid user:read:email`

---

## Setup in Twitch Developer Console

1. Go to the [Twitch Developer Console](https://dev.twitch.tv/console) and sign in with your Twitch account.
2. Click **Register Your Application**.
3. Fill in:
   - **Name** — your application name
   - **OAuth Redirect URLs** — your callback URL:
     ```
     https://your-domain.com/api/{name}/oauth/callback/twitch
     ```
     For local development, also add:
     ```
     http://localhost:3000/api/{name}/oauth/callback/twitch
     ```
     Replace `{name}` with the `name` you passed to `authPlugin()` (e.g. `admin`, `storefront`).
   - **Category** — choose the most appropriate category for your app
4. Complete the CAPTCHA and click **Create**.
5. On the application details page, click **New Secret** to generate a client secret.
6. Copy the **Client ID** and **Client Secret** into your `.env` file:

   ```sh
   TWITCH_CLIENT_ID=your-client-id
   TWITCH_CLIENT_SECRET=your-client-secret
   ```

> **Note:** Twitch requires that applications using OAuth implement proper token validation. The `client_id` must be included as a header (`Client-Id`) in all Twitch API requests. The plugin handles this automatically for the authentication flow.

---

## Configuration

```ts
// payload.config.ts
import { buildConfig } from 'payload'
import { authPlugin } from 'payload-auth-plugin'
import { TwitchAuthProvider } from 'payload-auth-plugin/providers'

export default buildConfig({
  plugins: [
    authPlugin({
      name: 'admin',
      usersCollectionSlug: 'users',
      accountsCollectionSlug: 'accounts',
      successRedirectPath: '/admin',
      errorRedirectPath: '/admin/login',
      providers: [
        TwitchAuthProvider({
          client_id: process.env.TWITCH_CLIENT_ID!,
          client_secret: process.env.TWITCH_CLIENT_SECRET!,
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
// src/components/TwitchSignIn.tsx
'use client'
import { adminAuthClient } from '@/lib/auth'

export function TwitchSignInButton() {
  const { oauth } = adminAuthClient.signin()

  return (
    <button
      onClick={() => oauth('twitch')}
      style={{ backgroundColor: '#9147FF', color: '#fff' }}
    >
      Sign in with Twitch
    </button>
  )
}
```

Clicking the button redirects the browser to:

```
{baseURL}/api/{name}/oauth/authorize/twitch
```

After the user authenticates with Twitch, they are redirected back to:

```
https://your-domain.com/api/{name}/oauth/callback/twitch
```

The plugin exchanges the authorization code for tokens, fetches the user profile from Twitch's userinfo endpoint, upserts the Account and User documents, issues a session cookie, and redirects to `successRedirectPath`.

---

## Parameters Reference

`TwitchAuthProvider` accepts a config object with the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `client_id` | `string` | Yes | Client ID from the Twitch Developer Console. |
| `client_secret` | `string` | Yes | Client Secret from the Twitch Developer Console. |
| `client_auth_type` | `'client_secret_basic' \| 'client_secret_post'` | No | Token endpoint authentication method. Defaults to Twitch's standard. |
| `params` | `Record<string, string>` | No | Extra query parameters appended to the authorization request URL. |
| `overrideScope` | `string` | No | Replace the default scope (`openid user:read:email`) with a custom scope string. |

---

## Default Scope

```
openid user:read:email
```

- `openid` — enables OpenID Connect token issuance from Twitch
- `user:read:email` — grants access to the user's verified email address

The provider also automatically includes an OIDC `claims` parameter to request `email`, `picture`, and `preferred_username` in both the `id_token` and the userinfo response:

```ts
params: {
  scope: 'openid user:read:email',
  claims: JSON.stringify({
    id_token: { email: null, picture: null, preferred_username: null },
    userinfo: { email: null, picture: null, preferred_username: null },
  }),
}
```

This ensures richer profile data is available in the token response without requiring additional API calls.

To request additional Twitch scopes (e.g. stream data, channel management), use `overrideScope`:

```ts
TwitchAuthProvider({
  client_id: process.env.TWITCH_CLIENT_ID!,
  client_secret: process.env.TWITCH_CLIENT_SECRET!,
  overrideScope: 'openid user:read:email channel:read:subscriptions',
})
```

> Additional Twitch API scopes grant access to Twitch-specific functionality (streams, subscriptions, chat, etc.) and are separate from the authentication flow. Only request scopes your application actually uses.

---

## Returns

`TwitchAuthProvider` returns an `OAuth2ProviderConfig` object:

```ts
{
  id: 'twitch',
  name: 'Twitch',
  algorithm: 'oauth2',
  kind: 'oauth',
  authorization_server: {
    issuer: 'https://id.twitch.tv/oauth2',
    authorization_endpoint: 'https://id.twitch.tv/oauth2/authorize',
    token_endpoint: 'https://id.twitch.tv/oauth2/token',
    userinfo_endpoint: 'https://id.twitch.tv/oauth2/userinfo',
  },
  scope: 'openid user:read:email',  // or overrideScope
  params: {
    scope: 'openid user:read:email',
    claims: '{"id_token":{"email":null,"picture":null,"preferred_username":null},...}',
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

**`AccountInfo` fields populated from Twitch:**

| Field | Twitch claim | Description |
|-------|-------------|-------------|
| `sub` | `sub` | Stable, unique Twitch user ID |
| `name` | `name` (via `preferred_username`) | Twitch display name / username |
| `email` | `email` | User's verified email address |
| `picture` | `picture` | URL of the user's profile image |

---

## Troubleshooting

| Issue | Likely cause | Fix |
|-------|-------------|-----|
| `redirect_mismatch` | Callback URL not registered | Add the exact callback URL under **OAuth Redirect URLs** in the Twitch Developer Console |
| `invalid_client` | Wrong credentials | Verify `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET` |
| Missing `email` in profile | Email scope not granted or email not verified | Ensure `user:read:email` is in the scope and the Twitch account has a verified email |
| `scope` not accepted | Invalid scope string | Check the [Twitch OAuth scopes documentation](https://dev.twitch.tv/docs/authentication/scopes/) for valid scope names |

---

## See Also

- [Providers Overview](./README.md) — all supported providers
- [Configuration](../configuration.md) — full `authPlugin()` options
- [Auth Client](../auth-client.md) — triggering OAuth sign-in from the browser
- [Setup Guide](../setup.md) — end-to-end integration walkthrough