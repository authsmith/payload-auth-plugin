export const providersConfig: Record<string, string> = {
  AppleOAuth2Provider: `
        AppleOAuth2Provider({
          client_id: process.env.APPLE_CLIENT_ID as string,
          client_secret: process.env.APPLE_CLIENT_SECRET as string,
        })`,
  AppleOIDCAuthProvider: `
        AppleOIDCAuthProvider({
          client_id: process.env.APPLE_CLIENT_ID as string,
        })`,
  AtlassianAuthProvider: `
        AtlassianAuthProvider({
          client_id: process.env.ATLASSIAN_CLIENT_ID as string,
          client_secret: process.env.ATLASSIAN_CLIENT_SECRET as string,
        })`,
  Auth0AuthProvider: `
        Auth0AuthProvider({
          client_id: process.env.AUTH0_CLIENT_ID as string,
          client_secret: process.env.AUTH0_CLIENT_SECRET as string,
          domain: process.env.AUTH0_DOMAIN as string,
        })`,
  CognitoAuthProvider: `
        CognitoAuthProvider({
          client_id: process.env.COGNITO_CLIENT_ID as string,
          client_secret: process.env.COGNITO_CLIENT_SECRET as string,
          domain: process.env.COGNITO_DOMAIN as string,
          region: process.env.COGNITO_REGION as string,
        })`,
  DiscordAuthProvider: `
        DiscordAuthProvider({
          client_id: process.env.DISCORD_CLIENT_ID as string,
          client_secret: process.env.DISCORD_CLIENT_SECRET as string
        })`,
  FacebookAuthProvider: `
        FacebookAuthProvider({
          client_id: process.env.FACEBOOK_CLIENT_ID as string,
          client_secret: process.env.FACEBOOK_CLIENT_SECRET as string,
        })`,
  GitHubAuthProvider: `
        GitHubAuthProvider({
          client_id: process.env.GITHUB_CLIENT_ID as string,
          client_secret: process.env.GITHUB_CLIENT_SECRET as string,
        })`,
  GitLabAuthProvider: `
        GitLabAuthProvider({
          client_id: process.env.GITLAB_CLIENT_ID as string,
          client_secret: process.env.GITLAB_CLIENT_SECRET as string,
        })`,
  GoogleAuthProvider: `
        GoogleAuthProvider({
          client_id: process.env.GOOGLE_CLIENT_ID as string,
          client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
        })`,
  MicrosoftEntraAuthProvider: `
        MicrosoftEntraAuthProvider({
          client_id: process.env.MSFT_ENTRA_CLIENT_ID as string,
          client_secret: process.env.MSFT_ENTRA_CLIENT_SECRET as string,
          tenant_id: process.env.MSFT_ENTRA_TENANT_ID as string,
        })`,
  PasskeyAuthProvider: `
        PasskeyAuthProvider()`,
  SlackAuthProvider: `
        SlackAuthProvider({
          client_id: process.env.SLACK_CLIENT_ID as string,
          client_secret: process.env.SLACK_CLIENT_SECRET as string,
        })`,
}
