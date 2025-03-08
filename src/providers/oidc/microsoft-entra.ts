import type {
  AccountInfo,
  OIDCProviderConfig,
  OAuthBaseProviderConfig,
} from "../../types.js"

type MicrosoftEntraAuthConfig = OAuthBaseProviderConfig & {
  tenant_id: string
}

function MicrosoftEntraAuthProvider(
  config: MicrosoftEntraAuthConfig,
): OIDCProviderConfig {
  return {
    ...config,
    id: "msft-entra",
    scope: "openid profile email offline_access",
    issuer: `https://login.microsoftonline.com/${config.tenant_id}/v2.0`,
    name: "Microsoft Entra",
    algorithm: "oidc",
    kind: "oauth",
    profile: (profile): AccountInfo => {
      const email = profile.email as string
      return {
        sub: profile.sub as string,
        name: profile.name as string,
        email: email.toLowerCase(),
        picture: profile.picture as string,
      }
    },
  }
}

export default MicrosoftEntraAuthProvider
