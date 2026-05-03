# Providers

> All authentication providers supported by `payload-auth-plugin`.

Providers are imported from `payload-auth-plugin/providers` and passed to the `providers` array in your `authPlugin()` configuration.

Source: [`src/providers/index.ts`](../../src/providers/index.ts)

---

## Table of Contents

- [Provider Categories](#provider-categories)
- [OAuth / OIDC Providers](#oauth--oidc-providers)
- [Credential Providers](#credential-providers)
- [Shared Configuration](#shared-configuration)
  - [OAuthBaseProviderConfig](#oauthbaseproviderconfig)
  - [OIDCProviderConfig](#oidcproviderconfig)
  - [OAuth2ProviderConfig](#oauth2providerconfig)
- [Callback URL Pattern](#callback-url-pattern)
- [Overriding Scopes](#overriding-scopes)
- [Additional Parameters](#additional-parameters)

---

## Provider Categories

| Category | Description |
|----------|-------------|
| **OIDC** | OpenID Connect providers. Use an `issuer` URL for discovery. Tokens include an `id_token`. |
| **OAuth 2.0** | Plain OAuth 2.0 providers. Use explicit `authorization_server` endpoint URLs. No `id_token`. |
| **Password** | Email + password credential authentication with signup, forgot password, and recovery flows. |
| **Passkey** | WebAuthn / FIDO2 passkey authentication. ⚠️ Experimental — not recommended for production. |

---

## OAuth / OIDC Providers

| Provider | Protocol | Import | Callback ID |
|----------|----------|--------|-------------|
| [Google](./google.md) | OIDC | `GoogleAuthProvider` | `google` |
| [GitHub](./github.md) | OAuth 2.0 | `GitHubAuthProvider` | `github` |
| [GitLab](./gitlab.md) | OIDC | `GitLabAuthProvider` | `gitlab` |
| [Apple (OIDC)](./apple.md) | OIDC | `AppleOIDCAuthProvider` | `apple` |
| [Apple (OAuth2)](./apple.md) | OAuth 2.0 | `AppleOAuth2Provider` | `apple` |
| [Auth0](./auth0.md) | OAuth 2.0 | `Auth0AuthProvider` | `auth0` |
| [AWS Cognito](./cognito.md) | OIDC | `CognitoAuthProvider` | `cognito` |
| [Microsoft Entra](./microsoft-entra.md) | OIDC | `MicrosoftEntraAuthProvider` | `msft-entra` |
| [Atlassian](./atlassian.md) | OAuth 2.0 | `AtlassianAuthProvider` | `atlassian` |
| [Discord](./discord.md) | OAuth 2.0 | `DiscordAuthProvider` | `discord` |
| [Facebook](./facebook.md) | OAuth 2.0 | `FacebookAuthProvider` | `facebook` |
| [Slack](./slack.md) | OIDC | `SlackAuthProvider` | `slack` |
| [Keycloak](./keycloak.md) | OIDC | `KeyCloakAuthProvider` | custom (`identifier`) |
| [Okta](./okta.md) | OIDC | `OktaAuthProvider` | `okta` |
| [Twitch](./twitch.md) | OAuth 2.0 | `TwitchAuthProvider` | `twitch` |
| [JumpCloud](./jumpcloud.md) | OAuth 2.0 | `JumpCloudAuthProvider` | `jumpcloud` |

---

## Credential Providers

| Provider | Import | Notes |
|----------|--------|-------|
| [Password](./password.md) | `PasswordProvider` | Email + password with signup, forgot-password, and recovery flows. Requires Payload email adapter. |
| [Passkey](./passkey.md) | `PasskeyAuthProvider` | WebAuthn passkey authentication. ⚠️ Experimental. |

---

## Shared Configuration

All OAuth and OIDC provider factory functions accept a config object that extends `OAuthBaseProviderConfig`.

Source: [`src/types.ts`](../../src/types.ts)

### `OAuthBaseProviderConfig`

```ts
interface OAuthBaseProviderConfig {
  client_id: string
  client_secret?: string
  client_auth_type?: 'client_secret_basic' | 'client_secret_post'
  params?: Record<string, string>
  overrideScope?: string
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `client_id` | `string` | Yes | OAuth client ID issued by the provider. |
| `client_secret` | `string` | No* | OAuth client secret. Required by most providers; optional for public clients (e.g. `AppleOIDCAuthProvider`). |
| `client_auth_type` | `string` | No | How the client secret is sent to the token endpoint. Defaults to the provider's standard method. |
| `params` | `Record<string, string>` | No | Extra query parameters to append to the authorization request URL. |
| `overrideScope` | `string` | No | Replace the provider's built-in default scope with a custom scope string. |

### `OIDCProviderConfig`

Extends `OAuthBaseProviderConfig`. Returned by OIDC provider factories (Google, GitLab, Cognito, etc.).

```ts
interface OIDCProviderConfig extends OAuthBaseProviderConfig {
  id: string
  name: string
  scope: string
  issuer: string
  algorithm: 'oidc'
  kind: 'oauth'
  skip_email_verification?: boolean
  profile: (profile: Record<string, unknown>) => AccountInfo
}
```

The `issuer` URL is used for OIDC discovery (fetching the provider's `.well-known/openid-configuration`).

### `OAuth2ProviderConfig`

Extends `OAuthBaseProviderConfig`. Returned by plain OAuth 2.0 provider factories (GitHub, Discord, Facebook, etc.).

```ts
interface OAuth2ProviderConfig extends OAuthBaseProviderConfig {
  id: string
  name: string
  scope: string
  authorization_server: AuthorizationServer
  algorithm: 'oauth2'
  kind: 'oauth'
  profile: (profile: Record<string, unknown>) => AccountInfo
}
```

`authorization_server` carries the explicit endpoint URLs (`authorization_endpoint`, `token_endpoint`, `userinfo_endpoint`) since plain OAuth 2.0 providers don't support discovery.

---

## Callback URL Pattern

Every OAuth / OIDC provider requires a **Callback URL** (also called Redirect URI) to be registered in the provider's developer console. The pattern is:

```
https://{your-domain}/api/{name}/oauth/callback/{provider-id}
```

| Placeholder | Description |
|-------------|-------------|
| `{your-domain}` | Your Payload server's public domain (the value of `NEXT_PUBLIC_SERVER_URL`). |
| `{name}` | The `name` you passed to `authPlugin()` (e.g. `admin`, `storefront`). |
| `{provider-id}` | The provider's ID string — see the **Callback ID** column in the table above. |

**Examples:**

```
https://myapp.com/api/admin/oauth/callback/google
https://myapp.com/api/storefront/oauth/callback/github
https://myapp.com/api/admin/oauth/callback/msft-entra
```

During **local development**, register the localhost equivalent:

```
http://localhost:3000/api/admin/oauth/callback/google
```

---

## Overriding Scopes

Each provider has a built-in default scope (e.g. `email openid profile`). You can replace it entirely using `overrideScope`:

```ts
GoogleAuthProvider({
  client_id: process.env.GOOGLE_CLIENT_ID!,
  client_secret: process.env.GOOGLE_CLIENT_SECRET!,
  overrideScope: 'email openid profile https://www.googleapis.com/auth/calendar.readonly',
})
```

> Scopes are space-separated strings. Only request scopes your application actually needs.

---

## Additional Parameters

Use `params` to append extra query parameters to the authorization request. This is useful for provider-specific options that aren't part of the standard OAuth spec:

```ts
GoogleAuthProvider({
  client_id: process.env.GOOGLE_CLIENT_ID!,
  client_secret: process.env.GOOGLE_CLIENT_SECRET!,
  params: {
    prompt: 'select_account',   // always show account picker
    hd: 'mycompany.com',        // restrict to a Google Workspace domain
  },
})
```

```ts
MicrosoftEntraAuthProvider({
  client_id: process.env.ENTRA_CLIENT_ID!,
  client_secret: process.env.ENTRA_CLIENT_SECRET!,
  tenant_id: process.env.ENTRA_TENANT_ID!,
  params: {
    prompt: 'consent',
  },
})
```

---

## See Also

- [Configuration](../configuration.md) — `providers` option in `authPlugin()`
- [Setup Guide](../setup.md) — end-to-end integration walkthrough
- [Auth Client](../auth-client.md) — triggering OAuth sign-in from the browser