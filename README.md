![cover image](https://github.com/user-attachments/assets/798c8a70-1f86-411b-9fc2-6497b1f751c0)

# payload-auth-plugin (Enhanced Fork)

This is an enhanced fork of the [original payload-auth-plugin](https://github.com/authsmith/payload-auth-plugin) with added support for flexible collection relationships.

## What's Different in This Fork?

This fork adds one significant enhancement to the original plugin:

**Flexible Collection Relationships**: Instead of only being able to link OAuth accounts to the admin users collection, you can now configure the plugin to link accounts to any collection in your Payload CMS.

This enables scenarios such as:

- Customer authentication instead of just admin authentication
- Different authentication flows for different user types
- More flexible application architecture

## Installation

```bash
npm install @vladanilic/payload-auth-plugin
# or
yarn add @vladanilic/payload-auth-plugin
# or
pnpm add @vladanilic/payload-auth-plugin
```

## Usage

For basic usage instructions, please refer to the [original documentation](https://authsmith.com/docs/plugins/payload).

### Using Flexible Collection Relationships

To link OAuth accounts to a collection other than the default users collection:

```typescript
import { buildConfig } from "payload/config"
import { adminAuthPlugin } from "@vladanilic/payload-auth-plugin"
import { GoogleAuthProvider } from "@vladanilic/payload-auth-plugin/providers"

export default buildConfig({
  serverURL: "http://localhost:3000",
  // Your collections definition
  collections: [
    // Other collections...
    {
      slug: "customers",
      fields: [
        {
          name: "email",
          type: "email",
          required: true,
          unique: true,
        },
        // Other fields...
      ],
    },
  ],
  plugins: [
    adminAuthPlugin({
      providers: [
        GoogleAuthProvider({
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
        }),
      ],
      // Define a custom relation to the "customers" collection
      relationConfig: {
        fieldName: "customer", // Field name in accounts collection
        relationTo: "customers", // Target collection
        collectionField: "email", // Field to use for user matching
        hasMany: false,
        required: true,
        label: "Customer",
      },
      // Allow creating new customers automatically if they don't exist
      allowSignUp: true,
      // Custom redirect path after login
      successPath: "/admin/collections/customers",
    }),
  ],
  // Other Payload config...
})
```

### Default Behavior

If you don't specify a `relationConfig`, the plugin works exactly like the original, linking accounts to the admin users collection.

## Status of This Fork

This fork has been submitted as a pull request to the original repository. If accepted, I recommend you switch back to the original package once the changes are published there.

For all other documentation, please refer to the [official documentation](https://authsmith.com/docs/plugins/payload).

## License

This project is licensed under the MIT License - see the LICENSE file for details.
