import type { PayloadRequest } from "payload"
import { parseCookies } from "payload"
import type { OAuthProviderConfig } from "../../types.js"
import {
  InvalidOAuthAlgorithm,
  InvalidOAuthResource,
  InvalidProvider,
} from "../errors/consoleErrors.js"
import { OAuth2Authorization } from "../protocols/oauth/oauth2_authorization.js"
import { OAuth2Callback } from "../protocols/oauth/oauth2_callback.js"
import { OIDCAuthorization } from "../protocols/oauth/oidc_authorization.js"
import { OIDCCallback } from "../protocols/oauth/oidc_callback.js"

export function OAuthHandlers(
  pluginType: string,
  collections: {
    usersCollection: string
    accountsCollection: string
  },
  allowOAuthAutoSignUp: boolean,
  secret: string,
  useAdmin: boolean,
  request: PayloadRequest,
  provider: OAuthProviderConfig,
  successRedirectPath: string,
  errorRedirectPath: string,
): Promise<Response> {
  if (!provider) {
    throw new InvalidProvider()
  }

  const resource = request.routeParams?.resource as string

  const headers = request.headers
  const cookies = parseCookies(headers)
  const additionalScope = cookies.get("oauth_scope")

  switch (resource) {
    case "authorization":
      switch (provider.algorithm) {
        case "oidc":
          return OIDCAuthorization(
            pluginType,
            request,
            provider,
            additionalScope,
          )
        case "oauth2":
          return OAuth2Authorization(
            pluginType,
            request,
            provider,
            additionalScope,
          )
        default:
          throw new InvalidOAuthAlgorithm()
      }
    case "callback":
      switch (provider.algorithm) {
        case "oidc": {
          return OIDCCallback(
            pluginType,
            request,
            provider,
            collections,
            allowOAuthAutoSignUp,
            useAdmin,
            secret,
            successRedirectPath,
            errorRedirectPath,
            additionalScope,
          )
        }
        case "oauth2": {
          return OAuth2Callback(
            pluginType,
            request,
            provider,
            collections,
            allowOAuthAutoSignUp,
            useAdmin,
            secret,
            successRedirectPath,
            errorRedirectPath,
            additionalScope,
          )
        }
        default:
          throw new InvalidOAuthAlgorithm()
      }
    default:
      throw new InvalidOAuthResource()
  }
}
