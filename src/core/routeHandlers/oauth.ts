import type { PayloadRequest } from "payload"
import type { OAuthProviderConfig } from "../../types.js"
import {
  InvalidOAuthAlgorithm,
  InvalidOAuthResource,
  InvalidProvider,
} from "../errors/consoleErrors.js"
import { OIDCAuthorization } from "../protocols/oauth/oidc_authorization.js"
import { OAuth2Authorization } from "../protocols/oauth/oauth2_authorization.js"
import { OIDCCallback } from "../protocols/oauth/oidc_callback.js"
import { OAuth2Callback } from "../protocols/oauth/oauth2_callback.js"
import { OAuthAuthentication } from "../protocols/oauth/oauth_authentication.js"

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

  switch (resource) {
    case "authorization":
      switch (provider.algorithm) {
        case "oidc":
          return OIDCAuthorization(pluginType, request, provider)
        case "oauth2":
          return OAuth2Authorization(pluginType, request, provider)
        default:
          throw new InvalidOAuthAlgorithm()
      }
    case "callback":
      switch (provider.algorithm) {
        case "oidc":
          return OIDCCallback(pluginType, request, provider)
        case "oauth2":
          return OAuth2Callback(pluginType, request, provider)
        default:
          throw new InvalidOAuthAlgorithm()
      }
    case "authentication":
      return OAuthAuthentication(
        pluginType,
        collections,
        allowOAuthAutoSignUp,
        useAdmin,
        secret,
        request,
        successRedirectPath,
        errorRedirectPath,
      )
    default:
      throw new InvalidOAuthResource()
  }
}
