import type { OIDCProviderConfig, OAuthBaseProviderConfig } from "../../types.js";
interface OktaAuthConfig extends OAuthBaseProviderConfig {
    domain: string;
}
declare function OktaAuthProvider(config: OktaAuthConfig): OIDCProviderConfig;
export default OktaAuthProvider;
//# sourceMappingURL=okta.d.ts.map