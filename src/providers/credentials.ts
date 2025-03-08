import { CredentialsProviderConfig } from "../types.js"

function CredentialsProvider(): CredentialsProviderConfig {
  return {
    id: "credentials",
    kind: "credentials",
  }
}
export default CredentialsProvider
