import type * as oauth from "oauth4webapi"
import type {
  OAuth2ProviderConfig,
  AccountInfo,
  OAuthBaseProviderConfig,
} from "../../types.js"

interface Auth0AuthConfig extends OAuthBaseProviderConfig {
  domain: string
}

function Auth0AuthProvider(config: Auth0AuthConfig): OAuth2ProviderConfig {
  const { domain, ...restConfig } = config
  const authorization_server: oauth.AuthorizationServer = {
    issuer: `https://${domain}/`,
    authorization_endpoint: `https://${domain}/authorize`,
    token_endpoint: `https://${domain}/oauth/token`,
    userinfo_endpoint: `https://${domain}/userinfo`,
  }

  return {
    ...restConfig,
    id: "auth0",
    scope: "openid email profile",
    authorization_server,
    name: "Auth0",
    algorithm: "oauth2",
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

export default Auth0AuthProvider
