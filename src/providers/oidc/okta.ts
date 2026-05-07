import type {
  AccountInfo,
  OAuthBaseProviderConfig,
  OIDCProviderConfig,
} from "../../types.js"

interface OktaAuthConfig extends OAuthBaseProviderConfig {
  domain: string
}

/**
 * Add Okta OIDC Provider
 *
 * #### Callback or Redirect URL pattern
 *
 * ```
 * https://example.com/api/{name}/oauth/callback/{name}
 * ```
 *
 * #### Plugin Setup
 *
 * ```ts
 * import { Plugin } from 'payload'
 * import {authPlugin} from "payload-auth-plugin"
 * import {OktaAuthProvider} from "payload-auth-plugin/providers"
 *
 * export const plugins: Plugin[] = [
 *  authPlugin({
 *    providers:[
 *      OktaAuthProvider({g,
 *          domain: process.env.OKTA_DOMAIN as string,
 *          client_id: process.env.OKTA_CLIENT_ID as string,
 *          client_secret: process.env.OKTA_CLIENT_SECRET as string,
 *      })
 *    ]
 *  })
 * ]
 * ```
 *
 */

function encodeString(s: string): number {
  let h = 0
  const l = s.length
  let i = 0
  if (l > 0) {
    while (i < l) {
      h = ((h << 5) - h + s.charCodeAt(i++)) | 0 // Bitwise operations to create a hash
    }
  }
  return h
}

function OktaAuthProvider(config: OktaAuthConfig): OIDCProviderConfig {
  const { domain, overrideScope, ...restConfig } = config

  const stateCode = encodeString(config.client_id).toString()

  return {
    ...restConfig,
    id: "okta",
    scope: overrideScope ?? "email openid profile",
    issuer: `https://${domain}`,
    name: "Okta",
    algorithm: "oidc",
    kind: "oauth",
    params: {
      state: `state-${stateCode}`,
    },
    profile: (profile): AccountInfo => {
      return {
        sub: profile.sub as string,
        name: profile.name as string,
        email: profile.email as string,
        picture: profile.picture as string,
      }
    },
  }
}

export default OktaAuthProvider
