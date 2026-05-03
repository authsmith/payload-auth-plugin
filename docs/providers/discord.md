# Discord Auth Provider

> Authenticate users with their Discord account using OAuth 2.0.

Source: [`src/providers/oauth2/discord.ts`](../../src/providers/oauth2/discord.ts)

---

## Table of Contents

- [Overview](#overview)
- [Setup in Discord Developer Portal](#setup-in-discord-developer-portal)
- [Configuration](#configuration)
- [Usage](#usage)
- [Parameters Reference](#parameters-reference)
- [Default Scope](#default-scope)
- [Returns](#returns)

---

## Overview

`DiscordAuthProvider` implements OAuth 2.0 authentication via Discord. Because Discord does not support OIDC discovery, the provider uses explicit authorization server endpoint URLs.

**Protocol:** OAuth 2.0
**Callback ID:** `discord`
**Default scope:** `identify email`

---

## Setup in Discord Developer Portal

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Click **New Application**, give it a name, and click **Create**.
3. In the left sidebar, navigate to **OAuth2 → General**.
4. Under **Redirects**, click **Add Redirect** and enter your callback URL:

   ```
   https://your-domain.com/api/{name}/oauth/callback/discord
   ```

   For local development, also add:

   ```
   http://localhost:3000/api/{name}/oauth/callback/discord
   ```

   Replace `{name}` with the `name` you passed to `authPlugin()` (e.g. `admin`, `storefront`).

5. Click **Save Changes**.
6. Copy the **Client ID** and **Client Secret** (click **Reset Secret** to generate one) into your `.env` file:

   ```sh
   DISCORD_CLIENT_ID=your-client-id
   DISCORD_CLIENT_SECRET=your-client-secret
   ```

---

## Configuration

```ts
// payload.config.ts
import { buildConfig } from 'payload'
import { authPlugin } from 'payload-auth-plugin'
import { DiscordAuthProvider } from 'payload-auth-plugin/providers'

export default buildConfig({
  plugins: [
    authPlugin({
      name: 'admin',
      usersCollectionSlug: 'users',
      accountsCollectionSlug: 'accounts',
      successRedirectPath: '/admin',
      errorRedirectPath: '/admin/login',
      providers: [
        DiscordAuthProvider({
          client_id: process.env.DISCORD_CLIENT_ID!,
          client_secret: process.env.DISCORD_CLIENT_SECRET!,
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
// src/components/DiscordSignIn.tsx
'use client'
import { adminAuthClient } from '@/lib/auth'

export function DiscordSignInButton() {
  const { oauth } = adminAuthClient.signin()

  return (
    <button
      onClick={() => oauth('discord')}
      style={{ backgroundColor: '#5865F2', color: '#fff' }}
    >
      Sign in with Discord
    </button>
  )
}
```

Clicking the button redirects the browser to:

```
{baseURL}/api/{name}/oauth/authorize/discord
```

After the user authenticates with Discord, they are redirected back to:

```
https://your-domain.com/api/{name}/oauth/callback/discord
```

The plugin validates the OAuth tokens, fetches the user profile from Discord's API, upserts the Account and User documents, issues a session cookie, and redirects to `successRedirectPath`.

---

## Parameters Reference

`DiscordAuthProvider` accepts a config object with the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `client_id` | `string` | Yes | Client ID from the Discord Developer Portal. |
| `client_secret` | `string` | Yes | Client Secret from the Discord Developer Portal. |
| `client_auth_type` | `'client_secret_basic' \| 'client_secret_post'` | No | Token endpoint authentication method. Defaults to Discord's standard. |
| `params` | `Record<string, string>` | No | Extra query parameters appended to the authorization request URL. |
| `overrideScope` | `string` | No | Replace the default scope (`identify email`) with a custom scope string. |

---

## Default Scope

```
identify email
```

- `identify` — grants access to the user's basic profile (username, avatar, discriminator, etc.)
- `email` — grants access to the user's email address and verification status

To request additional Discord scopes (e.g. guild membership), use `overrideScope`:

```ts
DiscordAuthProvider({
  client_id: process.env.DISCORD_CLIENT_ID!,
  client_secret: process.env.DISCORD_CLIENT_SECRET!,
  overrideScope: 'identify email guilds',
})
```

---

## Returns

`DiscordAuthProvider` returns an `OAuth2ProviderConfig` object:

```ts
{
  id: 'discord',
  name: 'Discord',
  algorithm: 'oauth2',
  kind: 'oauth',
  authorization_server: {
    issuer: 'https://discord.com',
    authorization_endpoint: 'https://discord.com/api/oauth2/authorize',
    token_endpoint: 'https://discord.com/api/oauth2/token',
    userinfo_endpoint: 'https://discord.com/api/users/@me',
  },
  scope: 'identify email',  // or overrideScope
  client_id: '...',
  client_secret: '...',
  profile: (profile) => ({
    sub: profile.id,
    name: profile.username,
    email: profile.email,
    picture: profile.avatar
      ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
      : undefined,
  }),
}
```

**`AccountInfo` fields populated from Discord:**

| Field | Discord claim | Description |
|-------|--------------|-------------|
| `sub` | `id` | Stable, unique Discord user snowflake ID |
| `name` | `username` | Discord username |
| `email` | `email` | User's email address |
| `picture` | `avatar` (constructed) | CDN URL of the user's avatar |

---

## See Also

- [Providers Overview](./README.md) — all supported providers
- [Configuration](../configuration.md) — full `authPlugin()` options
- [Auth Client](../auth-client.md) — triggering OAuth sign-in from the browser
- [Setup Guide](../setup.md) — end-to-end integration walkthrough