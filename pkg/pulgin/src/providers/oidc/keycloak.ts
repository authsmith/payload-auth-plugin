import type {
  AccountInfo,
  OIDCProviderConfig,
  OAuthBaseProviderConfig,
} from "../../types.js"

interface KeyCloakAuthConfig extends OAuthBaseProviderConfig {
  realm: string
  domain: string
  identifier: string
  name: string
}

function KeyCloakAuthProvider(config: KeyCloakAuthConfig): OIDCProviderConfig {
  const { realm, domain, identifier, name, ...restConfig } = config
  return {
    ...restConfig,
    id: identifier,
    scope: "email openid profile",
    issuer: `https://${domain}/realms/${realm}`,
    name,
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

export default KeyCloakAuthProvider
