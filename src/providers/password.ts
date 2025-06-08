import type { PasswordProviderConfig } from "../types.js"

type PasswordProviderOptions = {
  /**
   * Email templates
   */
  emailTemplates: {
    forgotPassword: any
  }
}

function PasswordProvider(
  options: PasswordProviderOptions,
): PasswordProviderConfig {
  return {
    id: "password",
    kind: "password",
    ...options,
  }
}
export default PasswordProvider
