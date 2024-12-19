import type { AuthorizationServer } from 'oauth4webapi'

interface BaseProviderConfig {
  id: string
  name: string
  scope: string
  profile: (profile: Record<string, string | string[] | number | boolean | object | undefined >) => OAuthAccountInfo
}

export interface ProviderConfig {
  /*
   * Oauth provider Client ID
   */
  client_id: string
  /*
   * Oauth provider Client Secret
   */
  client_secret: string
  /*
   * Additional parameters you would like to add to query for the provider
   */
  params?: Record<string, string>
}

export interface OIDCProviderConfig extends BaseProviderConfig, ProviderConfig {
  issuer: string
  algorithm: 'oidc'
}

export interface OAuth2ProviderConfig extends BaseProviderConfig, ProviderConfig {
  authorization_server: AuthorizationServer
  algorithm: 'oauth2'
}

export type OAuthProviderConfig = OIDCProviderConfig | OAuth2ProviderConfig

export interface OAuthAccountInfo {
  sub: string
  name: string
  picture: string
  email: string
  roles?: string[]
}

export type CredentialsProviderConfig = {
  id: string
  name: string
  verfiyEmail?: boolean
  passwordless?: boolean
  mfa?: 'OTP' | 'TOTP' | 'None'
  signinCallback?: () => void
  signupCallback?: () => void
}

export interface CredentialsAccountInfo {
  name: string
  email: string
}

export type ProvidersConfig = OAuthProviderConfig | CredentialsProviderConfig
