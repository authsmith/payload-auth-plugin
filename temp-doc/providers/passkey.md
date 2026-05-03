---
title: "Passkey Provider"
description: "Payload CMS auth plugin Passkey provider"
seo:
  title: "Passkey Provider"
  description: "Payload CMS auth plugin Passkey provider"
---

## Passkey Provider

Authenticate using Passkey provider.

<br/>
<br/>

> **_Warning:_** This provider is not stable and also experimental, it is recommended not to use it in production.

<br/>
<br/>

```ts [src/payload.config.ts] {3, 10}
import { buildConfig } from "payload/config";
import { authPlugin } from "payload-auth-plugin";
import { PasskeyAuthProvider } from "payload-auth-plugin/providers";

export default buildConfig({
  // --- rest of the config
  plugins: [
    // --- rest of the plugins
    aPlugin({
      providers: [PasskeyAuthProvider()],
    }),
  ],
});
```
