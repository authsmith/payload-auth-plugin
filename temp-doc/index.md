---
title: "Plugins / Payload"
description: "AuthSmith official Payload CMS auth plugin"
seo:
  title: "Payload Auth Plugin"
  description: "AuthSmith official Payload CMS auth plugin"
---

::section

# Introduction

Payload CMS auth plugin is created and maintained by [Sourab Pramanik](https://github.com/sourabpramanik){.link-highlight}. This plugin extends the Payload authentication process and implements OAuth and Passkey based authentication features. In its core it uses Payload's auth conventions to adhere to its standards.
<br/>
<br/>

::blockquote
**_NOTE:_** It works with all Payload versions >= 3.0
::
<br/>
<br/>

## How it works?

The initial goal in developing this plugin was to abstract its configurations and the resources it utilizes, minimizing the setup required by developers. This way, integrating any supported provider with Payload CMS involves minimal effort.

This plugin integrates authentication across all applications utilizing Payload APIs, including the admin interface. It centralizes authentication logic within Payload, streamlining the configuration of multiple authentication providers and methods.
<br/>
<br/>

### Collections

1. Accounts collection:
<br/>
The `withAccountCollection` is a function which returns a new collection configuration that includes predefined fields required by the plugin to store provider-specific user data. It takes two arguments: a base collection configuration (including the slug and any optional custom fields), and the users collection slug to define the relationship between the accounts and users collections.

<br/>

2. Users collection:
<br/>
The `withUsersCollection` is a function which returns a new collection configuration that includes predefined fields required by the plugin to manage user credential, tokens, and roles. It takes two arguments: a base collection configuration (including the slug and any optional custom fields).

<br/>

It is not mandatory to use this function in order to use the plugin, but it is a good idea to give it a try. It is important to note that when using the `withUsersCollection` function, you should not set auth: true on the collection, as this function adds custom authentication-related fields that can conflict with Payload's built-in authentication fields.

<br/>

A single user can have multiple accounts, but each account can be associated with only one user.

<br/>
<br/>

### Endpoints

For each provider with different protocols and user session management, the necessary endpoints are preconfigured in the plugin. It defines a catch-all segment route that processes all incoming requests and responses, delegating them to the plugin core to handle authentication.

<br/>
<br/>

### Cookie-based Session

Payload has exposed ways to use their inbuilt session mechanism to tweak it the way you need. It is helpful to understand and tailor the user session and extend it if needed. To keep things simple and even, the core of the plugin uses Payload session.

<br/>
<br/>
<br/>

::div{ .flex .items-center .justify-between}
[&laquo; Plugins](/docs/plugins)

[Installation &raquo;](/docs/plugins/payload/installation)

::

::
