import { PasskeyProviderConfig } from "../types.js"

function PasskeyAuthProvider(): PasskeyProviderConfig {
  return {
    id: "passkey",
    kind: "passkey",
  }
}

export default PasskeyAuthProvider
