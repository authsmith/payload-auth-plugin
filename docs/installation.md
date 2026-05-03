# Installation

> Install `payload-auth-plugin` into your existing Payload CMS (>= 3.0) project.

---

## Table of Contents

- [Requirements](#requirements)
- [Install the Package](#install-the-package)
- [Environment Variables](#environment-variables)
- [Next Steps](#next-steps)

---

## Requirements

| Dependency | Version |
|------------|---------|
| [Payload CMS](https://payloadcms.com) | `>= 3.0.0` |
| Node.js | `>= 18` |

The plugin is framework-agnostic and works with any Payload setup (Next.js App Router, standalone, etc.).

---

## Install the Package

Choose your package manager:

**npm**
```sh
npm install payload-auth-plugin
```

**yarn**
```sh
yarn add payload-auth-plugin
```

**pnpm**
```sh
pnpm add payload-auth-plugin
```

**bun**
```sh
bun add payload-auth-plugin
```

---

## Environment Variables

Add the following variables to your `.env` file. They are required by the plugin at runtime.

```sh
# Your Payload CMS secret — used to sign tokens and sessions
PAYLOAD_SECRET=

# The public URL of your Payload server (no trailing slash)
# Used by the plugin to construct OAuth callback URLs
NEXT_PUBLIC_SERVER_URL=

# Secret used internally by the auth plugin for session signing
PAYLOAD_AUTH_SECRET=

# The base URL the AuthClient uses to reach your Payload API
# This must be accessible from the browser for client-side auth flows
NEXT_PUBLIC_PAYLOAD_AUTH_URL=
```

> **Tip:** Generate strong secrets with `openssl rand -base64 32`.

For each OAuth provider you intend to use, add its credentials as well. For example, for Google:

```sh
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Refer to the individual [provider guides](./providers/README.md) for the exact variable names each provider needs.

---

## Next Steps

- **[Setup](./setup.md)** — Configure collections, register the plugin, and build your sign-in UI.
- **[Configuration](./configuration.md)** — Explore all available `authPlugin()` options.
- **[Providers](./providers/README.md)** — Browse all supported OAuth / OIDC providers.