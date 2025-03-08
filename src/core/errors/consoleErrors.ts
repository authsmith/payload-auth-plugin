class PluginError extends Error {
  constructor(message: string, cause?: string) {
    super(message)
    this.name = "PAYLOAD_AUTH_PLUGIN_ERROR"
    this.message = message
    this.cause = cause
    this.stack = ""
  }
}
export class InvalidServerURL extends PluginError {
  constructor() {
    super(
      "Missing or invalid server URL. Please set serverURL in your Payload config",
    )
  }
}
export class InvalidProvider extends PluginError {
  constructor() {
    super("Invalid Provider")
  }
}

export class ProviderAlreadyExists extends PluginError {
  constructor() {
    super("Duplicate provider found")
  }
}

export class InvalidOAuthAlgorithm extends PluginError {
  constructor() {
    super(
      "Invalid OAuth Algorithm. Plugin only support OIDC and OAuth2 algorithms",
    )
  }
}

export class InvalidOAuthResource extends PluginError {
  constructor() {
    super("Invalid resource request. Check docs before initiating requests")
  }
}

export class MissingOrInvalidSession extends PluginError {
  constructor() {
    super("Missing or invalid session.")
  }
}

export class MissingOrInvalidParams extends PluginError {
  constructor() {
    super("Missing or invalid params")
  }
}

export class AuthenticationFailed extends PluginError {
  constructor() {
    super("Failed to authenticate")
  }
}

export class UserNotFound extends PluginError {
  constructor() {
    super("User not found")
  }
}

export class InvalidCredentials extends PluginError {
  constructor() {
    super("Invalid credentials")
  }
}

export class MissingUsersCollection extends PluginError {
  constructor() {
    super("Missing users collection")
  }
}

export class InvalidPasskeyRequest extends PluginError {
  constructor() {
    super("Invalid or missing request")
  }
}

export class InvalidCollectionSlug extends PluginError {
  constructor() {
    super("Missing or invalid collection slug")
  }
}

export class MissingCollections extends PluginError {
  constructor() {
    super("Missing collections")
  }
}

export class MissingEnv extends PluginError {
  constructor(env: string) {
    super("Missing ENV " + env)
  }
}
