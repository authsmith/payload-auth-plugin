---
title: "Password Provider"
description: "Payload CMS auth plugin Password provider"
seo:
  title: "Password Provider"
  description: "Payload CMS auth plugin Password provider"
---

## Password Provider

Use password based authentication flow for sign-in and sign-ups.

<br/>
<br/>
<br/>

```ts [src/payload.config.ts]
import { buildConfig } from "payload/config";
import { authPlugin } from "payload-auth-plugin";
import { PasswordProvider } from "payload-auth-plugin/providers";

export default buildConfig({
  // --- rest of the config
  plugins: [
    // --- rest of the plugins
    authPlugin({
      // --- rest of the plugin configuration
      providers: [
        PasswordProvider({
          emailTemplates: {
            forgotPassword: renderForgotPasswordTemplate,
          }
        })
      ],
    }),
  ],
});
```

<br/>


### Args

- **emailTemplates**

**Type:** `{forgotPassword: any}` 

**Description:** takes email templates for the password provider to use

**Optional**: Yes

<br/>
<br/>

### Auth Client

```ts [src/lib/auth.ts]
import { AuthClient } from 'payload-auth-plugin/client'

export const appAuthClient = new AuthClient('app')
```

<br/>

### Signup

Use the auth client for signup

<br/>

```ts [src/app/(frontend)/auth/signup/page.tsx]
import { appAuthClient } from '@/lib/auth';

const { password } = appAuthClient.register()

const handleSignup = async (value: {
  email: string, 
  password: string, 
  first_name: string, 
  last_name: string
}) => {
    const res = await password({
      email: value.email,
      password: value.password,
      userInfo: {
        first_name: value.first_name,
        last_name: value.last_name,
      },
      allowAutoSignin: true,
    })
    if (res.isError) {
      console.error(res.message)
    }
}
```

<br/>

### Signin

Use the auth client for signin

<br/>

```ts [src/app/(frontend)/auth/signin/page.tsx]
import { appAuthClient } from '@/lib/auth';

const { password } = appAuthClient.signin()

const handleSignin = async (value:{
email: string,
password: string,
}) => {
    const res = await password({ email: value.email, password: value.password })
    if (res.isError) {
      console.error(res.message)
    }
}
```

<br/>

### Forgot Password

Use the auth client for forgot-password

<br/>

```ts [src/app/(frontend)/auth/forgot-password/page.tsx]
import { appAuthClient } from '@/lib/auth';

const handleForgotPassword = async (value: {
email: string
}) => {
  const res = await appAuthClient.forgotPassword({
    email: value.email,
  })
  if (res.isError) {
    console.error(res.message)
  }
  if (res.isSuccess) {
    console.log(res.message)
  }
}
```

> **NOTE:** To use the forgot password method, it is required to setup the [email functionality](https://payloadcms.com/docs/email/overview) in the Payload app to send out verification links to restore the password. Start with this [verification email template](https://github.com/authsmith/payload-auth-plugin/blob/main/examples/with-website/src/templates/forgot-password.tsx) and customise it as you want. The template is created using React Email

<br/>

### Restore Password

Use the auth client for restore password

<br/>

```ts [src/app/(frontend)/auth/restore-password/page.tsx]
import { appAuthClient } from '@/lib/auth';

const handleRestorePassword = async (value: {
  code: string,
  password: string
}) => {
  const res = await appAuthClient.recoverPassword({
    password: value.password,
    code: value.code,
  })
  if (res.isError) {
    console.error(res.message)
  }
  if (res.isSuccess) {
    console.log(res.message)
  }
}
```
