
import { InvalidDomain } from "../../core/errors/consoleErrors.js";
import type {
  AccountInfo,
  OAuthBaseProviderConfig,
  OIDCProviderConfig,
} from "../../types.js";
import { encodeString } from "../utils.js";


interface RobloxAuthConfig extends OAuthBaseProviderConfig {
  /**
   * Domain is required to create custom email addresses, since Roblox does not share users’ actual email addresses for security and privacy reasons. The plugin automatically generates a unique custom email address for each new signup.
   */
  emailDomain: string
  skip_email_verification?: boolean | undefined
}

/**
 * Add Roblox OIDC Provider
 *
 * ```
 * https://example.com/api/{name}/oauth/callback/roblox
 * ```
 *
 * #### Plugin Setup
 *
 * ```ts
 * import { Plugin } from 'payload'
 * import {authPlugin} from "payload-auth-plugin"
 * import {RobloxAuthProvider} from "payload-auth-plugin/providers"
 *
 * export const plugins: Plugin[] = [
 *  authPlugin({
 *    providers:[
 *      RobloxAuthProvider({
 *          client_id: process.env.ROBLOX_CLIENT_ID as string,
 *          client_secret: process.env.ROBLOX_CLIENT_SECRET as string,
 *      })
 *    ]
 *  })
 * ]
 * ```
 */

function RobloxAuthProvider(config: RobloxAuthConfig): OIDCProviderConfig {
  const { overrideScope, ...restConfig } = config

  const domainRegex = /^(?!-)(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,63}$/;

  const isValidDomain = domainRegex.test(restConfig.emailDomain);
  if (!isValidDomain) {
    throw new InvalidDomain()
  }

  const stateCode = encodeString(config.client_id).toString()


  return {
    ...restConfig,
    id: "roblox",
    scope: overrideScope ?? "openid email profile",
    issuer: "https://apis.roblox.com/oauth/",
    name: "Roblox",
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

export default RobloxAuthProvider
