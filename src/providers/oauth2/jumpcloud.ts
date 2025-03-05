import type * as oauth from "oauth4webapi"
import type {
  OAuth2ProviderConfig,
  AccountInfo,
  OAuthBaseProviderConfig,
} from "../../types.js"

const authorization_server: oauth.AuthorizationServer = {
  issuer: "https://oauth.id.jumpcloud.com/",
  authorization_endpoint: "https://oauth.id.jumpcloud.com/oauth2/auth",
  token_endpoint: "https://oauth.id.jumpcloud.com/oauth2/token",
  userinfo_endpoint: "https://oauth.id.jumpcloud.com/userinfo",
}

type JumpCloudAuthConfig = OAuthBaseProviderConfig

function JumpCloudProvider(config: JumpCloudAuthConfig): OAuth2ProviderConfig {
  return {
    ...config,
    id: "jumpCloud",
    scope: "openid email profile",
    authorization_server,
    name: "Jump Cloud",
    algorithm: "oauth2",
    profile: (profile): AccountInfo => {
      return {
        sub: profile.email as string,
        name: profile.name as string,
        email: profile.email as string,
        picture: profile.picture as string,
      }
    },
  }
}

export default JumpCloudProvider
