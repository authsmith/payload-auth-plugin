import type { AuthorizationServer } from "oauth4webapi"

/**
 * Generic OAuth provider callback output
 *
 * @interface OAuthProviderOutput
 * @internal
 */
interface OAuthProviderOutput {
  /**
   * OAuth Provider ID. Usually the slugified provider name
   *
   * @type {string}
   */
  id: string
  /**
   * OAuth provider name. For example Google, Apple
   *
   * @type {string}
   */
  name: string
  /**
   * Scope of account attributes to request from the provider
   *
   * @type {string}
   */
  scope: string

  /**
   * Profile callback that returns account information requried to link with users
   *
   * @type {(
   *     profile: Record<string, string | number | boolean | object>,
   *   ) => AccountInfo}
   */
  profile: (
    profile: Record<string, string | number | boolean | object>,
  ) => AccountInfo
}

export interface OAuthBaseProviderConfig {
  client_id: string
  client_secret?: string
  /*
   * Oauth provider Client Type
   */
  client_auth_type?: "client_secret_basic" | "client_secret_post"
  /*
   * Additional parameters you would like to add to query for the provider
   */
  params?: Record<string, string>
}

export interface OIDCProviderConfig
  extends OAuthProviderOutput,
    OAuthBaseProviderConfig {
  issuer: string
  algorithm: "oidc"
}

export interface OAuth2ProviderConfig
  extends OAuthProviderOutput,
    OAuthBaseProviderConfig {
  authorization_server: AuthorizationServer
  algorithm: "oauth2"
}

export type OAuthProviderConfig = (
  | OIDCProviderConfig
  | OAuth2ProviderConfig
) & {
  kind: "oauth"
}

export interface AccountInfo {
  sub: string
  name: string
  picture: string
  email: string
  passKey?: {
    credentialId: string
    publicKey?: Uint8Array
    counter: number
    transports?: string[]
    deviceType: string
    backedUp: boolean
  }
}

export type CredentialsProviderConfig = {
  id: string
  name: string
  verfiyEmail?: boolean
  passwordless?: boolean
  mfa?: "OTP" | "TOTP" | "None"
  signinCallback?: () => void
  signupCallback?: () => void
}

export interface CredentialsAccountInfo {
  name: string
  email: string
}

export type PasskeyProviderConfig = {
  id: string
  kind: "passkey"
}

export type ProvidersConfig = OAuthProviderConfig | PasskeyProviderConfig
