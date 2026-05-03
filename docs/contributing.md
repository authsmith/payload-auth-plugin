# Contributing Guide

> Thank you for your interest in contributing to `payload-auth-plugin`! This guide explains how to report issues, submit pull requests, and develop the plugin locally.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Reporting Issues](#reporting-issues)
- [Feature Requests](#feature-requests)
- [Development Setup](#development-setup)
  - [Prerequisites](#prerequisites)
  - [Clone & Install](#clone--install)
  - [Build the Plugin](#build-the-plugin)
  - [Test Locally in a Payload Project](#test-locally-in-a-payload-project)
- [Project Structure](#project-structure)
- [Submitting a Pull Request](#submitting-a-pull-request)
  - [Branch Naming](#branch-naming)
  - [Commit Message Format](#commit-message-format)
  - [PR Checklist](#pr-checklist)
- [Adding a New Provider](#adding-a-new-provider)
- [Versioning & Changelog](#versioning--changelog)
- [Questions & Help](#questions--help)

---

## Code of Conduct

Please be respectful and constructive in all interactions — issues, pull requests, and discussions. Contributions of all experience levels are welcome.

---

## Reporting Issues

Before opening a new issue:

1. **Search existing issues** (open and closed) to avoid duplicates.
2. **Reproduce the issue** with the latest published version of the plugin.

When you open a new issue, include:

- A **clear, descriptive title**.
- **Steps to reproduce** the issue.
- **Expected behaviour** vs. **actual behaviour**.
- **Environment details:**
  - `payload-auth-plugin` version
  - Payload CMS version
  - Node.js version
  - Framework (Next.js App Router, standalone, etc.)
- Any relevant **error messages, stack traces, or screenshots**.
- A **minimal reproduction** (link to a repository or a code snippet) if possible — this is the single most effective way to speed up resolution.

---

## Feature Requests

Open a GitHub issue with the `enhancement` label and include:

- The **purpose** of the feature — what problem does it solve?
- The **benefits** — who benefits and how?
- Your **motivation** — why is this important to you?
- If relevant, a **proposed API or implementation sketch**.

---

## Development Setup

### Prerequisites

| Tool | Version |
|------|---------|
| [Bun](https://bun.sh/) | >= 1.0 |
| Node.js | >= 18 |
| Git | any recent version |

The project uses **Bun** as the package manager and runtime for scripts. npm/yarn/pnpm are not used for development.

### Clone & Install

1. **Fork** the repository on GitHub.
2. **Clone** your fork:

   ```sh
   git clone https://github.com/<your-username>/payload-auth-plugin.git
   cd payload-auth-plugin
   ```

3. **Install dependencies:**

   ```sh
   bun install
   ```

### Build the Plugin

The plugin must be built before it can be tested locally. The build outputs compiled ESM and TypeScript declaration files to the `/dist` directory.

```sh
bun build
```

The build script is defined in [`script/build.ts`](../script/build.ts).

Re-run `bun build` after every change you want to test. The output in `/dist` is what gets published to npm, so testing against the built output is important to catch any build-time issues.

### Test Locally in a Payload Project

To test your changes against a real Payload CMS project:

1. Build the plugin (`bun build`).
2. In the Payload project, update the import to point to your local `/dist` directory:

   ```ts
   // payload.config.ts — during local testing only
   import { authPlugin } from '/path/to/payload-auth-plugin/dist/esm/index.js'
   import { GoogleAuthProvider } from '/path/to/payload-auth-plugin/dist/esm/providers/index.js'
   ```

   Or use a relative path if the projects are siblings:

   ```ts
   import { authPlugin } from '../../payload-auth-plugin/dist/esm/index.js'
   ```

3. Run the Payload project:

   ```sh
   pnpm dev
   ```

You can also look at the [example project](https://github.com/authsmith/payload-auth-plugin/tree/main/examples/with-website) as a reference for a complete working setup.

---

## Project Structure

```
payload-auth-plugin/
├── src/
│   ├── client/             # AuthClient and browser-side helpers
│   │   ├── index.ts        # AuthClient class
│   │   ├── oauth.ts        # OAuth redirect helper
│   │   ├── password.ts     # Password sign-in/sign-up/forgot-password
│   │   ├── refresh.ts      # Session refresh
│   │   ├── register.ts     # Registration entry point
│   │   ├── session.ts      # getSession / getClientSession
│   │   └── signout.ts      # Sign-out
│   ├── collection/         # Collection helper functions
│   │   ├── auto-generates/ # Auto-generated collections (e.g. APIKeys)
│   │   ├── hooks.ts        # deleteLinkedAccounts hook
│   │   └── index.ts        # withUsersCollection, withAccountCollection
│   ├── core/               # Plugin internals
│   │   ├── endpoints.ts    # EndpointsFactory + strategy classes
│   │   ├── errors/         # Error classes thrown at startup
│   │   ├── preflights/     # Config validation at startup
│   │   ├── protocols/      # OAuth / OIDC protocol handlers
│   │   ├── routeHandlers/  # Per-strategy HTTP request handlers
│   │   └── utils/          # Shared utilities (slug formatting, etc.)
│   ├── providers/          # Provider factory functions
│   │   ├── oauth2/         # Plain OAuth 2.0 providers
│   │   ├── oidc/           # OpenID Connect providers
│   │   ├── magiclink.ts    # Magic link provider (in progress)
│   │   ├── passkey.ts      # Passkey provider
│   │   ├── password.ts     # Password provider
│   │   ├── utils.ts        # Provider lookup helpers
│   │   └── index.ts        # Re-exports all providers
│   ├── constants.ts        # Shared constants
│   ├── index.ts            # Package root export (authPlugin)
│   ├── plugin.ts           # authPlugin() function and PluginOptions type
│   └── types.ts            # Shared TypeScript types
├── docs/                   # Documentation (Markdown)
├── examples/               # Example projects
│   └── with-website/       # Next.js + Payload example
├── script/
│   └── build.ts            # Build script
├── dist/                   # Compiled output (git-ignored, generated by `bun build`)
├── package.json
└── tsconfig.json
```

---

## Submitting a Pull Request

### Branch Naming

Create a new branch from `main` with a descriptive name:

| Type | Pattern | Example |
|------|---------|---------|
| New feature | `feat/<short-description>` | `feat/add-linkedin-provider` |
| Bug fix | `fix/<short-description>` | `fix/session-cookie-expiry` |
| Documentation | `docs/<short-description>` | `docs/update-cognito-guide` |
| Chore / refactor | `chore/<short-description>` | `chore/refactor-endpoint-factory` |

```sh
git checkout -b feat/add-linkedin-provider
```

### Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <short imperative description>

[optional body]

[optional footer — e.g. Closes #123]
```

**Types:**

| Type | Appears in changelog? | Description |
|------|-----------------------|-------------|
| `feat` | ✅ Yes | A new feature |
| `fix` | ✅ Yes | A bug fix |
| `docs` | ❌ No | Documentation changes only |
| `chore` | ❌ No | Refactoring, tests, tooling — no functional change |

**Examples:**

```
feat: add LinkedIn OIDC provider

Implements OAuth 2.0 sign-in via LinkedIn using the standard
authorization_server configuration pattern.

Closes #42
```

```
fix: prevent session cookie from being set on failed OAuth callback

Previously, if the provider returned an error during the callback,
the plugin would still attempt to create a session, causing a
misleading 'authenticated' state.

Closes #38
```

```
docs: add Twitch provider setup guide
```

### PR Checklist

Before submitting your PR, confirm:

- [ ] The branch is based on the latest `main`.
- [ ] `bun build` runs without errors.
- [ ] Any new public-facing functionality is documented (JSDoc on exported functions, and/or a Markdown doc in `docs/`).
- [ ] The PR title follows the commit message format (it becomes the squash-merge commit message).
- [ ] The PR description explains:
  - What change is being made
  - Why it is needed
  - How to test it
  - Any related issue numbers (`Closes #123`)
- [ ] If adding a new OAuth/OIDC provider, the [Adding a New Provider](#adding-a-new-provider) checklist is completed.

---

## Adding a New Provider

To add a new OAuth 2.0 or OIDC provider:

### 1. Create the provider file

Add a new file in either `src/providers/oauth2/` (for OAuth 2.0) or `src/providers/oidc/` (for OIDC). Use an existing provider as a template.

**OIDC example — `src/providers/oidc/myprovider.ts`:**

```ts
import type {
  AccountInfo,
  OIDCProviderConfig,
  OAuthBaseProviderConfig,
} from '../../types.js'

type MyProviderConfig = OAuthBaseProviderConfig

/**
 * Add MyProvider OIDC Provider
 *
 * #### Callback or Redirect URL pattern
 * ```
 * https://example.com/api/{name}/oauth/callback/myprovider
 * ```
 */
function MyProvider(config: MyProviderConfig): OIDCProviderConfig {
  const { overrideScope, ...restConfig } = config
  return {
    ...restConfig,
    id: 'myprovider',
    scope: overrideScope ?? 'email openid profile',
    issuer: 'https://accounts.myprovider.com',
    name: 'My Provider',
    algorithm: 'oidc',
    kind: 'oauth',
    profile: (profile): AccountInfo => ({
      sub: profile.sub as string,
      name: profile.name as string,
      email: profile.email as string,
      picture: profile.picture as string,
    }),
  }
}

export default MyProvider
```

**OAuth 2.0 example — `src/providers/oauth2/myprovider.ts`:**

```ts
import type * as oauth from 'oauth4webapi'
import type {
  OAuth2ProviderConfig,
  AccountInfo,
  OAuthBaseProviderConfig,
} from '../../types.js'

const authorization_server: oauth.AuthorizationServer = {
  issuer: 'https://myprovider.com',
  authorization_endpoint: 'https://myprovider.com/oauth/authorize',
  token_endpoint: 'https://myprovider.com/oauth/token',
  userinfo_endpoint: 'https://api.myprovider.com/v1/me',
}

type MyProviderConfig = OAuthBaseProviderConfig

function MyProvider(config: MyProviderConfig): OAuth2ProviderConfig {
  const { overrideScope, ...restConfig } = config
  return {
    ...restConfig,
    id: 'myprovider',
    scope: overrideScope ?? 'email profile',
    authorization_server,
    name: 'My Provider',
    algorithm: 'oauth2',
    kind: 'oauth',
    profile: (profile): AccountInfo => ({
      sub: profile.id as string,
      name: profile.name as string,
      email: profile.email as string,
      picture: profile.avatar_url as string,
    }),
  }
}

export default MyProvider
```

### 2. Export from the providers index

Add your provider to `src/providers/index.ts`:

```ts
import MyProvider from './oidc/myprovider.js'  // or ./oauth2/myprovider.js

export {
  // ... existing exports
  MyProvider,
}
```

### 3. Build and verify

```sh
bun build
```

Check that your provider is exported in `dist/esm/providers/index.js` and that `dist/types/providers/index.d.ts` includes the TypeScript declaration.

### 4. Write documentation

Add a documentation file at `docs/providers/myprovider.md`. Use any existing provider doc as a template. Include:

- Overview with protocol, callback ID, and default scope
- Step-by-step setup instructions in the provider's developer console
- Configuration code example
- Usage code example (client-side button)
- Parameters reference table
- Returns section showing the provider config shape

### 5. Update the providers index doc

Add a row for your provider in `docs/providers/README.md` (the OAuth/OIDC providers table and the Returns section).

---

## Versioning & Changelog

This project uses [Changesets](https://github.com/changesets/changesets) for versioning and changelog generation.

When your PR is merged, a maintainer will add a changeset if needed. You don't need to create one yourself unless you want to, in which case run:

```sh
bunx changeset
```

Follow the prompts to select the bump type (`major`, `minor`, or `patch`) and write a summary of the change.

The `CHANGELOG.md` is generated automatically from changesets when a new release is published.

---

## Questions & Help

- **GitHub Issues** — for bug reports and feature requests
- **GitHub Discussions** — for questions and general conversation (if enabled)
- **Pull Request comments** — for code review discussions

If you're unsure whether a change is appropriate before investing time in building it, open a GitHub issue or discussion first to get feedback.

We look forward to your contribution! 🎉