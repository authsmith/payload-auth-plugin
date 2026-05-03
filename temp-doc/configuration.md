---
title: "Configuration"
description: "Payload CMS auth plugin configuration"
seo:
  title: "Configuration"
  description: "Payload CMS auth plugin configuration"
---

# Payload Auth Plugin configuration


#### enabled

**Type:** boolean

**Description:** Option to either enable or disable the plugin for Payload to use.

**Default:** true

**Optional:** Yes

<br/>

```ts
{
  enabled: true;
}
```

<br/>

#### name

**Type:** string

**Description:** A unique name that can be used to create endpoints and sessions. Example: "storefront", "admin", or "console"

**Optional:** No

<br/>

```ts
{
  name: "some-app-name";
}
```

<br/>

#### useAdmin

**Type:** boolean

**Description:** Set to true if the plugin is to be used for admin app authentication.

**Optional:** Yes

<br/>

```ts
{
  useAdmin: true;
}
```

<br/>

#### usersCollectionSlug

**Type:** string

**Description:** Set the users collection slug to be used by the plugin

**Optional:** No

<br/>

```ts
{
  usersCollectionSlug: "users";
}
```

<br/>

#### accountsCollectionSlug

**Type:** string

**Description:** Set the accounts collection slug to be used by the plugin

**Optional:** No

<br/>

```ts
{
  accountsCollectionSlug: "accounts";
}
```

<br/>

#### providers

**Type:** Array

**Description:** Array of providers(OAuth, Password, and Passkey).

**Optional:** No

<br/>

```ts
{
  providers: [
    GoogleAuthProvider({
        client_id: "GOOGLE_CLIENT_ID",
        client_secret: "GOOGLE_CLIENT_SECRET"
    }),
    PasswordProvider({
      emailTemplates: {
        forgotPassword: renderForgotPasswordTemplate,
      },
    }),
  ];
}
```

<br/>

#### allowOAuthAutoSignUp

**Type:** boolean

**Description:** Allows automatic sign-up when using any OAuth provider.. **This should be used at the admin's discretion.**

**Default:** false

**Optional:** Yes

<br/>

```ts
{
  allowSignUp: true;
}
```

<br/>

#### successRedirectPath

**Type:** string

**Description:** A path to redirect the user after successful signin

**Optional:** No

<br/>

```ts
{
  successRedirectPath: "/some-path";
}
```

<br/>

#### errorRedirectPath

**Type:** string

**Description:** A path to redirect the user when error occurs

**Optional:** No

<br/>

```ts
{
  errorRedirectPath: "/some-path";
}
```

<br/>
<br/>
<br/>

::div{ .flex .items-center .justify-between}
[&laquo; Setup](/docs/plugins/payload/setup)

[Providers &raquo;](/docs/plugins/payload/providers)

::
