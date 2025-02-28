import type * as oauth from "oauth4webapi"
import type {
  OAuth2ProviderConfig,
  AccountInfo,
  ProviderConfig,
} from "../../types.js"
import { enhancedProfileMapper } from "../utils.js"

const authorization_server: oauth.AuthorizationServer = {
  issuer: "https://github.com",
  authorization_endpoint: "https://github.com/login/oauth/authorize",
  token_endpoint: "https://github.com/login/oauth/access_token",
  userinfo_endpoint: "https://api.github.com/user",
}

type GitHubAuthConfig = ProviderConfig

function GitHubAuthProvider(config: GitHubAuthConfig): OAuth2ProviderConfig {
  return {
    ...config,
    id: "github",
    scope: "openid email profile",
    authorization_server,
    name: "GitHub",
    algorithm: "oauth2",
    profile: (profile): AccountInfo => {
      return enhancedProfileMapper(profile, {
        subField: "id",
        nameField: "name",
        emailField: "email",
        pictureField: "avatar_url",
      })
    },
  }
}

export default GitHubAuthProvider
