# Collections API Reference

> Helper functions for creating the Payload collections that `payload-auth-plugin` depends on.

Source: [`src/collection/index.ts`](../src/collection/index.ts) · [`src/collection/hooks.ts`](../src/collection/hooks.ts)

---

## Table of Contents

- [Overview](#overview)
- [`withUsersCollection`](#withuserscollection)
  - [Signature](#signature)
  - [Injected Fields](#injected-fields)
  - [Default Access Rules](#default-access-rules)
  - [Usage](#usage)
- [`withAccountCollection`](#withaccountcollection)
  - [Signature](#signature-1)
  - [Injected Fields](#injected-fields-1)
  - [Default Access Rules](#default-access-rules-1)
  - [Usage](#usage-1)
- [`deleteLinkedAccounts` Hook](#deletelinkedaccounts-hook)
  - [Signature](#signature-2)
  - [Usage](#usage-2)
- [Relationship Diagram](#relationship-diagram)
- [Custom Fields & Access Override](#custom-fields--access-override)

---

## Overview

The plugin does **not** create its own collections automatically. Instead it provides two higher-order functions — `withUsersCollection` and `withAccountCollection` — that augment your own `CollectionConfig` objects with the fields and access rules the plugin needs.

This approach gives you full control:

- Add any extra fields you need alongside the plugin's base fields.
- Override the default access rules per collection.
- Use your own collection slugs.

Both functions are exported from the `payload-auth-plugin/collection` sub-path:

```ts
import { withUsersCollection, withAccountCollection } from 'payload-auth-plugin/collection'
```

---

## `withUsersCollection`

Wraps a base `CollectionConfig` and injects authentication fields required by the plugin. The resulting collection is **not** a Payload `auth` collection — the plugin manages credentials itself.

### Signature

```ts
function withUsersCollection(
  incomingCollection: Omit<CollectionConfig, 'fields'> & {
    fields?: Field[]
  },
): CollectionConfig
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `incomingCollection` | `CollectionConfig` (without `fields` required) | Your base collection config including `slug`, optional `fields`, `hooks`, `access`, `admin`, etc. |

**Returns** a fully resolved `CollectionConfig` with all plugin fields merged in.

> **Important:** Do **not** set `auth: true` on the config you pass in. The plugin provides its own credential storage fields which conflict with Payload's built-in auth collection fields.

### Injected Fields

These fields are appended to the `fields` array you provide:

| Field Name | Payload Type | Unique | Description |
|------------|-------------|--------|-------------|
| `hashedPassword` | `text` | Yes | PBKDF2-hashed password (password auth only) |
| `hashSalt` | `text` | Yes | Random salt used during hashing |
| `hashIterations` | `number` | No | Number of hash iterations |
| `verificationCode` | `text` | Yes | One-time code for email verification / password recovery |
| `verificationHash` | `text` | No | Hash of the verification code |
| `verificationTokenExpire` | `number` | No | Unix timestamp when the verification token expires |
| `verificationKind` | `text` | No | Purpose of the current verification token (e.g. `forgotPassword`) |
| `claims` | `json` | No | Arbitrary JSON claims attached to the user (e.g. roles, plan) |
| `email` | `email` | Yes | Added automatically **only** if you haven't included an `email`-type field in your own `fields` array |

### Default Access Rules

The wrapper applies the following default access configuration. You can override any of these by providing an `access` key in your `incomingCollection`:

```ts
access: {
  admin:  ({ req: { user } }) => Boolean(user),
  create: ({ req: { user } }) => Boolean(user),
  delete: ({ req: { user } }) => Boolean(user),
  read:   ({ req: { user } }) => Boolean(user),
  update: ({ req: { user } }) => Boolean(user),
}
```

### Usage

**Minimal setup:**

```ts
// src/collections/Users.ts
import type { CollectionConfig } from 'payload'
import { withUsersCollection } from 'payload-auth-plugin/collection'

export const Users: CollectionConfig = withUsersCollection({
  slug: 'users',
})
```

**With custom fields:**

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
      name: 'email',          // If you include an email-type field, the plugin won't add a duplicate
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
    {
      name: 'role',
      type: 'select',
      options: ['admin', 'editor', 'viewer'],
      defaultValue: 'viewer',
    },
  ],
  timestamps: true,
})
```

**With custom access rules (override defaults):**

```ts
export const Users: CollectionConfig = withUsersCollection({
  slug: 'users',
  fields: [ /* ... */ ],
  access: {
    // Allow public reads (e.g. for public profiles)
    read: () => true,
    // Only admins can create users directly
    create: ({ req: { user } }) => user?.role === 'admin',
    // Keep other defaults by not specifying them here
    // (defaults from withUsersCollection are merged with spread — your keys win)
  },
})
```

---

## `withAccountCollection`

Wraps a base `CollectionConfig` and injects fields needed to store provider-specific account data, including a required `relationship` field that links each account to a user.

### Signature

```ts
function withAccountCollection(
  incomingCollection: Omit<CollectionConfig, 'fields'> & {
    fields?: Field[]
  },
  usersCollectionSlug: string,
): CollectionConfig
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `incomingCollection` | `CollectionConfig` (without `fields` required) | Your base collection config. |
| `usersCollectionSlug` | `string` | The slug of the Users collection. Used to define the `relationship` field. |

**Returns** a fully resolved `CollectionConfig`.

### Injected Fields

These fields are **prepended** to the `fields` array you provide (plugin fields come first):

| Field Name | Payload Type | Required | Description |
|------------|-------------|----------|-------------|
| `name` | `text` | No | Display name as returned by the provider |
| `picture` | `text` | No | Avatar URL from the provider |
| `user` | `relationship` | Yes | Reference to the Users collection (`hasMany: false`) |
| `issuerName` | `text` | Yes | Provider slug (e.g. `google`, `github`, `password`, `Passkey`) |
| `scope` | `text` | No | OAuth scopes granted (space-separated string) |
| `sub` | `text` | Yes | Provider's unique subject identifier (the user's ID at the provider) |
| `access_token` | `text` | No | OAuth access token (stored for server-side API calls) |
| `refresh_token` | `text` | No | OAuth refresh token |
| `expires_in` | `number` | No | Token lifetime in seconds |
| `passkey` | `group` | No | Passkey credential group (only shown when `issuerName === 'Passkey'`) |

**Passkey group sub-fields** (`passkey.*`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `credentialId` | `text` | Yes | Passkey credential identifier |
| `publicKey` | `json` | Yes | Serialised public key (`Uint8Array`) |
| `counter` | `number` | Yes | Authenticator signature counter |
| `transports` | `json` | Yes | Allowed transports (e.g. `["internal", "usb"]`) |
| `deviceType` | `text` | Yes | `singleDevice` or `multiDevice` |
| `backedUp` | `checkbox` | Yes | Whether the passkey is backed up to the cloud |

### Default Access Rules

```ts
access: {
  admin:  ({ req: { user } }) => Boolean(user),
  read:   ({ req: { user } }) => Boolean(user),
  create: () => false,   // accounts are created by the plugin internals only
  update: () => false,   // accounts are updated by the plugin internals only
  delete: () => true,
}
```

> The `create` and `update` rules are intentionally locked down — accounts should only be created or modified through the plugin's own auth flows, not via direct Payload API calls.

### Usage

**Standard setup:**

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

**With extra custom fields:**

```ts
export const Accounts: CollectionConfig = withAccountCollection(
  {
    slug: 'accounts',
    admin: {
      defaultColumns: ['issuerName', 'user', 'createdAt'],
      useAsTitle: 'issuerName',
    },
    fields: [
      // Your extra fields are appended after the plugin's base fields
      {
        name: 'lastSignedInAt',
        type: 'date',
        label: 'Last Signed In',
      },
    ],
  },
  Users.slug,
)
```

---

## `deleteLinkedAccounts` Hook

A Payload `CollectionAfterDeleteHook` factory that deletes all Account documents belonging to a User when that User is deleted. This prevents orphaned account records in the Accounts collection.

Source: [`src/collection/hooks.ts`](../src/collection/hooks.ts)

### Signature

```ts
function deleteLinkedAccounts(
  accountsSlug: string,
): CollectionAfterDeleteHook
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `accountsSlug` | `string` | The slug of the Accounts collection to delete from. |

**Returns** a `CollectionAfterDeleteHook` that can be added to the Users collection's `hooks.afterDelete` array.

### Usage

```ts
// src/collections/Users.ts
import type { CollectionConfig } from 'payload'
import { withUsersCollection } from 'payload-auth-plugin/collection'
import { deleteLinkedAccounts } from 'payload-auth-plugin/collection/hooks'
import { Accounts } from './Accounts'

export const Users: CollectionConfig = withUsersCollection({
  slug: 'users',
  fields: [
    // ... your fields
  ],
  hooks: {
    afterDelete: [
      deleteLinkedAccounts(Accounts.slug),
      // You can add more afterDelete hooks here
    ],
  },
})
```

When a User document is deleted (via the Payload admin UI or API), the hook runs `payload.delete({ collection: accountsSlug, where: { user: { equals: userId } } })` to cascade the deletion.

---

## Relationship Diagram

```
┌─────────────────────────────┐
│          Users              │
│  slug: 'users'              │
│                             │
│  id          (string)       │
│  email       (email)        │
│  first_name  (text)         │
│  last_name   (text)         │
│  hashedPassword (text)  ─── plugin fields
│  claims      (json)     ─── plugin fields
│  ...                        │
└──────────────┬──────────────┘
               │ 1
               │
               │ has many
               ▼
┌─────────────────────────────┐
│         Accounts            │
│  slug: 'accounts'           │
│                             │
│  id          (string)       │
│  user        (relationship) │──► Users
│  issuerName  (text)         │  e.g. 'google', 'github'
│  sub         (text)         │  provider user ID
│  access_token (text)        │
│  refresh_token (text)       │
│  passkey     (group)    ─── passkey accounts only
│  ...                        │
└─────────────────────────────┘
```

- One **User** → many **Accounts** (one per provider)
- One **Account** → exactly one **User**

---

## Custom Fields & Access Override

Both `withUsersCollection` and `withAccountCollection` use a **merge-then-override** pattern:

1. Plugin base fields are merged with your fields (users: appended after yours; accounts: prepended before yours).
2. Plugin default `access` rules are applied first, then your `access` keys **overwrite** the corresponding defaults.
3. Plugin default `admin` config is applied first, then your `admin` keys overwrite them.
4. `timestamps: true` is always set on both collections.

This means you only need to specify the keys you want to change — everything else falls back to the plugin's sensible defaults.

```ts
// Only override what you need
export const Users: CollectionConfig = withUsersCollection({
  slug: 'users',
  fields: [{ name: 'role', type: 'text' }],
  access: {
    read: () => true,          // override: allow public reads
    // create / delete / update → remain as plugin defaults
  },
  admin: {
    useAsTitle: 'email',       // override: display email in the admin list title
    // defaultColumns → remains as plugin default (['name', 'email'])
  },
})
```

---

## See Also

- [Setup Guide](./setup.md) — how to wire up the collections in a real project
- [Configuration](./configuration.md) — `usersCollectionSlug` and `accountsCollectionSlug` options
- [Auth Client](./auth-client.md) — browser-side API for interacting with auth flows