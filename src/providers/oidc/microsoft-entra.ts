import type {
  AccountInfo,
  OIDCProviderConfig,
  OAuthBaseProviderConfig,
} from "../../types.js"

type MicrosoftEntraAuthConfig = OAuthBaseProviderConfig & {
  tenant_id: string
  /*
   * This will skip the `email_verified` check if enabled. Please use it at your own discretion.
   */
  skip_email_verification?: boolean | undefined
}

/**
 * Add Microsoft Entra OIDC Provider
 *
 * #### Callback or Redirect URL pattern
 *
 * ```
 * https://example.com/api/{name}/oauth/callback/msft-entra
 * ```
 *
 * #### Plugin Setup
 *
 * ```ts
 * import { Plugin } from 'payload'
 * import { authPlugin } from "payload-auth-plugin"
 * import { MicrosoftEntraAuthProvider } from "payload-auth-plugin/providers"
 *
 * export const plugins: Plugin[] = [
 *  authPlugin({
 *    providers:[
 *      MicrosoftEntraAuthProvider({
 *          tenant_id: process.env.MICROSOFTENTRA_TENANT_ID as string,
 *          client_id: process.env.MICROSOFTENTRA_CLIENT_ID as string,
 *          client_secret: process.env.MICROSOFTENTRA_CLIENT_SECRET as string,
 *      })
 *    ]
 *  })
 * ]
 * ```
 *
 */

function MicrosoftEntraAuthProvider(
  config: MicrosoftEntraAuthConfig,
): OIDCProviderConfig {
  const { overrideScope, ...restConfig } = config

  return {
    ...restConfig,
    id: "msft-entra",
    scope: overrideScope ?? "openid profile email offline_access",
    issuer: `https://${config.tenant_id}.ciamlogin.com/${config.tenant_id}/v2.0`,
    name: "Microsoft Entra",
    algorithm: "oidc",
    kind: "oauth",
    profile: (profile): AccountInfo => {
      const email = profile.email as string
      return {
        sub: profile.sub as string,
        name: profile.name as string,
        email: email.toLowerCase(),
        picture: profile.picture as string,
      }
    },
  }
}

export default MicrosoftEntraAuthProvider
