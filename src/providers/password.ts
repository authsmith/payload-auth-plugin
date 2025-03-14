import { PasswordProviderConfig } from "../types.js"

function PasswordProvider(): PasswordProviderConfig {
  return {
    id: "password",
    kind: "password",
  }
}
export default PasswordProvider
