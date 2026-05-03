# Password Auth Provider

> Email and password authentication with sign-up, sign-in, forgot-password, and account recovery flows.

Source: [`src/providers/password.ts`](../../src/providers/password.ts)

---

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Sign Up](#sign-up)
  - [Sign In](#sign-in)
  - [Forgot Password](#forgot-password)
  - [Recover Password](#recover-password)
- [Email Templates](#email-templates)
  - [Forgot Password Template](#forgot-password-template)
- [Parameters Reference](#parameters-reference)
- [Endpoints](#endpoints)
- [Returns](#returns)

---

## Overview

`PasswordProvider` enables classic email + password authentication within your Payload app. It handles:

- **Sign-up** — creates a new User document and optionally signs the user in immediately
- **Sign-in** — validates credentials and issues a session cookie
- **Forgot password** — sends a one-time recovery code to the user's email address
- **Recover password** — accepts the recovery code and sets a new password
- **Reset password** — directly resets a password when you already know both the email and the new value

Unlike OAuth providers, `PasswordProvider` stores credentials (hashed with PBKDF2) directly in the Users collection via the fields injected by `withUsersCollection`.

**Protocol:** Credential-based
**Provider ID:** `password`

---

## Prerequisites

### Email Adapter (required for forgot-password)

The forgot-password flow dispatches a recovery email to the user. Payload's [email adapter](https://payloadcms.com/docs/email/overview) must be configured in your Payload config for this to work.

```ts
// payload.config.ts
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import nodemailer from 'nodemailer'

export default buildConfig({
  email: nodemailerAdapter({
    defaultFromAddress: 'no-reply@myapp.com',
    defaultFromName: 'My App',
    transport: nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    }),
  }),
  // ...
})
```

> Sign-up and sign-in work without the email adapter. Only the forgot-password flow requires it. If `PasswordProvider` is registered and no email adapter is configured, the plugin throws a `MissingEmailAdapter` error at startup.

---

## Configuration

```ts
// payload.config.ts
import { buildConfig } from 'payload'
import { authPlugin } from 'payload-auth-plugin'
import { PasswordProvider } from 'payload-auth-plugin/providers'
import { renderForgotPasswordEmail } from './emails/forgotPassword'

export default buildConfig({
  plugins: [
    authPlugin({
      name: 'app',
      usersCollectionSlug: 'users',
      accountsCollectionSlug: 'accounts',
      successRedirectPath: '/dashboard',
      errorRedirectPath: '/auth/signin',
      providers: [
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

## Usage

Create the `AuthClient` instance for your app:

```ts
// src/lib/auth.ts
import { AuthClient } from 'payload-auth-plugin/client'

export const appAuthClient = new AuthClient('app')
```

All password-related methods are available on this client. See the [Auth Client API](../auth-client.md) for the full reference.

---

### Sign Up

```tsx
// src/app/auth/signup/page.tsx
'use client'
import { appAuthClient } from '@/lib/auth'

export default function SignUpPage() {
  const { password } = appAuthClient.register()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)

    const result = await password({
      email: data.get('email') as string,
      password: data.get('password') as string,
      // allowAutoSignin: true signs the user in immediately after registration
      allowAutoSignin: true,
      // userInfo sets additional fields on the created User document
      userInfo: {
        first_name: data.get('first_name'),
        last_name: data.get('last_name'),
      },
    })

    if (result.isError) {
      console.error(result.message)
      // result.kind === 'Conflict' means the email is already registered
    }
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

**`PasswordSignupPayload` fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | Yes | The new user's email address. Must be unique. |
| `password` | `string` | Yes | The plaintext password. Hashed server-side with PBKDF2 before storage. |
| `allowAutoSignin` | `boolean` | No | If `true`, a session cookie is issued immediately after registration. Defaults to `false`. |
| `userInfo` | `Record<string, unknown>` | No | Extra fields to write to the User document on creation (e.g. `first_name`, `last_name`). Keys must match fields defined on your Users collection. |

**Possible error kinds:**

| Kind | Meaning |
|------|---------|
| `Conflict` | A user with this email already exists |
| `BadRequest` | Missing or invalid payload |
| `InternalServer` | Unexpected server error |

---

### Sign In

```tsx
// src/app/auth/signin/page.tsx
'use client'
import { appAuthClient } from '@/lib/auth'

export default function SignInPage() {
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
      // result.kind === 'NotAuthenticated' means wrong email or password
    }
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

**`PasswordSigninPayload` fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | Yes | The user's email address. |
| `password` | `string` | Yes | The user's plaintext password. |

**Possible error kinds:**

| Kind | Meaning |
|------|---------|
| `NotAuthenticated` | Invalid email or password |
| `NotFound` | No account found with that email |
| `BadRequest` | Missing or invalid payload |

---

### Forgot Password

> Requires the Payload email adapter to be configured.

This is a two-step flow:

1. **Step 1** — user submits their email; the plugin generates a one-time verification code and emails it to them.
2. **Step 2** — user submits the code and their new password; the plugin validates the code and updates the password.

**Step 1 — request a recovery code:**

```tsx
// src/app/auth/forgot-password/page.tsx
'use client'
import { useState } from 'react'
import { appAuthClient } from '@/lib/auth'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)

    const result = await appAuthClient.forgotPassword({
      email: data.get('email') as string,
    })

    if (result.isSuccess) {
      setSent(true)
    }
    if (result.isError) {
      console.error(result.message)
    }
  }

  if (sent) {
    return <p>Check your inbox — we've sent you a recovery link.</p>
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" placeholder="Your email address" required />
      <button type="submit">Send recovery email</button>
    </form>
  )
}
```

**Step 2 — submit the code and new password:**

The verification code is typically included in the recovery email as a query parameter (e.g. `?code=abc123`). Read it from the URL and pass it to `recoverPassword`.

```tsx
// src/app/auth/recover-password/page.tsx
'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { appAuthClient } from '@/lib/auth'

export default function RecoverPasswordPage() {
  const params = useSearchParams()
  const code = params.get('code') ?? ''
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)

    const result = await appAuthClient.recoverPassword({
      code,
      password: data.get('password') as string,
    })

    if (result.isSuccess) {
      router.push('/auth/signin')
    }
    if (result.isError) {
      console.error(result.message)
      // result.kind === 'BadRequest' means the code is invalid or expired
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="password" type="password" placeholder="New password" required />
      <button type="submit">Update password</button>
    </form>
  )
}
```

**`ForgotPasswordPayload` fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | Yes | The email address associated with the account. |

**`PasswordRecoverPayload` fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | `string` | Yes | The one-time verification code from the recovery email. |
| `password` | `string` | Yes | The new plaintext password to set. |

---

## Email Templates

### Forgot Password Template

The `emailTemplates.forgotPassword` function is called by the plugin when the forgot-password flow is initiated. It receives a context object and must return a value that your Payload email adapter can send (typically an HTML string or a React Email component).

```ts
type ForgotPasswordEmailContext = {
  verificationCode: string
  verificationLink: string  // pre-built link including the code as a query param
  user: {
    email: string
    [key: string]: unknown
  }
}
```

**Example using React Email:**

```tsx
// src/emails/forgotPassword.tsx
import {
  Html, Body, Container, Heading, Text, Button, Preview
} from '@react-email/components'

interface ForgotPasswordEmailProps {
  verificationCode: string
  verificationLink: string
  user: { email: string }
}

export function ForgotPasswordEmail({
  verificationCode,
  verificationLink,
  user,
}: ForgotPasswordEmailProps) {
  return (
    <Html>
      <Preview>Reset your password</Preview>
      <Body style={{ fontFamily: 'sans-serif' }}>
        <Container>
          <Heading>Reset your password</Heading>
          <Text>Hi {user.email},</Text>
          <Text>
            Click the button below to reset your password. This link expires in 1 hour.
          </Text>
          <Button href={verificationLink}>
            Reset Password
          </Button>
          <Text style={{ color: '#666', fontSize: '14px' }}>
            Or copy this code: <strong>{verificationCode}</strong>
          </Text>
          <Text style={{ color: '#666', fontSize: '12px' }}>
            If you didn't request a password reset, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

// Export a render function for use in PasswordProvider
export async function renderForgotPasswordEmail(context: ForgotPasswordEmailProps) {
  const { render } = await import('@react-email/render')
  return render(<ForgotPasswordEmail {...context} />)
}
```

Pass the render function to `PasswordProvider`:

```ts
import { renderForgotPasswordEmail } from './emails/forgotPassword'

PasswordProvider({
  emailTemplates: {
    forgotPassword: renderForgotPasswordEmail,
  },
})
```

> A complete example email template is available in the [example project](https://github.com/authsmith/payload-auth-plugin/tree/main/examples/with-website/src/templates/forgot-password.tsx).

---

## Parameters Reference

`PasswordProvider` accepts a single config object:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `emailTemplates` | `object` | Yes | Object containing email template functions. |
| `emailTemplates.forgotPassword` | `function` | Yes | Called when the forgot-password flow is initiated. Receives a context object (see [Email Templates](#email-templates)) and must return the email content in a format your Payload email adapter accepts. |

---

## Endpoints

`PasswordProvider` registers the following endpoints under `/api/{name}/`:

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/{name}/auth/signup` | Create a new user account |
| `POST` | `/api/{name}/auth/signin` | Sign in with email and password |
| `POST` | `/api/{name}/auth/forgot-password?stage=init` | Request a password recovery code via email |
| `POST` | `/api/{name}/auth/forgot-password?stage=verify` | Verify the recovery code and set a new password |
| `POST` | `/api/{name}/auth/reset-password` | Reset a password directly (no code required) |

Where `{name}` is the `name` you passed to `authPlugin()`.

---

## Returns

`PasswordProvider` returns a `PasswordProviderConfig` object:

```ts
{
  id: 'password',
  kind: 'password',
  emailTemplates: {
    forgotPassword: renderForgotPasswordEmail,
  },
}
```

Source: [`src/types.ts`](../../src/types.ts)

---

## See Also

- [Providers Overview](./README.md) — all supported providers
- [Auth Client API](../auth-client.md) — full reference for `signin()`, `register()`, `forgotPassword()`, `recoverPassword()`, `resetPassword()`
- [Session Management](../session-management.md) — reading and refreshing sessions after sign-in
- [Collections](../collections.md) — `withUsersCollection` fields used for credential storage
- [Configuration](../configuration.md) — full `authPlugin()` options