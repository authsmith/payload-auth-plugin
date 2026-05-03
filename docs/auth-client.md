# Auth Client API Reference

> The `AuthClient` class is the browser-side interface for all authentication operations. It maps directly to the plugin's API endpoints and provides a typed, promise-based API for use in React / Next.js components.

Source: [`src/client/index.ts`](../src/client/index.ts)

---

## Table of Contents

- [Import](#import)
- [Constructor](#constructor)
- [Methods](#methods)
  - [`signin()`](#signin)
  - [`register()`](#register)
  - [`forgotPassword()`](#forgotpassword)
  - [`recoverPassword()`](#recoverpassword)
  - [`resetPassword()`](#resetpassword)
  - [`getSession()`](#getsession)
  - [`getClientSession()`](#getclientsession)
  - [`signout()`](#signout)
  - [`refreshSession()`](#refreshsession)
- [Return Type — `AuthPluginOutput`](#return-type--authpluginoutput)
- [Error Handling](#error-handling)
- [Multiple Clients](#multiple-clients)

---

## Import

```ts
import { AuthClient } from 'payload-auth-plugin/client'
```

---

## Constructor

```ts
new AuthClient(name: string, options?: { payloadBaseURL?: string })
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | `string` | Yes | Must match the `name` option passed to `authPlugin()` in your Payload config. This is used to construct the correct API endpoint paths (e.g. `/api/{name}/oauth/...`). |
| `options.payloadBaseURL` | `string` | No | Base URL of your Payload server. Defaults to `process.env.NEXT_PUBLIC_PAYLOAD_AUTH_URL`. Useful when you need to point to a different server in tests or SSR contexts. |

**Throws** `MissingPayloadAuthBaseURL` if neither `options.payloadBaseURL` nor `NEXT_PUBLIC_PAYLOAD_AUTH_URL` is set.

```ts
// Standard setup — reads base URL from environment variable
export const adminAuthClient = new AuthClient('admin')

// Explicit base URL — useful for testing or SSR overrides
export const appAuthClient = new AuthClient('app', {
  payloadBaseURL: 'https://api.myapp.com',
})
```

---

## Methods

### `signin()`

Returns an object with methods for initiating different sign-in strategies.

Source: [`src/client/signin.ts`](../src/client/signin.ts)

```ts
signin(additionalScope?: string): {
  oauth: (provider: OauthProvider) => void
  password: (payload: PasswordSigninPayload) => Promise<AuthPluginOutput>
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `additionalScope` | `string` | No | Extra OAuth scope to request on top of the provider's default scope. |

**Returns an object with:**

#### `oauth(provider)`

Triggers an OAuth / OIDC sign-in by redirecting the browser to the provider's authorization endpoint via the plugin's OAuth authorize endpoint.

```ts
oauth(provider: OauthProvider): void
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `provider` | `string` | The provider ID — must match one of the providers registered in `authPlugin()`. Common values: `'google'`, `'github'`, `'discord'`, `'auth0'`, etc. |

The function constructs `{baseURL}/api/{name}/oauth/authorize/{provider}` and sets `window.location.href` to initiate the redirect flow. After the OAuth callback completes, the browser is redirected to either `successRedirectPath` or `errorRedirectPath`.

**Example:**

```tsx
'use client'
import { adminAuthClient } from '@/lib/auth'

export function OAuthButtons() {
  const { oauth } = adminAuthClient.signin()

  return (
    <div>
      <button onClick={() => oauth('google')}>Sign in with Google</button>
      <button onClick={() => oauth('github')}>Sign in with GitHub</button>
      <button onClick={() => oauth('discord')}>Sign in with Discord</button>
    </div>
  )
}
```

---

#### `password(payload)`

Signs in a user with email and password credentials.

Source: [`src/client/password.ts`](../src/client/password.ts)

```ts
password(payload: PasswordSigninPayload): Promise<AuthPluginOutput>
```

**`PasswordSigninPayload`:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | Yes | The user's email address. |
| `password` | `string` | Yes | The user's plaintext password (transmitted over HTTPS). |

Calls `POST /api/{name}/auth/signin`.

**Example:**

```tsx
'use client'
import { appAuthClient } from '@/lib/auth'

export function SignInForm() {
  const { password } = appAuthClient.signin()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const result = await password({
      email: data.get('email') as string,
      password: data.get('password') as string,
    })
    if (result.isError) {
      console.error(result.message)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Sign in</button>
    </form>
  )
}
```

---

### `register()`

Returns an object with methods for registering a new user.

Source: [`src/client/register.ts`](../src/client/register.ts)

```ts
register(): {
  password: (payload: PasswordSignupPayload) => Promise<AuthPluginOutput>
}
```

#### `password(payload)`

Creates a new user account with email and password.

Source: [`src/client/password.ts`](../src/client/password.ts)

```ts
password(payload: PasswordSignupPayload): Promise<AuthPluginOutput>
```

**`PasswordSignupPayload`:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | Yes | The new user's email address. Must be unique. |
| `password` | `string` | Yes | The new user's plaintext password. |
| `allowAutoSignin` | `boolean` | No | If `true`, the user is automatically signed in after successful registration. Defaults to `false`. |
| `userInfo` | `Record<string, unknown>` | No | Additional fields to set on the created User document (e.g. `first_name`, `last_name`). Keys must match fields defined on your Users collection. |

Calls `POST /api/{name}/auth/signup`.

**Example:**

```tsx
'use client'
import { appAuthClient } from '@/lib/auth'

export function SignUpForm() {
  const { password } = appAuthClient.register()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const result = await password({
      email: data.get('email') as string,
      password: data.get('password') as string,
      allowAutoSignin: true,
      userInfo: {
        first_name: data.get('first_name'),
        last_name: data.get('last_name'),
      },
    })
    if (result.isError) console.error(result.message)
    if (result.isSuccess) console.log('Account created!')
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="first_name" type="text" placeholder="First name" />
      <input name="last_name" type="text" placeholder="Last name" />
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit">Create account</button>
    </form>
  )
}
```

---

### `forgotPassword()`

Initiates the password recovery flow by sending a one-time verification code to the user's email address.

Source: [`src/client/password.ts`](../src/client/password.ts)

```ts
async forgotPassword(payload: ForgotPasswordPayload): Promise<AuthPluginOutput>
```

**`ForgotPasswordPayload`:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | Yes | The email address associated with the account. |

Calls `POST /api/{name}/auth/forgot-password?stage=init`.

> **Prerequisites:** Payload's [email adapter](https://payloadcms.com/docs/email/overview) must be configured in your Payload config. The plugin uses it to dispatch the recovery email containing the verification code. See [PasswordProvider](./providers/password.md) for a starter email template built with React Email.

**Example:**

```tsx
'use client'
import { useState } from 'react'
import { appAuthClient } from '@/lib/auth'

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const result = await appAuthClient.forgotPassword({
      email: data.get('email') as string,
    })
    if (result.isSuccess) setSent(true)
    if (result.isError) console.error(result.message)
  }

  if (sent) return <p>Check your inbox for a recovery link.</p>

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" placeholder="Email" required />
      <button type="submit">Send recovery email</button>
    </form>
  )
}
```

---

### `recoverPassword()`

Completes the password recovery flow. The user submits the one-time code they received by email together with their new password.

Source: [`src/client/password.ts`](../src/client/password.ts)

```ts
async recoverPassword(payload: PasswordRecoverPayload): Promise<AuthPluginOutput>
```

**`PasswordRecoverPayload`:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | `string` | Yes | The one-time verification code from the recovery email. |
| `password` | `string` | Yes | The new plaintext password to set. |

Calls `POST /api/{name}/auth/forgot-password?stage=verify`.

**Example:**

```tsx
'use client'
import { appAuthClient } from '@/lib/auth'

// Typically rendered at /auth/recover-password?code=<code>
export function RecoverPasswordForm({ code }: { code: string }) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const result = await appAuthClient.recoverPassword({
      code,
      password: data.get('password') as string,
    })
    if (result.isSuccess) alert('Password updated! You can now sign in.')
    if (result.isError) console.error(result.message)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="password" type="password" placeholder="New password" required />
      <button type="submit">Update password</button>
    </form>
  )
}
```

---

### `resetPassword()`

Resets a user's password when you already know both the email and the desired new password. Unlike `recoverPassword`, this does not require a verification code.

Source: [`src/client/password.ts`](../src/client/password.ts)

```ts
async resetPassword(payload: PasswordResetPayload): Promise<AuthPluginOutput>
```

**`PasswordResetPayload`:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | Yes | The user's email address. |
| `password` | `string` | Yes | The new plaintext password. |

Calls `POST /api/{name}/auth/reset-password`.

**Example:**

```ts
const result = await appAuthClient.resetPassword({
  email: 'user@example.com',
  password: 'new-secure-password',
})
if (result.isError) console.error(result.message)
```

---

### `getSession()`

Fetches the current user's session **server-side** by forwarding the request headers (which carry the session cookie).

Source: [`src/client/session.ts`](../src/client/session.ts)

```ts
async getSession(options: { headers: HeadersInit }): Promise<AuthPluginOutput>
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `options.headers` | `HeadersInit` | Yes | The incoming request headers. In Next.js App Router, use `await headers()` from `next/headers`. |

Calls `GET /api/{name}/session/user` with the provided headers forwarded.

**When to use:** In Next.js Server Components, `page.tsx` files, Route Handlers, and server actions — anywhere you have access to the raw request headers.

**Example:**

```ts
// src/app/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { adminAuthClient } from '@/lib/auth'

export default async function DashboardPage() {
  const session = await adminAuthClient.getSession({
    headers: await headers(),
  })

  if (session.isError) {
    redirect('/admin/login')
  }

  const user = session.data as { id: string; email: string }

  return (
    <main>
      <h1>Welcome, {user.email}</h1>
    </main>
  )
}
```

---

### `getClientSession()`

Fetches the current user's session **client-side** using the browser's cookie store. No headers need to be passed — the browser sends the session cookie automatically.

Source: [`src/client/session.ts`](../src/client/session.ts)

```ts
async getClientSession(): Promise<AuthPluginOutput>
```

**Throws** `WrongClientUsage` if called in a server-side (Node.js) environment where `window` is not defined.

Calls `GET /api/{name}/session/user` without explicit headers.

**When to use:** In Client Components (`'use client'`) or custom React hooks.

**Example — custom hook:**

```ts
// src/hooks/useSession.ts
'use client'
import { useEffect, useState } from 'react'
import { appAuthClient } from '@/lib/auth'

type SessionState = {
  loading: boolean
  isSuccess: boolean
  message: string
  data: Record<string, unknown>
}

export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({
    loading: true,
    isSuccess: false,
    message: '',
    data: {},
  })

  useEffect(() => {
    appAuthClient.getClientSession().then((result) => {
      setState({
        loading: false,
        isSuccess: result.isSuccess,
        message: result.message,
        data: (result.data as Record<string, unknown>) ?? {},
      })
    })
  }, [])

  return state
}
```

```tsx
// src/components/UserBadge.tsx
'use client'
import { useSession } from '@/hooks/useSession'

export function UserBadge() {
  const { loading, isSuccess, data } = useSession()

  if (loading) return <span>Loading…</span>
  if (!isSuccess) return <span>Not signed in</span>

  return <span>{(data as any).email}</span>
}
```

---

### `signout()`

Signs the current user out by clearing the session cookie, then redirects the browser to the specified `returnTo` path.

Source: [`src/client/signout.ts`](../src/client/signout.ts)

```ts
async signout(options?: { returnTo?: string }): Promise<AuthPluginOutput>
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `options.returnTo` | `string` | No | Path to redirect to after sign-out. Defaults to the plugin's `errorRedirectPath` if omitted. |

**Throws** `WrongClientUsage` if called in a server-side environment.

Calls `GET /api/{name}/session/signout?returnTo={returnTo}`. On success, sets `window.location.href` to the redirect URL returned by the server.

**Example:**

```tsx
'use client'
import { appAuthClient } from '@/lib/auth'

export function SignOutButton() {
  const handleSignOut = async () => {
    await appAuthClient.signout({ returnTo: '/auth/signin' })
    // The browser is redirected by the signout function itself
  }

  return (
    <button onClick={handleSignOut}>
      Sign out
    </button>
  )
}
```

---

### `refreshSession()`

Refreshes the current session cookie, extending its expiry. Useful for long-running dashboards that need to keep the session alive without user interaction.

Source: [`src/client/refresh.ts`](../src/client/refresh.ts)

```ts
async refreshSession(): Promise<AuthPluginOutput>
```

**Throws** `WrongClientUsage` if called in a server-side environment.

Calls `GET /api/{name}/session/refresh`.

**Example:**

```ts
// Periodically refresh the session while the user is active
setInterval(async () => {
  const result = await appAuthClient.refreshSession()
  if (result.isError) {
    // Session has expired — redirect to sign-in
    window.location.href = '/auth/signin'
  }
}, 10 * 60 * 1000) // every 10 minutes
```

---

## Return Type — `AuthPluginOutput`

All async methods return a `Promise<AuthPluginOutput>`.

Source: [`src/types.ts`](../src/types.ts)

```ts
interface AuthPluginOutput {
  message: string          // Human-readable status message
  kind: ErrorKind | SuccessKind  // Categorised result kind
  data: unknown            // Response payload (user data, tokens, etc.)
  isSuccess: boolean       // true when the operation succeeded
  isError: boolean         // true when the operation failed
}
```

**`SuccessKind` values:**

| Value | Meaning |
|-------|---------|
| `Created` | A new resource was created (e.g. new user registered) |
| `Updated` | An existing resource was updated (e.g. password reset) |
| `Retrieved` | A resource was successfully fetched (e.g. session loaded) |
| `Deleted` | A resource was deleted (e.g. signed out) |

**`ErrorKind` values:**

| Value | Meaning |
|-------|---------|
| `NotFound` | The requested resource does not exist |
| `InternalServer` | An unexpected server-side error occurred |
| `BadRequest` | The request payload was invalid or malformed |
| `NotAuthorized` | The user does not have permission for this action |
| `NotAuthenticated` | No valid session was found |
| `Conflict` | A resource already exists (e.g. email already registered) |

---

## Error Handling

Always check `isError` and `isSuccess` on the returned object. Never assume a response is successful.

```ts
const result = await appAuthClient.signin().password({
  email: 'user@example.com',
  password: 'hunter2',
})

if (result.isError) {
  switch (result.kind) {
    case 'NotAuthenticated':
      showToast('Invalid email or password.')
      break
    case 'NotFound':
      showToast('No account found with that email.')
      break
    case 'InternalServer':
      showToast('Something went wrong. Please try again.')
      break
    default:
      showToast(result.message)
  }
  return
}

// Success
router.push('/dashboard')
```

---

## Multiple Clients

When you have multiple `authPlugin()` instances (e.g. admin + storefront), create a separate `AuthClient` for each. The `name` must match the corresponding plugin instance.

```ts
// src/lib/auth.ts
import { AuthClient } from 'payload-auth-plugin/client'

/** Manages authentication for the Payload admin panel */
export const adminAuthClient = new AuthClient('admin')

/** Manages authentication for the customer-facing storefront */
export const storefrontAuthClient = new AuthClient('storefront')
```

Each client targets its own `/api/{name}/` endpoint namespace and reads/writes its own session cookie independently.

---

## See Also

- [Setup Guide](./setup.md) — end-to-end integration walkthrough
- [Session Management](./session-management.md) — detailed session patterns
- [Configuration](./configuration.md) — `name`, `successRedirectPath`, `errorRedirectPath` options
- [PasswordProvider](./providers/password.md) — password auth provider setup