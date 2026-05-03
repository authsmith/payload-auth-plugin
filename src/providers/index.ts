import AppleOAuth2Provider from "./oauth2/apple.js"
import AtlassianAuthProvider from "./oauth2/atlassian.js"
import Auth0AuthProvider from "./oauth2/auth0.js"
import DiscordAuthProvider from "./oauth2/discord.js"
import FacebookAuthProvider from "./oauth2/facebook.js"
import GitHubAuthProvider from "./oauth2/github.js"
import JumpCloudAuthProvider from "./oauth2/jumpcloud.js"
import RobloxAuthProvider from "./oauth2/roblox.js"
import TwitchAuthProvider from "./oauth2/twitch.js"
import AppleOIDCAuthProvider from "./oidc/apple.js"
import CognitoAuthProvider from "./oidc/cognito.js"
import GitLabAuthProvider from "./oidc/gitlab.js"
import GoogleAuthProvider from "./oidc/google.js"
import KeyCloakAuthProvider from "./oidc/keycloak.js"
import MicrosoftEntraAuthProvider from "./oidc/microsoft-entra.js"
import OktaAuthProvider from "./oidc/okta.js"
import SlackAuthProvider from "./oidc/slack.js"
import PasskeyAuthProvider from "./passkey.js"
import PasswordProvider from "./password.js"

export {
  AppleOAuth2Provider, AppleOIDCAuthProvider, AtlassianAuthProvider, Auth0AuthProvider,
  CognitoAuthProvider, DiscordAuthProvider,
  FacebookAuthProvider, GitHubAuthProvider,
  GitLabAuthProvider, GoogleAuthProvider, JumpCloudAuthProvider, KeyCloakAuthProvider, MicrosoftEntraAuthProvider, OktaAuthProvider, PasskeyAuthProvider, PasswordProvider, RobloxAuthProvider, SlackAuthProvider, TwitchAuthProvider
}
