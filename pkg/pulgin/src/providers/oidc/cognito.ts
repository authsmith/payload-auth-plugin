import type {
  AccountInfo,
  OIDCProviderConfig,
  OAuthBaseProviderConfig,
} from "../../types.js"

interface CognitoAuthConfig extends OAuthBaseProviderConfig {
  domain: string
  region: string
}

function CognitoAuthProvider(config: CognitoAuthConfig): OIDCProviderConfig {
  const { domain, region, ...restConfig } = config
  return {
    ...restConfig,
    id: "cognito",
    scope: "email openid profile",
    issuer: `https://${domain}/${region}`,
    name: "Congnito",
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

export default CognitoAuthProvider
