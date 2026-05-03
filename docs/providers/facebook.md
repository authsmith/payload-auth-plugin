# Facebook Auth Provider

> Authenticate users with their Facebook account using OAuth 2.0.

Source: [`src/providers/oauth2/facebook.ts`](../../src/providers/oauth2/facebook.ts)

---

## Table of Contents

- [Overview](#overview)
- [Setup in Facebook Developer Console](#setup-in-facebook-developer-console)
- [Configuration](#configuration)
- [Usage](#usage)
- [Parameters Reference](#parameters-reference)
- [Default Scope](#default-scope)
- [Returns](#returns)

---

## Overview

`FacebookAuthProvider` implements OAuth 2.0 authentication via Facebook (Meta). Because Facebook does not support OIDC discovery, the provider uses explicit authorization server endpoint URLs including the Graph API for user profile retrieval.

**Protocol:** OAuth 2.0
**Callback ID:** `facebook`
**Default scope:** `email`

---

## Setup in Facebook Developer Console

1. Go to the [Meta for Developers](https://developers.facebook.com/) portal.
2. Click **My Apps → Create App**.
3. Select **Authenticate and request data from users with Facebook Login** and click **Next**.
4. Fill in your app details and click **Create App**.
5. In the left sidebar, navigate to **Use Cases** and click **Customize** next to **Authentication and account creation**.
6. Under **Facebook Login Settings → Valid OAuth Redirect URIs**, add your callback URL:

   ```
   https://your-domain.com/api/{name}/oauth/callback/facebook
   ```

   For local development, also add:

   ```
   http://localhost:3000/api/{name}/oauth/callback/facebook
   ```

   Replace `{name}` with the `name` you passed to `authPlugin()` (e.g. `admin`, `storefront`).

7. Click **Save Changes**.
8. In the left sidebar, navigate to **App Settings → Basic**.
9. Copy the **App ID** (Client ID) and **App Secret** (Client Secret) into your `.env` file:

   ```sh
   FACEBOOK_CLIENT_ID=your-app-id
   FACEBOOK_CLIENT_SECRET=your-app-secret
   ```

> **Note:** By default, Facebook apps are in **Development mode** and can only be used by app administrators and testers. To allow all users to sign in, switch your app to **Live mode** after completing the App Review process.

---

## Configuration

```ts
// payload.config.ts
import { buildConfig } from 'payload'
import { authPlugin } from 'payload-auth-plugin'
import { FacebookAuthProvider } from 'payload-auth-plugin/providers'

export default buildConfig({
  plugins: [
    authPlugin({
      name: 'admin',
      usersCollectionSlug: 'users',
      accountsCollectionSlug: 'accounts',
      successRedirectPath: '/admin',
      errorRedirectPath: '/admin/login',
      providers: [
        FacebookAuthProvider({
          client_id: process.env.FACEBOOK_CLIENT_ID!,
          client_secret: process.env.FACEBOOK_CLIENT_SECRET!,
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
// src/components/FacebookSignIn.tsx
'use client'
import { adminAuthClient } from '@/lib/auth'

export function FacebookSignInButton() {
  const { oauth } = adminAuthClient.signin()

  return (
    <button
      onClick={() => oauth('facebook')}
      style={{ backgroundColor: '#1877F2', color: '#fff' }}
    >
      Sign in with Facebook
    </button>
  )
}
```

Clicking the button redirects the browser to:

```
{baseURL}/api/{name}/oauth/authorize/facebook
```

After the user authenticates with Facebook, they are redirected back to:

```
https://your-domain.com/api/{name}/oauth/callback/facebook
```

The plugin exchanges the authorization code for tokens, fetches the user profile from the Graph API, upserts the Account and User documents, issues a session cookie, and redirects to `successRedirectPath`.

---

## Parameters Reference

`FacebookAuthProvider` accepts a config object with the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `client_id` | `string` | Yes | App ID from the Meta Developer Console. |
| `client_secret` | `string` | Yes | App Secret from the Meta Developer Console. |
| `client_auth_type` | `'client_secret_basic' \| 'client_secret_post'` | No | Token endpoint authentication method. Defaults to Facebook's standard. |
| `params` | `Record<string, string>` | No | Extra query parameters appended to the authorization request URL. |
| `overrideScope` | `string` | No | Replace the default scope (`email`) with a custom scope string. |

---

## Default Scope

```
email
```

The `email` permission grants access to the user's primary email address.

To request additional Facebook permissions, use `overrideScope`:

```ts
FacebookAuthProvider({
  client_id: process.env.FACEBOOK_CLIENT_ID!,
  client_secret: process.env.FACEBOOK_CLIENT_SECRET!,
  overrideScope: 'email public_profile',
})
```

> Additional permissions beyond `email` and `public_profile` require Facebook's App Review process before they can be used in production.

---

## Returns

`FacebookAuthProvider` returns an `OAuth2ProviderConfig` object:

```ts
{
  id: 'facebook',
  name: 'Facebook',
  algorithm: 'oauth2',
  kind: 'oauth',
  authorization_server: {
    issuer: 'https://www.facebook.com',
    authorization_endpoint: 'https://www.facebook.com/v19.0/dialog/oauth',
    token_endpoint: 'https://graph.facebook.com/oauth/access_token',
    userinfo_endpoint: 'https://graph.facebook.com/me?fields=id,name,email,picture',
  },
  scope: 'email',  // or overrideScope
  client_id: '...',
  client_secret: '...',
  profile: (profile) => ({
    sub: profile.id,
    name: profile.name,
    email: profile.email,
    picture: profile.picture?.data?.url,
  }),
}
```

**`AccountInfo` fields populated from Facebook:**

| Field | Facebook claim | Description |
|-------|---------------|-------------|
| `sub` | `id` | Stable, unique Facebook user ID |
| `name` | `name` | User's full name |
| `email` | `email` | User's primary email address |
| `picture` | `picture.data.url` | URL of the user's profile photo |

> The profile picture is nested inside `picture.data.url` in Facebook's Graph API response. The plugin's `profile` callback handles this nesting automatically.

---

## See Also

- [Providers Overview](./README.md) — all supported providers
- [Configuration](../configuration.md) — full `authPlugin()` options
- [Auth Client](../auth-client.md) — triggering OAuth sign-in from the browser
- [Setup Guide](../setup.md) — end-to-end integration walkthrough