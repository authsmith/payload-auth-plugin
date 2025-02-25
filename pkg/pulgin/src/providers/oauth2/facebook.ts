import type * as oauth from "oauth4webapi"
import type {
  OAuth2ProviderConfig,
  AccountInfo,
  OAuthBaseProviderConfig,
} from "../../types.js"

const authorization_server: oauth.AuthorizationServer = {
  issuer: "https://www.facebook.com",
  authorization_endpoint: "https://www.facebook.com/v19.0/dialog/oauth",
  token_endpoint: "https://graph.facebook.com/oauth/access_token",
  userinfo_endpoint:
    "https://graph.facebook.com/me?fields=id,name,email,picture",
}

type FacebookAuthConfig = OAuthBaseProviderConfig

function FacebookAuthProvider(
  config: FacebookAuthConfig,
): OAuth2ProviderConfig {
  return {
    ...config,
    id: "facebook",
    scope: "email",
    authorization_server,
    name: "Facebook",
    algorithm: "oauth2",
    kind: "oauth",
    profile: (profile): AccountInfo => {
      let picture

      if (typeof profile.picture === "object" && profile.picture !== null) {
        // Type assertion
        const dataContainer = profile.picture as { data: { url: string } }
        if ("data" in dataContainer) {
          picture = dataContainer.data.url
        }
      }
      return {
        sub: profile.id as string,
        name: profile.name as string,
        email: profile.email as string,
        picture: picture as string,
      }
    },
  }
}

export default FacebookAuthProvider
