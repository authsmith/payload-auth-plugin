import type { AccountInfo, OIDCProviderConfig } from "../../types.js"

type AppleAuthConfig = {
  client_id: string
  params?: Record<string, string>
}

function AppleOIDCAuthProvider(config: AppleAuthConfig): OIDCProviderConfig {
  return {
    ...config,
    id: "apple",
    scope: "openid name email",
    issuer: "https://appleid.apple.com",
    name: "Apple",
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

export default AppleOIDCAuthProvider
