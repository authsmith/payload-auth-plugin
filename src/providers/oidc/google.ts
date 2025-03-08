import type {
  AccountInfo,
  OIDCProviderConfig,
  OAuthBaseProviderConfig,
} from "../../types.js"

type GoogleAuthConfig = OAuthBaseProviderConfig

function GoogleAuthProvider(config: GoogleAuthConfig): OIDCProviderConfig {
  return {
    ...config,
    id: "google",
    scope: "openid email profile",
    issuer: "https://accounts.google.com",
    name: "Google",
    algorithm: "oidc",
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

export default GoogleAuthProvider
