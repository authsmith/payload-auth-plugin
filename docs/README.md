# payload-auth-plugin

> Authentication plugin for [Payload CMS](https://payloadcms.com) — OAuth 2.0, OIDC, Password, and Passkey support out of the box.

**Version:** 0.7.6 · **License:** MIT · **Payload:** >= 3.0.0

[![npm](https://img.shields.io/npm/v/payload-auth-plugin)](https://www.npmjs.com/package/payload-auth-plugin)
[![license](https://img.shields.io/npm/l/payload-auth-plugin)](../LICENSE)

---

## Table of Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Architecture](#architecture)
  - [Collections](#collections)
  - [Endpoints](#endpoints)
  - [Session](#session)
- [Supported Providers](#supported-providers)
- [Package Exports](#package-exports)
- [Documentation](#documentation)

---

## Overview

`payload-auth-plugin` extends Payload CMS's built-in authentication system to support multiple authentication strategies — OAuth 2.0, OIDC, Password, and Passkey — while staying true to Payload's own conventions and standards.

The plugin is designed for minimal configuration. Adding a new social login provider, for example, requires only a few lines of code in `payload.config.ts`. The same plugin instance handles **both admin panel authentication and any number of frontend applications**, each isolated by a unique `name`.

> **Requires Payload CMS >= 3.0**

---

## How It Works

```
User → Provider (Google, GitHub, etc.)
          ↓
    Payload Endpoint  (/api/{name}/oauth/callback/{provider})
          ↓
    Plugin Core  (validate tokens, upsert account, create session)
          ↓
    Payload Session Cookie  (cookie-based, uses Payload's own session)
          ↓
    Redirect → successRedirectPath / errorRedirectPath
```

1. The plugin registers catch-all API endpoints in Payload for each enabled authentication strategy.
2. Incoming requests are routed to the appropriate handler (OAuth, Password, Passkey, Session).
3. After successful authentication the plugin upserts an **Account** document (linked to a **User**), then creates a Payload session cookie.
4. The `AuthClient` class (client-side) provides typed helpers for triggering these flows from React/Next.js components.

---

## Architecture

### Collections

The plugin relies on two Payload collections:

| Collection | Purpose |
|------------|---------|
| **Users** | Stores user records. Managed via [`withUsersCollection`](./collections.md#withUserscollection). |
| **Accounts** | Stores per-provider account data linked to a User. Managed via [`withAccountCollection`](./collections.md#withAccountcollection). |

A single user can own **multiple** accounts (one per provider). Each account belongs to **one** user.

Source: [`src/collection/index.ts`](../src/collection/index.ts)

### Endpoints

For every enabled authentication strategy, the plugin registers Payload API endpoints under the `/api/{name}/` namespace.

| Strategy | Path pattern |
|----------|-------------|
| OAuth (authorize) | `GET /api/{name}/oauth/authorize/:provider` |
| OAuth (callback) | `GET /api/{name}/oauth/callback/:provider` |
| Password sign-in | `POST /api/{name}/auth/signin` |
| Password sign-up | `POST /api/{name}/auth/signup` |
| Forgot password | `POST /api/{name}/auth/forgot-password?stage=init` |
| Recover password | `POST /api/{name}/auth/forgot-password?stage=verify` |
| Reset password | `POST /api/{name}/auth/reset-password` |
| Passkey | `POST /api/{name}/passkey/:resource` |
| Get session | `GET /api/{name}/session/user` |
| Sign out | `GET /api/{name}/session/signout` |
| Refresh session | `GET /api/{name}/session/refresh` |

Source: [`src/core/endpoints.ts`](../src/core/endpoints.ts)

### Session

The plugin uses **Payload's native cookie-based session** mechanism. No external session store is needed. Sessions are issued as signed cookies after successful authentication and are readable server-side (via request headers) or client-side (via the `AuthClient` helper).

---

## Supported Providers

### OAuth / OIDC

| Provider | Type | Import |
|----------|------|--------|
| [Google](./providers/google.md) | OIDC | `GoogleAuthProvider` |
| [GitHub](./providers/github.md) | OAuth 2.0 | `GitHubAuthProvider` |
| [GitLab](./providers/gitlab.md) | OIDC | `GitLabAuthProvider` |
| [Apple (OIDC)](./providers/apple.md) | OIDC | `AppleOIDCAuthProvider` |
| [Apple (OAuth2)](./providers/apple.md) | OAuth 2.0 | `AppleOAuth2Provider` |
| [Auth0](./providers/auth0.md) | OAuth 2.0 | `Auth0AuthProvider` |
| [AWS Cognito](./providers/cognito.md) | OIDC | `CognitoAuthProvider` |
| [Microsoft Entra](./providers/microsoft-entra.md) | OIDC | `MicrosoftEntraAuthProvider` |
| [Atlassian](./providers/atlassian.md) | OAuth 2.0 | `AtlassianAuthProvider` |
| [Discord](./providers/discord.md) | OAuth 2.0 | `DiscordAuthProvider` |
| [Facebook](./providers/facebook.md) | OAuth 2.0 | `FacebookAuthProvider` |
| [Slack](./providers/slack.md) | OIDC | `SlackAuthProvider` |
| [Keycloak](./providers/keycloak.md) | OIDC | `KeyCloakAuthProvider` |
| [Okta](./providers/okta.md) | OIDC | `OktaAuthProvider` |
| [Twitch](./providers/twitch.md) | OAuth 2.0 | `TwitchAuthProvider` |
| [JumpCloud](./providers/jumpcloud.md) | OAuth 2.0 | `JumpCloudAuthProvider` |

### Credential-based

| Provider | Import |
|----------|--------|
| [Password](./providers/password.md) | `PasswordProvider` |
| [Passkey ⚠️ experimental](./providers/passkey.md) | `PasskeyAuthProvider` |

All providers are imported from `payload-auth-plugin/providers`.

---

## Package Exports

```
payload-auth-plugin          → authPlugin (the Payload plugin function)
payload-auth-plugin/providers → all provider factory functions
payload-auth-plugin/client    → AuthClient class
payload-auth-plugin/collection → withUsersCollection, withAccountCollection
payload-auth-plugin/collection/hooks → deleteLinkedAccounts hook
```

Source: [`package.json` exports field](../package.json)

---

## Documentation

| Guide | Description |
|-------|-------------|
| [Installation](./installation.md) | How to install the package |
| [Setup](./setup.md) | End-to-end setup walkthrough |
| [Configuration](./configuration.md) | All `authPlugin()` options explained |
| [Collections](./collections.md) | `withUsersCollection` and `withAccountCollection` API |
| [Auth Client](./auth-client.md) | `AuthClient` class API reference |
| [Session Management](./session-management.md) | Server-side and client-side session patterns |
| [Providers](./providers/README.md) | All supported providers |
| [Contributing](./contributing.md) | How to contribute to the plugin |

---

## Quick Start

```ts
// payload.config.ts
import { buildConfig } from 'payload'
import { authPlugin } from 'payload-auth-plugin'
import { GoogleAuthProvider, PasswordProvider } from 'payload-auth-plugin/providers'
import { Users } from './collections/Users'
import { Accounts } from './collections/Accounts'

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL,
  collections: [Users, Accounts],
  plugins: [
    authPlugin({
      name: 'admin',
      useAdmin: true,
      usersCollectionSlug: Users.slug,
      accountsCollectionSlug: Accounts.slug,
      successRedirectPath: '/admin',
      errorRedirectPath: '/admin/login',
      providers: [
        GoogleAuthProvider({
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        PasswordProvider({
          emailTemplates: { forgotPassword: myEmailTemplate },
        }),
      ],
    }),
  ],
})
```

See the full [Setup Guide](./setup.md) and the [example project](https://github.com/authsmith/payload-auth-plugin/tree/main/examples/with-website).

---

## Links

- [GitHub Repository](https://github.com/authsmith/payload-auth-plugin)
- [npm Package](https://www.npmjs.com/package/payload-auth-plugin)
- [Changelog](../CHANGELOG.md)
- [License (MIT)](../LICENSE)
- [Authsmith](https://authsmith.com)