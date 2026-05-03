# Setup Guide

> A step-by-step walkthrough for integrating `payload-auth-plugin` into your Payload CMS project.

**See also:** The [example project](https://github.com/authsmith/payload-auth-plugin/tree/main/examples/with-website) demonstrates a complete working setup with both admin and frontend authentication.

---

## Table of Contents

1. [Environment Variables](#1-environment-variables)
2. [Create the Collections](#2-create-the-collections)
   - [Users Collection](#21-users-collection)
   - [Accounts Collection](#22-accounts-collection)
   - [Cleanup Hook (optional)](#23-cleanup-hook-optional)
3. [Register the Plugin](#3-register-the-plugin)
4. [Create the Auth Client](#4-create-the-auth-client)
5. [Build Sign-in UI](#5-build-sign-in-ui)
   - [Admin Panel](#51-admin-panel-sign-in)
   - [Frontend App](#52-frontend-app-sign-in)
6. [Session & Sign-out](#6-session--sign-out)
   - [Server-side Session](#61-server-side-session)
   - [Client-side Session](#62-client-side-session)
   - [Sign out](#63-sign-out)
7. [Multi-app Setup](#7-multi-app-setup)

---

## 1. Environment Variables

Create a `.env` file at the root of your project and add:

```sh
# Payload CMS core
PAYLOAD_SECRET=
NEXT_PUBLIC_SERVER_URL=

# payload-auth-plugin
PAYLOAD_AUTH_SECRET=
NEXT_PUBLIC_PAYLOAD_AUTH_URL=
```

> **Tip:** Run `openssl rand -base64 32` to generate a strong random secret.

`NEXT_PUBLIC_PAYLOAD_AUTH_URL` is the base URL the browser-side `AuthClient` uses to reach your Payload API (e.g. `http://localhost:3000`). For a Next.js project where Payload runs in the same app, this is the same as `NEXT_PUBLIC_SERVER_URL`.

Add provider-specific credentials alongside these (e.g. `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`). See the individual [provider guides](./providers/README.md) for what each provider needs.

---

## 2. Create the Collections

The plugin requires two Payload collections: **Users** and **Accounts**. Helper functions — `withUsersCollection` and `withAccountCollection` — inject the fields the plugin needs without you having to define them manually.

Source: [`src/collection/index.ts`](../src/collection/index.ts)

### 2.1. Users Collection

Use `withUsersCollection` to wrap your base collection config. The wrapper injects authentication-related fields (`hashedPassword`, `hashSalt`, `verificationCode`, etc.) and applies sensible default access rules.

> **Important:** Do **not** set `auth: true` on the collection config you pass in. The plugin manages authentication itself and its fields would conflict with Payload's built-in auth fields.

```ts
// src/collections/Users.ts
import type { CollectionConfig } from 'payload'
import { withUsersCollection } from 'payload-auth-plugin/collection'

export const Users: CollectionConfig = withUsersCollection({
  slug: 'users',
  admin: {
    defaultColumns: ['email', 'first_name', 'last_name'],
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      label: 'Email',
    },
    {
      name: 'first_name',
      type: 'text',
      label: 'First Name',
    },
    {
      name: 'last_name',
      type: 'text',
      label: 'Last Name',
    },
  ],
})
```

**Fields injected by `withUsersCollection`:**

| Field | Type | Description |
|-------|------|-------------|
| `hashedPassword` | `text` | Hashed password (password auth) |
| `hashSalt` | `text` | Salt used during hashing |
| `hashIterations` | `number` | Iteration count for hashing |
| `verificationCode` | `text` | One-time code for email verification / password recovery |
| `verificationHash` | `text` | Hash of the verification code |
| `verificationTokenExpire` | `number` | Expiry timestamp for the verification token |
| `verificationKind` | `text` | Kind of verification (`forgotPassword`, etc.) |
| `claims` | `json` | Arbitrary claims attached to the user |
| `email` | `email` | Added automatically if no `email`-type field is present in your config |

### 2.2. Accounts Collection

Use `withAccountCollection` to wrap your accounts collection config. Pass the **users collection slug** as the second argument so the plugin can create the relationship between accounts and users.

```ts
// src/collections/Accounts.ts
import type { CollectionConfig } from 'payload'
import { withAccountCollection } from 'payload-auth-plugin/collection'
import { Users } from './Users'

export const Accounts: CollectionConfig = withAccountCollection(
  {
    slug: 'accounts',
  },
  Users.slug,
)
```

**Fields injected by `withAccountCollection`:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | `text` | Display name from the provider |
| `picture` | `text` | Avatar URL from the provider |
| `user` | `relationship` | Link to the Users collection |
| `issuerName` | `text` | Provider identifier (e.g. `google`, `github`) |
| `scope` | `text` | Scopes granted by the provider |
| `sub` | `text` | Provider's unique subject identifier |
| `access_token` | `text` | OAuth access token |
| `refresh_token` | `text` | OAuth refresh token |
| `expires_in` | `number` | Token expiry (seconds) |
| `passkey` | `group` | Passkey credential data (shown only for passkey accounts) |

### 2.3. Cleanup Hook (optional)

Add `deleteLinkedAccounts` as an `afterDelete` hook on the Users collection to automatically remove all accounts belonging to a user when that user is deleted.

Source: [`src/collection/hooks.ts`](../src/collection/hooks.ts)

```ts
// src/collections/Users.ts
import type { CollectionConfig } from 'payload'
import { withUsersCollection } from 'payload-auth-plugin/collection'
import { deleteLinkedAccounts } from 'payload-auth-plugin/collection/hooks'
import { Accounts } from './Accounts'

export const Users: CollectionConfig = withUsersCollection({
  slug: 'users',
  // ... your fields
  hooks: {
    afterDelete: [deleteLinkedAccounts(Accounts.slug)],
  },
})
```

---

## 3. Register the Plugin

Import `authPlugin` and add it to the `plugins` array in your Payload config. Import the providers you want to enable from `payload-auth-plugin/providers`.

Source: [`src/plugin.ts`](../src/plugin.ts)

```ts
// payload.config.ts
import { buildConfig } from 'payload'
import { authPlugin } from 'payload-auth-plugin'
import {
  GoogleAuthProvider,
  GitHubAuthProvider,
  PasswordProvider,
} from 'payload-auth-plugin/providers'
import { Users } from './collections/Users'
import { Accounts } from './collections/Accounts'

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL!,
  collections: [Users, Accounts],
  plugins: [
    authPlugin({
      name: 'admin',            // unique identifier — used in endpoint paths and session cookies
      useAdmin: true,           // marks this instance as the admin panel auth
      usersCollectionSlug: Users.slug,
      accountsCollectionSlug: Accounts.slug,
      successRedirectPath: '/admin',
      errorRedirectPath: '/admin/login',
      allowOAuthAutoSignUp: true,
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

See [Configuration](./configuration.md) for a complete description of every option.

---

## 4. Create the Auth Client

The `AuthClient` class is the browser-side interface to the plugin's API. Instantiate it once and export it for use in your components.

Source: [`src/client/index.ts`](../src/client/index.ts)

```ts
// src/lib/auth.ts
import { AuthClient } from 'payload-auth-plugin/client'

// The name must match the `name` you passed to authPlugin()
export const adminAuthClient = new AuthClient('admin')
```

**Constructor options:**

```ts
new AuthClient(name: string, options?: { payloadBaseURL?: string })
```

| Parameter | Description |
|-----------|-------------|
| `name` | Must match the `name` option passed to `authPlugin()`. |
| `options.payloadBaseURL` | Override the Payload API base URL. Defaults to `process.env.NEXT_PUBLIC_PAYLOAD_AUTH_URL`. |

---

## 5. Build Sign-in UI

### 5.1. Admin Panel Sign-in

Payload's admin panel renders any components listed in `admin.components.afterLogin`. Create a component that calls the auth client and register it in your Payload config.

```tsx
// src/components/AdminLogin/index.tsx
'use client'
import React from 'react'
import { Button } from '@payloadcms/ui'
import { adminAuthClient } from '@/lib/auth'

export const AdminLogin = () => {
  const { oauth } = adminAuthClient.signin()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      <Button type="button" onClick={() => oauth('google')}>
        Sign in with Google
      </Button>
      <Button type="button" onClick={() => oauth('github')}>
        Sign in with GitHub
      </Button>
    </div>
  )
}
```

Register the component in your Payload config:

```ts
// payload.config.ts
export default buildConfig({
  admin: {
    components: {
      afterLogin: ['@/components/AdminLogin/index#AdminLogin'],
    },
  },
  // ... rest of config
})
```

Navigate to `/admin/login` to see the custom sign-in buttons rendered below the default Payload login form.

### 5.2. Frontend App Sign-in

For a frontend application (separate from the admin panel), create a second plugin instance with a different `name` and `useAdmin: false` (the default).

```ts
// payload.config.ts — second plugin instance for the frontend app
authPlugin({
  name: 'app',
  usersCollectionSlug: Users.slug,
  accountsCollectionSlug: Accounts.slug,
  successRedirectPath: '/dashboard',
  errorRedirectPath: '/auth/signin',
  allowOAuthAutoSignUp: true,
  providers: [
    GoogleAuthProvider({ ... }),
    PasswordProvider({ ... }),
  ],
}),
```

```ts
// src/lib/auth.ts — add a second client for the frontend
export const appAuthClient = new AuthClient('app')
```

**OAuth sign-in button:**

```tsx
'use client'
import { appAuthClient } from '@/lib/auth'

export function SignInWithGoogle() {
  const { oauth } = appAuthClient.signin()
  return <button onClick={() => oauth('google')}>Sign in with Google</button>
}
```

**Password sign-in form:**

```tsx
'use client'
import { appAuthClient } from '@/lib/auth'

export function SignInForm() {
  const { password } = appAuthClient.signin()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const res = await password({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    })
    if (res.isError) console.error(res.message)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit">Sign in</button>
    </form>
  )
}
```

**Password sign-up form:**

```tsx
'use client'
import { appAuthClient } from '@/lib/auth'

export function SignUpForm() {
  const { password } = appAuthClient.register()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const res = await password({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      userInfo: {
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
      },
      allowAutoSignin: true,  // sign in immediately after registration
    })
    if (res.isError) console.error(res.message)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="first_name" type="text" placeholder="First Name" />
      <input name="last_name" type="text" placeholder="Last Name" />
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit">Create account</button>
    </form>
  )
}
```

**Forgot password flow:**

```tsx
'use client'
import { appAuthClient } from '@/lib/auth'

// Step 1 — request a recovery code via email
export function ForgotPasswordForm() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const res = await appAuthClient.forgotPassword({
      email: formData.get('email') as string,
    })
    if (res.isSuccess) alert('Check your inbox for a recovery link.')
    if (res.isError) console.error(res.message)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" placeholder="Email" required />
      <button type="submit">Send recovery email</button>
    </form>
  )
}

// Step 2 — submit the code + new password
export function RecoverPasswordForm({ code }: { code: string }) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const res = await appAuthClient.recoverPassword({
      code,
      password: formData.get('password') as string,
    })
    if (res.isSuccess) alert('Password updated! You can now sign in.')
    if (res.isError) console.error(res.message)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="password" type="password" placeholder="New password" required />
      <button type="submit">Update password</button>
    </form>
  )
}
```

> **Note:** The forgot password flow requires Payload's [email adapter](https://payloadcms.com/docs/email/overview) to be configured in your Payload config so the plugin can dispatch the recovery email. See [PasswordProvider](./providers/password.md) for a starter email template.

---

## 6. Session & Sign-out

### 6.1. Server-side Session

Read the session in Server Components or Route Handlers by forwarding the request headers:

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

  const user = session.data as { email: string }

  return <p>Welcome, {user.email}</p>
}
```

### 6.2. Client-side Session

Use `getClientSession()` in Client Components or in a custom hook:

```ts
// src/hooks/useSession.ts
'use client'
import { useEffect, useState } from 'react'
import { appAuthClient } from '@/lib/auth'

export function useSession() {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<{
    data: Record<string, unknown>
    message: string
    isSuccess: boolean
  }>({ data: {}, message: '', isSuccess: false })

  useEffect(() => {
    appAuthClient.getClientSession().then((result) => {
      setSession({
        data: (result.data as Record<string, unknown>) ?? {},
        message: result.message,
        isSuccess: result.isSuccess,
      })
      setLoading(false)
    })
  }, [])

  return { loading, ...session }
}
```

```tsx
// src/app/profile/page.client.tsx
'use client'
import { useSession } from '@/hooks/useSession'

export function ProfilePage() {
  const { loading, isSuccess, data } = useSession()

  if (loading) return <p>Loading…</p>
  if (!isSuccess) return <p>Not signed in.</p>

  return <p>Hello, {(data as any).email}</p>
}
```

### 6.3. Sign out

```tsx
'use client'
import { appAuthClient } from '@/lib/auth'

export function SignOutButton() {
  const handleSignOut = async () => {
    await appAuthClient.signout({ returnTo: '/auth/signin' })
  }

  return <button onClick={handleSignOut}>Sign out</button>
}
```

The `returnTo` path is where the user is redirected after the session cookie is cleared. It is optional; if omitted, the plugin redirects to the `errorRedirectPath` configured in the plugin options.

---

## 7. Multi-app Setup

You can register `authPlugin` **multiple times** — once per application that needs its own isolated auth flow (e.g. the admin panel and a customer-facing storefront).

```ts
// payload.config.ts
plugins: [
  // Admin panel
  authPlugin({
    name: 'admin',
    useAdmin: true,
    usersCollectionSlug: Users.slug,
    accountsCollectionSlug: Accounts.slug,
    successRedirectPath: '/admin',
    errorRedirectPath: '/admin/login',
    providers: [GoogleAuthProvider({ ... })],
  }),

  // Customer storefront
  authPlugin({
    name: 'storefront',
    usersCollectionSlug: Customers.slug,
    accountsCollectionSlug: CustomerAccounts.slug,
    successRedirectPath: '/dashboard',
    errorRedirectPath: '/auth/signin',
    allowOAuthAutoSignUp: true,
    providers: [
      GoogleAuthProvider({ ... }),
      PasswordProvider({ ... }),
    ],
  }),
]
```

Each instance operates under its own `/api/{name}/` namespace and uses its own session cookie, so the two apps are completely isolated.

---

## Next Steps

- **[Configuration](./configuration.md)** — Full reference for every `authPlugin()` option.
- **[Collections](./collections.md)** — Deep-dive into `withUsersCollection` and `withAccountCollection`.
- **[Auth Client](./auth-client.md)** — Complete `AuthClient` API reference.
- **[Providers](./providers/README.md)** — Browse all supported providers.