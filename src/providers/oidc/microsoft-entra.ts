import type {
  AccountInfo,
  OIDCProviderConfig,
  ProviderConfig,
} from "../../types.js"

type MicrosoftEntraAuthConfig = ProviderConfig & {
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
