import { ProviderAlreadyExists } from "../core/errors/consoleErrors.js";
/**
 * Reducer function to extract the OAuth providers
 *
 * @internal
 * @param {ProvidersConfig[]} providers
 * @returns {Record<string, OAuthProviderConfig>}
 */
export function getOAuthProviders(providers) {
    const records = {};
    providers.map((provider) => {
        if (records[provider.id]) {
            throw new ProviderAlreadyExists();
        }
        if (provider.kind === "oauth") {
            records[provider.id] = provider;
        }
    });
    return records;
}
/**
 * Function to get the Passkey provider
 *
 * @export
 * @param {ProvidersConfig[]} providers
 * @returns {(PasskeyProviderConfig | null)}
 */
export function getPasskeyProvider(providers) {
    const passkeyProvider = providers.find((provider) => provider.kind === "passkey");
    if (passkeyProvider) {
        return passkeyProvider;
    }
    return null;
}
/**
 * Function to get the Password provider
 *
 * @internal
 */
export function getPasswordProvider(providers) {
    const provider = providers.find((provider) => provider.kind === "password");
    if (provider) {
        return provider;
    }
    return null;
}
//# sourceMappingURL=utils.js.map