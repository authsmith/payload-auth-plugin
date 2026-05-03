# AWS Cognito Auth Provider

> Authenticate users via AWS Cognito User Pools using OpenID Connect (OIDC).

Source: [`src/providers/oidc/cognito.ts`](../../src/providers/oidc/cognito.ts)

---

## Table of Contents

- [Overview](#overview)
- [Setup in AWS Cognito](#setup-in-aws-cognito)
- [Configuration](#configuration)
- [Usage](#usage)
- [Parameters Reference](#parameters-reference)
- [Default Scope](#default-scope)
- [Returns](#returns)

---

## Overview

`CognitoAuthProvider` implements OIDC-based authentication via AWS Cognito User Pools. It uses Cognito's OIDC discovery document (published at `{domain}/.well-known/openid-configuration`) to resolve endpoints automatically.

**Protocol:** OIDC
**Callback ID:** `cognito`
**Default scope:** `email openid profile`

---

## Setup in AWS Cognito

### 1. Create a User Pool

1. Sign in to the [AWS Management Console](https://console.aws.amazon.com/) and navigate to **Cognito**.
2. Click **Create user pool**.
3. Configure sign-in options (email, username, etc.) and click through the wizard to create the pool.
4. Note your **User Pool ID** (e.g. `us-east-1_AbCdEfGhI`) and **AWS Region**.

### 2. Create an App Client

1. In your User Pool, navigate to **App integration → App clients and analytics**.
2. Click **Create app client**.
3. Under **App type**, select **Confidential client**.
4. Give it a name and click **Create app client**.
5. In the app client settings, note the **Client ID** and **Client Secret**.

### 3. Configure a Domain

1. In your User Pool, navigate to **App integration → Domain**.
2. Either use a **Cognito domain** (e.g. `https://your-prefix.auth.us-east-1.amazoncognito.com`) or configure a **Custom domain**.
3. Note the full domain URL — this is the `domain` you'll pass to `CognitoAuthProvider`.

### 4. Set the Callback URL

1. In your app client settings, navigate to **Hosted UI**.
2. Under **Allowed callback URLs**, add your plugin callback URL:

   ```
   https://your-domain.com/api/{name}/oauth/callback/cognito
   ```

   For local development, also add:

   ```
   http://localhost:3000/api/{name}/oauth/callback/cognito
   ```

   Replace `{name}` with the `name` you passed to `authPlugin()` (e.g. `admin`, `storefront`).

3. Under **OAuth 2.0 grant types**, select **Authorization code grant**.
4. Under **OpenID Connect scopes**, select **email**, **openid**, and **profile**.
5. Click **Save changes**.

### 5. Set environment variables

```sh
COGNITO_CLIENT_ID=your-app-client-id
COGNITO_CLIENT_SECRET=your-app-client-secret
# Full domain URL, e.g. https://your-prefix.auth.us-east-1.amazoncognito.com
COGNITO_DOMAIN=https://your-prefix.auth.us-east-1.amazoncognito.com
```

---

## Configuration

```ts
// payload.config.ts
import { buildConfig } from 'payload'
import { authPlugin } from 'payload-auth-plugin'
import { CognitoAuthProvider } from 'payload-auth-plugin/providers'

export default buildConfig({
  plugins: [
    authPlugin({
      name: 'admin',
      usersCollectionSlug: 'users',
      accountsCollectionSlug: 'accounts',
      successRedirectPath: '/admin',
      errorRedirectPath: '/admin/login',
      providers: [
        CognitoAuthProvider({
          client_id: process.env.COGNITO_CLIENT_ID!,
          client_secret: process.env.COGNITO_CLIENT_SECRET!,
          domain: process.env.COGNITO_DOMAIN!,
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
// src/components/CognitoSignIn.tsx
'use client'
import { adminAuthClient } from '@/lib/auth'

export function CognitoSignInButton() {
  const { oauth } = adminAuthClient.signin()

  return (
    <button
      onClick={() => oauth('cognito')}
      style={{ backgroundColor: '#FF9900', color: '#fff' }}
    >
      Sign in with AWS Cognito
    </button>
  )
}
```

Clicking the button redirects the browser to:

```
{baseURL}/api/{name}/oauth/authorize/cognito
```

After the user authenticates via the Cognito Hosted UI, they are redirected back to:

```
https://your-domain.com/api/{name}/oauth/callback/cognito
```

The plugin validates the OIDC tokens using Cognito's discovery document, upserts the Account and User documents, issues a session cookie, and redirects to `successRedirectPath`.

---

## Parameters Reference

`CognitoAuthProvider` accepts a config object with the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `client_id` | `string` | Yes | App client ID from the AWS Cognito User Pool. |
| `client_secret` | `string` | Yes | App client secret from the AWS Cognito User Pool. |
| `domain` | `string` | Yes | The full URL of your Cognito domain (e.g. `https://your-prefix.auth.us-east-1.amazoncognito.com`). Used as the OIDC issuer to discover endpoints automatically. |
| `client_auth_type` | `'client_secret_basic' \| 'client_secret_post'` | No | Token endpoint authentication method. Defaults to `client_secret_basic`. |
| `params` | `Record<string, string>` | No | Extra query parameters appended to the authorization request URL. |
| `overrideScope` | `string` | No | Replace the default scope (`email openid profile`) with a custom scope string. |

---

## Default Scope

```
email openid profile
```

- `openid` — enables OIDC token issuance from Cognito
- `email` — grants access to the user's email address and verification status
- `profile` — grants access to the user's basic profile claims

To request additional Cognito scopes (e.g. a custom resource server scope), use `overrideScope`:

```ts
CognitoAuthProvider({
  client_id: process.env.COGNITO_CLIENT_ID!,
  client_secret: process.env.COGNITO_CLIENT_SECRET!,
  domain: process.env.COGNITO_DOMAIN!,
  overrideScope: 'email openid profile myapi/read',
})
```

> Custom resource server scopes must first be defined in **App integration → Resource servers** within your Cognito User Pool, and then enabled on your app client.

---

## Returns

`CognitoAuthProvider` returns an `OIDCProviderConfig` object:

```ts
{
  id: 'cognito',
  name: 'Cognito',
  algorithm: 'oidc',
  kind: 'oauth',
  issuer: domain,   // e.g. 'https://your-prefix.auth.us-east-1.amazoncognito.com'
  scope: 'email openid profile',  // or overrideScope
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

The `issuer` field is set to the `domain` you provide. Cognito publishes its OIDC discovery document at `{domain}/.well-known/openid-configuration`, which the plugin uses to resolve the authorization, token, and userinfo endpoint URLs automatically.

**`AccountInfo` fields populated from Cognito:**

| Field | Cognito claim | Description |
|-------|--------------|-------------|
| `sub` | `sub` | Stable, unique Cognito user identifier (UUID) |
| `name` | `name` | User's full name |
| `email` | `email` | User's primary email address |
| `picture` | `picture` | URL of the user's profile photo (if set) |

---

## Troubleshooting

| Issue | Likely cause | Fix |
|-------|-------------|-----|
| `invalid_client` error | Client secret is wrong or missing | Double-check `COGNITO_CLIENT_SECRET` and ensure your app client has a secret |
| `redirect_mismatch` error | Callback URL not registered | Add the exact callback URL under **Allowed callback URLs** in the app client's Hosted UI settings |
| `unsupported_response_type` error | Authorization code grant not enabled | Enable **Authorization code grant** in the app client's Hosted UI settings |
| Empty profile fields | Cognito attribute not mapped | Ensure `email`, `name`, and `picture` attributes are mapped in the User Pool's **Attribute mapping** settings |

---

## See Also

- [Providers Overview](./README.md) — all supported providers
- [Configuration](../configuration.md) — full `authPlugin()` options
- [Auth Client](../auth-client.md) — triggering OAuth sign-in from the browser
- [Setup Guide](../setup.md) — end-to-end integration walkthrough