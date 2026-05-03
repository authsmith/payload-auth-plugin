# Configuration Reference

> Complete reference for all options accepted by `authPlugin()`.

Source: [`src/plugin.ts`](../src/plugin.ts) · Type: [`PluginOptions`](../src/plugin.ts#L64)

---

## Table of Contents

- [Overview](#overview)
- [Options](#options)
  - [enabled](#enabled)
  - [name](#name)
  - [useAdmin](#useadmin)
  - [usersCollectionSlug](#userscollectionslug)
  - [accountsCollectionSlug](#accountscollectionslug)
  - [providers](#providers)
  - [allowOAuthAutoSignUp](#allowoauthautosignup)
  - [successRedirectPath](#successredirectpath)
  - [errorRedirectPath](#errorredirectpath)
- [Full Example](#full-example)
- [Validation & Errors](#validation--errors)

---

## Overview

`authPlugin` is a standard Payload plugin factory. You call it with an options object and pass the result into Payload's `plugins` array:

```ts
// payload.config.ts
import { buildConfig } from 'payload'
import { authPlugin } from 'payload-auth-plugin'

export default buildConfig({
  plugins: [
    authPlugin({ /* PluginOptions */ }),
  ],
})
```

You can register `authPlugin` **multiple times** with different `name` values to support independent auth flows (e.g. admin panel + customer storefront). Each instance maintains its own endpoint namespace, session cookie, and redirect paths.

---

## Options

### `enabled`

| | |
|---|---|
| **Type** | `boolean` |
| **Default** | `true` |
| **Required** | No |

Enables or disables the plugin. When `false`, the plugin is a no-op and Payload's config is returned unchanged. Useful for feature-flagging auth in specific environments.

```ts
authPlugin({
  enabled: process.env.NODE_ENV !== 'test',
  // ...
})
```

---

### `name`

| | |
|---|---|
| **Type** | `string` |
| **Default** | — |
| **Required** | Yes |

A **unique** slug-safe identifier for this plugin instance. It is used to:

- Namespace all API endpoints: `/api/{name}/oauth/...`, `/api/{name}/auth/...`, `/api/{name}/session/...`
- Distinguish session cookies when multiple plugin instances are registered
- Match the `name` passed to `new AuthClient(name)` on the client side

The value is automatically slug-formatted (lowercased, spaces replaced with hyphens).

```ts
authPlugin({
  name: 'admin',        // → /api/admin/oauth/...
  // name: 'storefront' → /api/storefront/oauth/...
  // ...
})
```

> **Important:** The `name` you use here must exactly match the first argument you pass to `new AuthClient(name)` on the client side.

---

### `useAdmin`

| | |
|---|---|
| **Type** | `boolean` |
| **Default** | `false` |
| **Required** | No |

Set to `true` when this plugin instance is authenticating users for the **Payload admin panel**. When enabled, the plugin integrates with Payload's admin session handling so that the admin UI correctly reflects the authenticated user.

Only one plugin instance should have `useAdmin: true`.

```ts
authPlugin({
  name: 'admin',
  useAdmin: true,
  // ...
})
```

---

### `usersCollectionSlug`

| | |
|---|---|
| **Type** | `string` |
| **Default** | — |
| **Required** | Yes |

The slug of the Payload collection that stores user records. This collection should be created with the [`withUsersCollection`](./collections.md#withuserscollection) helper.

```ts
import { Users } from './collections/Users'

authPlugin({
  usersCollectionSlug: Users.slug,  // e.g. 'users'
  // ...
})
```

The plugin uses this slug to:
- Look up and create user records during sign-in / sign-up
- Read user data when building the session payload
- Scope password-auth operations to the correct collection

---

### `accountsCollectionSlug`

| | |
|---|---|
| **Type** | `string` |
| **Default** | — |
| **Required** | Yes |

The slug of the Payload collection that stores account records. This collection should be created with the [`withAccountCollection`](./collections.md#withaccountcollection) helper.

```ts
import { Accounts } from './collections/Accounts'

authPlugin({
  accountsCollectionSlug: Accounts.slug,  // e.g. 'accounts'
  // ...
})
```

The plugin uses this slug to:
- Create or update account documents after a successful OAuth / OIDC callback
- Look up existing accounts to link back to a user
- Store provider-specific data (tokens, `sub`, `scope`, passkey credentials, etc.)

---

### `providers`

| | |
|---|---|
| **Type** | `(OAuthProviderConfig \| PasskeyProviderConfig \| PasswordProviderConfig)[]` |
| **Default** | — |
| **Required** | Yes |

An array of provider configurations. At least one provider is required.

Providers are imported from `payload-auth-plugin/providers`. The array may contain any mix of OAuth / OIDC providers, `PasswordProvider`, and `PasskeyAuthProvider`.

```ts
import {
  GoogleAuthProvider,
  GitHubAuthProvider,
  PasswordProvider,
} from 'payload-auth-plugin/providers'

authPlugin({
  providers: [
    GoogleAuthProvider({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubAuthProvider({
      client_id: process.env.GITHUB_CLIENT_ID!,
      client_secret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    PasswordProvider({
      emailTemplates: {
        forgotPassword: renderForgotPasswordEmail,
      },
    }),
  ],
  // ...
})
```

See [Providers](./providers/README.md) for the full list and configuration details.

#### Provider type definitions

Source: [`src/types.ts`](../src/types.ts)

**`OAuthBaseProviderConfig`** — shared fields for all OAuth / OIDC providers:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `client_id` | `string` | Yes | OAuth client ID from the provider |
| `client_secret` | `string` | No* | OAuth client secret (*required for most providers) |
| `client_auth_type` | `"client_secret_basic" \| "client_secret_post"` | No | Token endpoint auth method |
| `params` | `Record<string, string>` | No | Extra query params to include in the authorization request |
| `overrideScope` | `string` | No | Replace the provider's default scope |

**`OIDCProviderConfig`** — extends `OAuthBaseProviderConfig` for OIDC providers:

| Field | Type | Description |
|-------|------|-------------|
| `issuer` | `string` | OIDC issuer URL |
| `algorithm` | `"oidc"` | Fixed discriminant |
| `kind` | `"oauth"` | Fixed discriminant |
| `skip_email_verification` | `boolean` | Skip email verification check |

**`OAuth2ProviderConfig`** — extends `OAuthBaseProviderConfig` for plain OAuth 2.0 providers:

| Field | Type | Description |
|-------|------|-------------|
| `authorization_server` | `AuthorizationServer` | Endpoint URLs for the provider |
| `algorithm` | `"oauth2"` | Fixed discriminant |
| `kind` | `"oauth"` | Fixed discriminant |

---

### `allowOAuthAutoSignUp`

| | |
|---|---|
| **Type** | `boolean` |
| **Default** | `false` |
| **Required** | No |

When `true`, a new user record is automatically created the first time someone signs in via an OAuth provider — even if no matching user exists in the Users collection.

When `false` (the default), only users who already exist in the Users collection can sign in via OAuth. New users attempting to sign in will be redirected to `errorRedirectPath`.

> **Security note:** Enable this only when open registration is intentional. For admin panel auth, leave it `false` and pre-create admin user records manually.

```ts
authPlugin({
  allowOAuthAutoSignUp: true,  // open registration
  // allowOAuthAutoSignUp: false, // invite-only (default)
  // ...
})
```

---

### `successRedirectPath`

| | |
|---|---|
| **Type** | `string` |
| **Default** | — |
| **Required** | Yes |

The **path** (not a full URL) to redirect the user to after a successful authentication event (sign-in, sign-up, OAuth callback).

```ts
authPlugin({
  successRedirectPath: '/dashboard',
  // successRedirectPath: '/admin',
  // successRedirectPath: '/admin/collections',
  // ...
})
```

The redirect is issued as a `302` response from the Payload API endpoint. The `NEXT_PUBLIC_SERVER_URL` environment variable is prepended automatically to form the full redirect URL.

---

### `errorRedirectPath`

| | |
|---|---|
| **Type** | `string` |
| **Default** | — |
| **Required** | Yes |

The **path** to redirect the user to when authentication fails (invalid credentials, provider error, user not found when `allowOAuthAutoSignUp` is `false`, etc.).

```ts
authPlugin({
  errorRedirectPath: '/auth/signin',
  // errorRedirectPath: '/admin/login',
  // ...
})
```

Error details are passed to this path as query parameters so your error page can display a human-readable message.

---

## Full Example

Below is a complete, annotated `authPlugin` configuration demonstrating every available option:

```ts
// payload.config.ts
import { buildConfig } from 'payload'
import { authPlugin } from 'payload-auth-plugin'
import {
  GoogleAuthProvider,
  GitHubAuthProvider,
  Auth0AuthProvider,
  PasswordProvider,
} from 'payload-auth-plugin/providers'
import { Users } from './collections/Users'
import { Accounts } from './collections/Accounts'
import { renderForgotPasswordEmail } from './emails/forgotPassword'

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL!,
  collections: [Users, Accounts],

  plugins: [
    // ── Admin panel ──────────────────────────────────────────────────────────
    authPlugin({
      enabled: true,                          // default; can be toggled per environment
      name: 'admin',                          // → endpoints at /api/admin/...
      useAdmin: true,                         // integrate with Payload's admin session
      usersCollectionSlug: Users.slug,        // 'users'
      accountsCollectionSlug: Accounts.slug,  // 'accounts'
      allowOAuthAutoSignUp: false,            // admins must be pre-created
      successRedirectPath: '/admin',
      errorRedirectPath: '/admin/login',
      providers: [
        GoogleAuthProvider({
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        Auth0AuthProvider({
          client_id: process.env.AUTH0_CLIENT_ID!,
          client_secret: process.env.AUTH0_CLIENT_SECRET!,
          domain: process.env.AUTH0_DOMAIN!,
        }),
      ],
    }),

    // ── Frontend / storefront app ─────────────────────────────────────────────
    authPlugin({
      name: 'storefront',                     // → endpoints at /api/storefront/...
      usersCollectionSlug: Users.slug,
      accountsCollectionSlug: Accounts.slug,
      allowOAuthAutoSignUp: true,             // anyone can self-register
      successRedirectPath: '/dashboard',
      errorRedirectPath: '/auth/signin',
      providers: [
        GoogleAuthProvider({
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        GitHubAuthProvider({
          client_id: process.env.GITHUB_CLIENT_ID!,
          client_secret: process.env.GITHUB_CLIENT_SECRET!,
        }),
        PasswordProvider({
          emailTemplates: {
            forgotPassword: renderForgotPasswordEmail,
          },
        }),
      ],
    }),
  ],
})
```

---

## Validation & Errors

The plugin performs several checks at startup and throws descriptive errors if the configuration is invalid.

| Error | Cause | Source |
|-------|-------|--------|
| `InvalidServerURL` | `config.serverURL` is not set in Payload config | [`src/core/errors/consoleErrors.ts`](../src/core/errors/consoleErrors.ts) |
| `MissingEmailAdapter` | `PasswordProvider` is enabled but no email adapter is configured in Payload | [`src/core/errors/consoleErrors.ts`](../src/core/errors/consoleErrors.ts) |
| `MissingCollectionSlug` | The slug for users or accounts collection is empty | [`src/core/errors/consoleErrors.ts`](../src/core/errors/consoleErrors.ts) |
| Collection not found | `usersCollectionSlug` or `accountsCollectionSlug` does not match any registered collection | [`src/core/preflights/collections.ts`](../src/core/preflights/collections.ts) |

These errors are thrown at **build time** (when Payload initialises), not at request time, so misconfiguration is caught immediately on startup.

---

## See Also

- [Setup Guide](./setup.md) — end-to-end integration walkthrough
- [Collections](./collections.md) — `withUsersCollection` and `withAccountCollection` API
- [Providers](./providers/README.md) — all supported provider options
- [Auth Client](./auth-client.md) — browser-side `AuthClient` API