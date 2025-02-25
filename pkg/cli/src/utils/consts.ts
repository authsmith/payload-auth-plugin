export const AUTH_PLUGIN_FILE = "payload-auth.ts"
export const AUTH_PROVIDERS = [
  {
    label: "Apple OAuth2",
    value: "AppleOAuth2Provider",
    hint: "Allows sign-in using Apple OAuth2 provider. Read more about it here: https://authsmith.com/docs/plugins/payload/providers/apple",
  },
  {
    label: "Apple OIDC",
    value: "AppleOIDCAuthProvider",
    hint: "Allows sign-in using Apple OIDC provider. Read more about it here: https://authsmith.com/docs/plugins/payload/providers/apple",
  },
  {
    label: "Atlassian",
    value: "AtlassianAuthProvider",
    hint: "Allows sign-in using Atlassian provider. Read more about it here: https://authsmith.com/docs/plugins/payload/providers/atlassian",
  },
  {
    label: "Auth0",
    value: "Auth0AuthProvider",
    hint: "Allows sign-in using AUth0 provider. Read more about it here: https://authsmith.com/docs/plugins/payload/providers/auth0",
  },
  {
    label: "AWS Cognito",
    value: "CognitoAuthProvider",
    hint: "Allows sign-in using AWS Cognito provider. Read more about it here: https://authsmith.com/docs/plugins/payload/providers/cognito",
  },
  {
    label: "Discord",
    value: "DiscordAuthProvider",
    hint: "Allows sign-in using Discord provider. Read more about it here: https://authsmith.com/docs/plugins/payload/providers/discord",
  },
  {
    label: "Facebook",
    value: "FacebookAuthProvider",
    hint: "Allows sign-in using Facebook provider. Read more about it here: https://authsmith.com/docs/plugins/payload/providers/facebook",
  },
  {
    label: "GitHub",
    value: "GitHubAuthProvider",
    hint: "Allows sign-in using GitHub provider. Read more about it here: https://authsmith.com/docs/plugins/payload/providers/github",
  },
  {
    label: "GitLab",
    value: "GitLabAuthProvider",
    hint: "Allows sign-in using GitLab provider. Read more about it here: https://authsmith.com/docs/plugins/payload/providers/gitlab",
  },
  {
    label: "Google",
    value: "GoogleAuthProvider",
    hint: "Allows sign-in using Google provider. Read more about it here: https://authsmith.com/docs/plugins/payload/providers/google",
  },
  //   {
  //     label: "KeyCloak",
  //     value: "KeyCloakAuthProvider",
  //     hint:
  //       "Allows sign-in using Apple OAuth2 provider. Read more about it here: https://authsmith.com/docs/plugins/payload/providers/apple",
  //   },
  {
    label: "Microsoft Entra",
    value: "MicrosoftEntraAuthProvider",
    hint: "Allows sign-in using Microsoft Entra provider. Read more about it here: https://authsmith.com/docs/plugins/payload/providers/microsoft-entra",
  },
  {
    label: "Passkey",
    value: "PasskeyAuthProvider",
    hint: "Allows sign-in using Passkey provider. Read more about it here: https://authsmith.com/docs/plugins/payload/providers/passkey",
  },
  {
    label: "Slack",
    value: "SlackAuthProvider",
    hint: "Allows sign-in using Slack provider. Read more about it here: https://authsmith.com/docs/plugins/payload/providers/slack",
  },
]
export const AUTH_PLUGIN_CONFIG_FILE = "payload-auth.config.json"
export const ACCOUNTS_COLLECTION_FILE = "Accounts/index.ts"
