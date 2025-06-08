import type { AuthorizationServer } from "oauth4webapi"
import type {
  AccountInfo,
  OAuth2ProviderConfig,
  OAuthBaseProviderConfig,
} from "../../types.js"

type AppleAuthConfig = OAuthBaseProviderConfig

const algorithm = "oauth2"

const authorization_server: AuthorizationServer = {
  issuer: "https://appleid.apple.com",
  authorization_endpoint: "https://appleid.apple.com/auth/authorize",
  token_endpoint: "https://appleid.apple.com/auth/token",
}

/**
 * Add Apple OAuth2 Provider
 *
 * #### Callback or Redirect URL pattern
 *
 * - For Admin
 * ```
 * https://example.com/api/admin/oauth/callback/apple
 * ```
 *
 * - For App
 * ```
 * https://example.com/api/{app_name}/oauth/callback/apple
 * ```
 *
 * #### Plugin Setup
 *
 * ```ts
 * import { Plugin } from 'payload'
 * import {adminAuthPlugin, appAuthPlugin} from "payload-auth-plugin"
 * import {AppleOAuth2Provider} from "payload-auth-plugin/providers"
 *
 * export const plugins: Plugins[] = [
 *  //For Admin
 *  adminAuthPlugin({
 *    accountsCollectionSlug: 'adminAccounts',
 *    providers:[
 *      AppleOAuth2Provider({
 *          client_id: process.env.APPLE_CLIENT_ID as string,
 *          client_secret: process.env.APPLE_CLIENT_SECRET as string,
 *      })
 *    ]
 *  })
 *
 *  // For App
 *  appAuthPlugin({
 *    name: 'app'
 *    secret: process.env.APP_AUTH_SECRET,
 *    accountsCollectionSlug: 'adminAccounts',
 *    usersCollectionSlug: 'appUsers',
 *    accountsCollectionSlug: 'appAccounts',
 *    providers:[
 *      AppleOAuth2Provider({
 *          client_id: process.env.APPLE_CLIENT_ID as string,
 *          client_secret: process.env.APPLE_CLIENT_SECRET as string,
 *      })
 *    ]
 *  })
 * ]
 * ```
 *
 */

function AppleOAuth2Provider(config: AppleAuthConfig): OAuth2ProviderConfig {
  return {
    ...config,
    id: "apple",
    scope: "name email",
    authorization_server,
    name: "Apple",
    algorithm,
    params: {
      ...config.params,
      response_mode: "form_post",
    },
    kind: "oauth",
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

export default AppleOAuth2Provider
