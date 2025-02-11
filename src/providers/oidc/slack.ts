import type {
  AccountInfo,
  OIDCProviderConfig,
  ProviderConfig,
} from "../../types.js"

type SlackAuthConfig = ProviderConfig

function SlackAuthProvider(config: SlackAuthConfig): OIDCProviderConfig {
  return {
    ...config,
    id: "slack",
    scope: "openid email profile",
    issuer: "https://slack.com",
    name: "Slack",
    algorithm: "oidc",
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

export default SlackAuthProvider
