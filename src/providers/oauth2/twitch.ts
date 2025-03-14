import type * as oauth from "oauth4webapi"
import type {
  OAuth2ProviderConfig,
  AccountInfo,
  OAuthBaseProviderConfig,
} from "../../types.js"

const authorization_server: oauth.AuthorizationServer = {
  issuer: "https://id.twitch.tv/oauth2",
  authorization_endpoint: "https://id.twitch.tv/oauth2/authorize",
  token_endpoint: "https://id.twitch.tv/oauth2/token",
  userinfo_endpoint: "https://id.twitch.tv/oauth2/userinfo",
}

type TwitchAuthConfig = OAuthBaseProviderConfig

function TwitchAuthProvider(config: TwitchAuthConfig): OAuth2ProviderConfig {
  return {
    ...config,
    id: "twitch",
    scope: "openid user:read:email",
    authorization_server,
    name: "Twitch",
    algorithm: "oauth2",
    kind: "oauth",
    params: {
      scope: "openid user:read:email",
      claims: JSON.stringify({
        id_token: { email: null, picture: null, preferred_username: null },
        userinfo: { email: null, picture: null, preferred_username: null },
      }),
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

export default TwitchAuthProvider
