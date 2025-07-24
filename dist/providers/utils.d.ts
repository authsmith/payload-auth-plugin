import { ProvidersConfig, OAuthProviderConfig, PasskeyProviderConfig, PasswordProviderConfig } from "../types.js";
/**
 * Reducer function to extract the OAuth providers
 *
 * @internal
 * @param {ProvidersConfig[]} providers
 * @returns {Record<string, OAuthProviderConfig>}
 */
export declare function getOAuthProviders(providers: ProvidersConfig[]): Record<string, OAuthProviderConfig>;
/**
 * Function to get the Passkey provider
 *
 * @export
 * @param {ProvidersConfig[]} providers
 * @returns {(PasskeyProviderConfig | null)}
 */
export declare function getPasskeyProvider(providers: ProvidersConfig[]): PasskeyProviderConfig | null;
/**
 * Function to get the Password provider
 *
 * @internal
 */
export declare function getPasswordProvider(providers: ProvidersConfig[]): PasswordProviderConfig | null;
//# sourceMappingURL=utils.d.ts.map