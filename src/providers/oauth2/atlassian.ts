import type * as oauth from "oauth4webapi"
import type {
  OAuth2ProviderConfig,
  AccountInfo,
  OAuthBaseProviderConfig,
} from "../../types.js"

const algorithm = "oauth2"

const authorization_server: oauth.AuthorizationServer = {
  issuer: "https://auth.atlassian.com",
  authorization_endpoint: "https://auth.atlassian.com/authorize",
  token_endpoint: "https://auth.atlassian.com/oauth/token",
  userinfo_endpoint: "https://api.atlassian.com/me",
}

type AtlassianAuthConfig = OAuthBaseProviderConfig

function AtlassianAuthProvider(
  config: AtlassianAuthConfig,
): OAuth2ProviderConfig {
  return {
    ...config,
    id: "atlassian",
    authorization_server,
    name: "Atlassian",
    algorithm,
    scope: "read:me read:account",
    kind: "oauth",
    profile: (profile): AccountInfo => {
      return {
        sub: profile.account_id as string,
        name: profile.name as string,
        email: profile.email as string,
        picture: profile.picture as string,
      }
    },
  }
}

export default AtlassianAuthProvider
