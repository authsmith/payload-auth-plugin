# Session Management

> How `payload-auth-plugin` handles user sessions — creation, reading, refreshing, and termination.

Source: [`src/client/session.ts`](../src/client/session.ts) · [`src/client/refresh.ts`](../src/client/refresh.ts) · [`src/client/signout.ts`](../src/client/signout.ts)

---

## Table of Contents

- [Overview](#overview)
- [Session Cookie](#session-cookie)
- [Session Payload](#session-payload)
- [Reading Sessions](#reading-sessions)
  - [Server-side (Next.js App Router)](#server-side-nextjs-app-router)
  - [Server-side (Route Handler)](#server-side-route-handler)
  - [Client-side (React Hook)](#client-side-react-hook)
  - [Middleware (Next.js)](#middleware-nextjs)
- [Refreshing the Session](#refreshing-the-session)
- [Sign-out](#sign-out)
- [Protecting Routes](#protecting-routes)
  - [Server Components](#server-components)
  - [Next.js Middleware](#nextjs-middleware)
- [Multi-app Sessions](#multi-app-sessions)
- [Session Lifecycle Diagram](#session-lifecycle-diagram)

---

## Overview

`payload-auth-plugin` uses **Payload's native cookie-based session mechanism**. After a successful authentication event (OAuth callback, password sign-in, or passkey verification), the plugin issues a signed session cookie via Payload's own session utilities. No external session store (Redis, database session table, etc.) is required.

The session is:

- **Stateless** — encoded in the cookie itself (signed JWT-style)
- **HTTP-only** — not accessible via `document.cookie` in the browser
- **Scoped to a `name`** — each `authPlugin()` instance uses its own cookie, so multiple apps on the same domain don't interfere

---

## Session Cookie

| Property | Value |
|----------|-------|
| **Name** | Derived from the plugin `name` (e.g. `payload-token` for admin, or a namespaced variant) |
| **Type** | HTTP-only, signed |
| **Scope** | Set on the Payload server domain |
| **Lifetime** | Controlled by Payload's session configuration |

Because the cookie is HTTP-only, you can only read session data via the Payload API endpoint — either by forwarding headers server-side or by making a fetch request client-side (the browser attaches the cookie automatically).

---

## Session Payload

When a session is valid, `getSession()` and `getClientSession()` return an `AuthPluginOutput` where `data` contains the user document from the Users collection:

```ts
interface AuthPluginOutput {
  message: string
  kind: SuccessKind | ErrorKind
  data: unknown       // cast to your user shape
  isSuccess: boolean
  isError: boolean
}
```

The `data` field is the full user document (minus sensitive fields like `hashedPassword`). Cast it to your own user type:

```ts
type SessionUser = {
  id: string
  email: string
  first_name?: string
  last_name?: string
  role?: string
}

const session = await adminAuthClient.getSession({ headers: await headers() })

if (session.isSuccess) {
  const user = session.data as SessionUser
  console.log(user.email)
}
```

---

## Reading Sessions

### Server-side (Next.js App Router)

In **Server Components** or `page.tsx` / `layout.tsx` files, forward the incoming request headers using Next.js's `headers()` helper. The session cookie travels in those headers and is validated by Payload.

```ts
// src/app/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { adminAuthClient } from '@/lib/auth'

type User = { id: string; email: string; role: string }

export default async function DashboardPage() {
  const session = await adminAuthClient.getSession({
    headers: await headers(),
  })

  if (session.isError) {
    redirect('/admin/login')
  }

  const user = session.data as User

  return (
    <main>
      <h1>Welcome back, {user.email}</h1>
    </main>
  )
}
```

### Server-side (Route Handler)

In Next.js **Route Handlers** (`app/api/.../route.ts`), extract and forward the headers from the incoming `Request` object:

```ts
// src/app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { adminAuthClient } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await adminAuthClient.getSession({
    headers: request.headers,
  })

  if (session.isError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = session.data as { id: string; email: string }

  return NextResponse.json({ user })
}
```

### Client-side (React Hook)

In **Client Components**, use `getClientSession()`. The browser automatically attaches the session cookie to the request, so no headers need to be passed manually.

```ts
// src/hooks/useSession.ts
'use client'
import { useEffect, useState } from 'react'
import { appAuthClient } from '@/lib/auth'

type User = { id: string; email: string }

type SessionState = {
  loading: boolean
  isSuccess: boolean
  isError: boolean
  message: string
  user: User | null
}

export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({
    loading: true,
    isSuccess: false,
    isError: false,
    message: '',
    user: null,
  })

  useEffect(() => {
    appAuthClient.getClientSession().then((result) => {
      setState({
        loading: false,
        isSuccess: result.isSuccess,
        isError: result.isError,
        message: result.message,
        user: result.isSuccess ? (result.data as User) : null,
      })
    })
  }, [])

  return state
}
```

```tsx
// src/components/ProfileCard.tsx
'use client'
import { useSession } from '@/hooks/useSession'

export function ProfileCard() {
  const { loading, isSuccess, user } = useSession()

  if (loading) return <div>Loading…</div>
  if (!isSuccess || !user) return <div>Please sign in.</div>

  return (
    <div>
      <p>{user.email}</p>
    </div>
  )
}
```

### Middleware (Next.js)

You can check for an active session in Next.js **Middleware** to gate entire route segments. Because middleware runs on the Edge runtime and cannot use Node.js APIs, the check is done via a lightweight fetch to the session endpoint.

```ts
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'

const PAYLOAD_AUTH_URL = process.env.NEXT_PUBLIC_PAYLOAD_AUTH_URL!
const APP_NAME = 'app' // must match your authPlugin name

export async function middleware(request: NextRequest) {
  // Only protect /dashboard routes
  if (!request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.next()
  }

  try {
    const response = await fetch(`${PAYLOAD_AUTH_URL}/api/${APP_NAME}/session/user`, {
      headers: request.headers,
    })
    const session = await response.json()

    if (!session.isSuccess) {
      const signInUrl = new URL('/auth/signin', request.url)
      signInUrl.searchParams.set('returnTo', request.nextUrl.pathname)
      return NextResponse.redirect(signInUrl)
    }
  } catch {
    // If the session check fails (e.g. network error), redirect to sign-in
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
```

> **Note:** The fetch in middleware adds a small latency on every protected request. For performance-sensitive applications, consider using an edge-compatible JWT verification library to validate the session cookie directly without a network round-trip.

---

## Refreshing the Session

Call `refreshSession()` to extend the session's expiry without requiring the user to re-authenticate. This is useful for long-running dashboards or single-page apps.

Source: [`src/client/refresh.ts`](../src/client/refresh.ts)

```ts
async refreshSession(): Promise<AuthPluginOutput>
```

**Calls:** `GET /api/{name}/session/refresh`

**Example — automatic refresh every 10 minutes:**

```ts
// src/lib/sessionRefresh.ts
'use client'
import { appAuthClient } from '@/lib/auth'

let refreshInterval: ReturnType<typeof setInterval> | null = null

export function startSessionRefresh(onExpired: () => void) {
  stopSessionRefresh()

  refreshInterval = setInterval(async () => {
    const result = await appAuthClient.refreshSession()
    if (result.isError) {
      stopSessionRefresh()
      onExpired()
    }
  }, 10 * 60 * 1000) // every 10 minutes
}

export function stopSessionRefresh() {
  if (refreshInterval !== null) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}
```

```tsx
// src/components/SessionGuard.tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { startSessionRefresh, stopSessionRefresh } from '@/lib/sessionRefresh'

export function SessionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    startSessionRefresh(() => {
      router.push('/auth/signin')
    })
    return () => stopSessionRefresh()
  }, [router])

  return <>{children}</>
}
```

---

## Sign-out

Signing out clears the session cookie on the server and redirects the browser.

Source: [`src/client/signout.ts`](../src/client/signout.ts)

```ts
async signout(options?: { returnTo?: string }): Promise<AuthPluginOutput>
```

**Calls:** `GET /api/{name}/session/signout?returnTo={returnTo}`

| Option | Type | Description |
|--------|------|-------------|
| `returnTo` | `string` | Path to redirect to after the session is cleared. Defaults to the plugin's `errorRedirectPath`. |

> `signout()` must be called from a Client Component. It sets `window.location.href` after the server clears the cookie. Calling it server-side throws `WrongClientUsage`.

**Example:**

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

**Example — sign out with confirmation:**

```tsx
'use client'
import { useState } from 'react'
import { appAuthClient } from '@/lib/auth'

export function SignOutButton() {
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    await appAuthClient.signout({ returnTo: '/auth/signin' })
    // If the redirect didn't fire (unlikely), reset loading state
    setLoading(false)
  }

  return (
    <button onClick={handleSignOut} disabled={loading}>
      {loading ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
```

---

## Protecting Routes

### Server Components

The most straightforward pattern — check the session at the top of a Server Component and redirect if absent:

```ts
// src/app/(protected)/layout.tsx
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { appAuthClient } from '@/lib/auth'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await appAuthClient.getSession({
    headers: await headers(),
  })

  if (session.isError) {
    redirect('/auth/signin')
  }

  return <>{children}</>
}
```

By placing the check in a layout file, all routes under `(protected)/` are automatically guarded without repeating the check in each page.

### Next.js Middleware

For routes where you want the check to happen **before** the page renders (useful to avoid flash of unauthenticated content), use the [Middleware approach](#middleware-nextjs) described above.

---

## Multi-app Sessions

When multiple `authPlugin()` instances are registered (e.g. `name: 'admin'` and `name: 'storefront'`), each instance issues and reads its **own independent session cookie**. A user can be authenticated for one app but not the other.

```ts
// src/lib/auth.ts
import { AuthClient } from 'payload-auth-plugin/client'

export const adminAuthClient    = new AuthClient('admin')
export const storefrontAuthClient = new AuthClient('storefront')
```

```ts
// Check admin session
const adminSession = await adminAuthClient.getSession({ headers: await headers() })

// Check storefront session (completely independent)
const storefrontSession = await storefrontAuthClient.getSession({ headers: await headers() })
```

Sign-out is also scoped — calling `adminAuthClient.signout()` only clears the admin session cookie; the storefront session (if any) remains active.

---

## Session Lifecycle Diagram

```
  Browser                           Payload Server
     │                                   │
     │  1. User clicks "Sign in"         │
     │─────────────────────────────────► │
     │  GET /api/{name}/oauth/authorize  │
     │                                   │
     │  2. Redirect → Provider           │
     │ ◄──────────────────────────────── │
     │                                   │
     │  3. User authenticates at provider│
     │  (Google, GitHub, etc.)           │
     │                                   │
     │  4. Provider redirects back       │
     │─────────────────────────────────► │
     │  GET /api/{name}/oauth/callback   │
     │                                   │
     │  5. Plugin validates tokens       │
     │     Upserts Account + User docs   │
     │     Issues session cookie         │
     │ ◄──────────────────────────────── │
     │  302 → successRedirectPath        │
     │  Set-Cookie: session=<token>      │
     │                                   │
     │  6. Browser follows redirect      │
     │─────────────────────────────────► │
     │  GET /dashboard (with cookie)     │
     │                                   │
     │  7. Read session                  │
     │─────────────────────────────────► │
     │  GET /api/{name}/session/user     │
     │ ◄──────────────────────────────── │
     │  { isSuccess: true, data: user }  │
     │                                   │
     │  8. (Periodic) Refresh            │
     │─────────────────────────────────► │
     │  GET /api/{name}/session/refresh  │
     │ ◄──────────────────────────────── │
     │  { isSuccess: true }              │
     │  Set-Cookie: session=<new-token>  │
     │                                   │
     │  9. Sign out                      │
     │─────────────────────────────────► │
     │  GET /api/{name}/session/signout  │
     │ ◄──────────────────────────────── │
     │  302 → returnTo / errorRedirect   │
     │  Set-Cookie: session=; Max-Age=0  │
     │                                   │
```

---

## See Also

- [Auth Client API](./auth-client.md) — full method reference for `AuthClient`
- [Setup Guide](./setup.md) — end-to-end integration including session examples
- [Configuration](./configuration.md) — `successRedirectPath`, `errorRedirectPath`, `name` options