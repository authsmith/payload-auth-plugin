import type * as oauth from "oauth4webapi"
import type {
  OAuth2ProviderConfig,
  AccountInfo,
  OAuthBaseProviderConfig,
} from "../../types.js"

const authorization_server: oauth.AuthorizationServer = {
  issuer: "https://github.com",
  authorization_endpoint: "https://github.com/login/oauth/authorize",
  token_endpoint: "https://github.com/login/oauth/access_token",
  userinfo_endpoint: "https://api.github.com/user",
}

type GitHubAuthConfig = OAuthBaseProviderConfig

function GitHubAuthProvider(config: GitHubAuthConfig): OAuth2ProviderConfig {
  return {
    ...config,
    id: "github",
    scope: "openid email profile",
    authorization_server,
    name: "GitHub",
    algorithm: "oauth2",
    kind: "oauth",
    profile: (profile): AccountInfo => {
      return {
        sub: profile.id as string,
        name: profile.name as string,
        email: profile.email as string,
        picture: profile.picture as string,
      }
    },
  }
}

export default GitHubAuthProvider
