import type { AuthorizationServer } from "oauth4webapi"
import type { OAuthProviderConfig, AccountInfo, ProviderConfig } from "../types.js"
import { confirmPassword } from "payload/shared"

interface CustomOidcConfig extends ProviderConfig {
  id: 'custom',
  scope: string,
  issuer: string,
  name: string,
  algorithm: 'oidc',
}

interface CustomOAuthConfig extends ProviderConfig {
  id: 'custom',
  scope: 'openid email profile',
  authorization_server: AuthorizationServer,
  name: string,
  algorithm: 'oauth2',
  client_auth_type: 'client_secret_basic' | 'client_secret_post',
}

type CustomAuthConfig = CustomOidcConfig | CustomOAuthConfig

function CustomAuthProvider(config: CustomAuthConfig): OAuthProviderConfig {
  return {
    ...config,
    id: "custom",
    profile: (profile): AccountInfo => {
      console.log('profile', profile);
      return {
        sub: profile.sub as string,
        name: profile.name as string,
        email: profile.email as string,
        picture: profile.picture as string,
      }
    }
  }
}

export default CustomAuthProvider
