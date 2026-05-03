---
title: "Payload Auth Plugin Setup"
description: "Payload CMS Auth plugin setup"
seo:
  title: "Payload Auth Plugin Setup"
  description: "Payload CMS Auth plugin setup"
---

# Plugin Setup

> TIP: Checkout the example [project](https://github.com/authsmith/payload-auth-plugin/tree/main/examples/with-website) to learn more about the setup and usage pattern

<br/>
<br/>

The steps below outline how to set up the plugin for admin authentication.

<br/>

## 1. Environment Variables

Create a `.env` file in the root of your project and add the following environment variables:

<br/>

```txt [.env]
PAYLOAD_SECRET=
NEXT_PUBLIC_SERVER_URL=

PAYLOAD_AUTH_SECRET=
NEXT_PUBLIC_PAYLOAD_AUTH_URL=
```

> **_TIP_:** To generate secrets you can run `openssl rand -base64 32` command in your terminal to generate unique random base64 string.


<br/>
<br/>

## 2. Collection

#### 2.1. Users Collection

Use the `withUsersCollection` function imported from the package. This function accepts a `CollectionConfig` object as its argument. While it's not mandatory to create the users collection using this function, if you do, make sure not to set auth: true, as the function adds custom authentication fields that may conflict with Payload's built-in authentication system.

<br/>

```ts [src/collections/Auth/Users.ts]
import { CollectionConfig } from "payload";
import { withUsersCollection } from "payload-auth-plugin/collection";

export const Users: CollectionConfig = withUsersCollection(
  {
    slug: "users",
    admin: {
      defaultColumns: ['fullName', 'email'],
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
        name: 'last_name',
        label: 'Last Name',
        type: 'text',
      },
      {
        name: 'first_name',
        label: 'First Name',
        type: 'text',
      },
    ],
    timestamps: true,
  }
);
```

<br/>
<br/>

#### 2.2. Accounts Collection

Use the `withAccountCollection` function imported from the plugin. This function takes the `CollectionConfig` and Users collection slug as arguments.

<br/>

```ts [src/collections/Auth/Accounts.ts]
import { CollectionConfig } from "payload";
import { withAccountCollection } from 'payload-auth-plugin/collection'
import { Users } from "@/collections/Auth/Users";

export const Accounts: CollectionConfig = withAccountCollection(
  {
    slug: "accounts",
  },
  Users.slug
);
```

<br/>
<br/>

#### 2.3. Hook

The `deleteLinkedAccounts` hook can be used to delete all accounts that belongs to an user when a user is being removed.

<br/>

```ts [src/collections/Auth/Users.ts]
import { CollectionConfig } from "payload";
import { withUsersCollection } from 'payload-auth-plugin/collection'
import { deleteLinkedAccounts } from 'payload-auth-plugin/collection/hooks'
import { Accounts } from '@/collections/Auth/Accounts'

export const Users: CollectionConfig = withUsersCollection(
  {
    //---rest of the config---
    hooks: {
        afterDelete: [deleteLinkedAccounts(Accounts.slug)],
    },
  },
);
```

<br/>
<br/>


## 3. Plugin Setup

In the Payload CMS config file, import the Payload Auth plugin, and add it to the plugins array:

<br/>

```ts [src/payload.config.ts]
import { buildConfig } from "payload/config";
import { authPlugin } from 'payload-auth-plugin'
import {
  Auth0AuthProvider,
  GoogleAuthProvider,
  PasswordProvider,
} from 'payload-auth-plugin/providers'
import { Accounts } from '@/collections/Auth/Accounts'
import { Users } from '@/collections/Auth/Users'

export default buildConfig({
  // --- rest of the config
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL,
  collections: [
    // --- rest of the collections
      Accounts,
      Users,
    ],
  plugins: [
    // --- rest of the plugins
    authPlugin({
      name: 'admin', // must be unique
      useAdmin: true, // not mandatory, and only use this for admin
      allowOAuthAutoSignUp: true,
      usersCollectionSlug: Users.slug,
      accountsCollectionSlug: Accounts.slug,
      successRedirectPath: '/admin/collections',
      errorRedirectPath: '/admin/auth/signin',
      providers: [
        GoogleAuthProvider({
          client_id: process.env.GOOGLE_CLIENT_ID as string,
          client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
        Auth0AuthProvider({
          domain: process.env.AUTH0_DOMAIN as string,
          client_id: process.env.AUTH0_CLIENT_ID as string,
          client_secret: process.env.AUTH0_CLIENT_SECRET as string,
        }),
      ],
    }),
  ],
});
```

<br/>
<br/>

## 4. Admin Client Components

Create the auth client

<br/>

```ts [src/lib/auth.ts]
import { AuthClient } from 'payload-auth-plugin/client'

export const adminAuthClient = new AuthClient('admin')
```

<br/>

### Signin component

Create an auth component for the signin page.

<br/>

```tsx [src/components/AfterLogin/index.tsx]
'use client'
import React from 'react'
import { Button } from '@payloadcms/ui'
import './styles.scss'
import { adminAuthClient } from '@/lib/auth'

export const AdminLogin = () => {
  const { oauth } = adminAuthClient.signin()

  const handleGoogleSignin = async () => {
    oauth('google')
  }
  const handleAuth0Signin = async () => {
    oauth('auth0')
  }
  return (
    <div className="oauth-container">
      <Button type="button" onClick={handleGoogleSignin} className="oauth-btn">
        Signin with Google
      </Button>
      <Button type="button" onClick={handleAuth0Signin} className="oauth-btn">
        Signin with Auth0
      </Button>
    </div>
  )
}
```
<br />

Add some styles

<br />

```scss [src/components/AfterLogin/styles.scss]
@import '~@payloadcms/ui/scss';

.oauth-container {
  display: flex;
  width: 100%;
  flex-direction: column;
  column-gap: 4px;
}
.oauth-btn {
  padding-block: 8px;
  width: 100%;
}
```

Finally, import the custom login component in your Payload config.

<br/>

```ts [src/payload.config.ts] {5-7}
export default buildConfig({
  // --- rest of the config
  admin: {
    // --- rest of the admin config
    components: {
      afterLogin: ['@/components/AfterLogin/index#AdminLogin'],
    },
  },
});
```
<br/>

Now, go to `/admin/login` path to test the custom login component.

<br/>

Follow this example [project](https://github.com/authsmith/payload-auth-plugin/tree/main/examples/with-website) to setup and use the plugin for both the front-end app and the admin app.

<br/>
<br/>

## Session and signout

### Server side session

Use the auth client to get user's session in the server side. It is required to pass request headers as an argument

<br/>

```ts [src/app/(frontend)/[slug]/page.tsx]
import { adminAuthClient } from '@/lib/auth';
import { headers } from 'next/headers'

const session = await adminAuthClient.getSession(
  { 
    headers: await headers()
  }
)

if (session.isError) {
  redirect('/auth/signin')
}
```

<br/>

### Client side session

Use auth client to create a hook to get user's session in the client side.


```ts [src/hooks/session.ts]
import { adminAuthClient } from '@/lib/auth'
import { useEffect, useState } from 'react'

export const useSession = () => {
  const [loading, setLoading] = useState<boolean>()
  const [session, setSession] = useState({
    data: {},
    message: '',
    isSuccess: false,
  })

  useEffect(() => {
    setLoading(true)
    const fetchSession = async () => {
      const { data, isSuccess, message } = await adminAuthClient.getClientSession()

      if (!isSuccess) {
        setSession({
          data: {},
          message,
          isSuccess,
        })
      }

      setSession({
        data,
        message,
        isSuccess,
      })
      setLoading(false)
    }
    fetchSession()
  }, [])

  return {
    loading,
    ...session,
  }
}
```

<br/>

```ts [src/app/(frontend)/[slug]/page.client.tsx]
"use client";

import { useSession } from '@/hooks/session'

const { isSuccess, loading, data } = useSession()
```

<br/>

### Signout

Use the auth client for signout

<br/>

```ts [src/app/(frontend)/[slug]/page.client.tsx]
import { adminAuthClient } from '@/lib/auth';

const handleSignOut = async () => {
  await adminAuthClient.signout({ returnTo: '/auth/signin' })
}
```

<br/>
<br/>
<br/>

::div{ .flex .items-center .justify-between}
[&laquo; Installation](/docs/plugins/payload/installation)

[Configuration &raquo;](/docs/plugins/payload/configuration)

::
