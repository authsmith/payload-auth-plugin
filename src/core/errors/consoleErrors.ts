class AuthError extends Error {
  constructor(message: string, cause?: string) {
    super(message)
    this.name = "PAYLOAD_AUTH_PLUGIN_ERROR"
    this.message = message
    this.cause = cause
    this.stack = ""
  }
}
export class InvalidServerURL extends AuthError {
  constructor() {
    super(
      "Missing or invalid server URL. Please set serverURL in your Payload config"
    )
  }
}
export class InvalidProvider extends AuthError {
  constructor() {
    super("Invalid Provider")
  }
}

export class ProviderAlreadyExists extends AuthError {
  constructor() {
    super("Duplicate provider found")
  }
}

export class InvalidOAuthAlgorithm extends AuthError {
  constructor() {
    super(
      "Invalid OAuth Algorithm. Plugin only support OIDC and OAuth2 algorithms"
    )
  }
}

export class InvalidOAuthResource extends AuthError {
  constructor() {
    super("Invalid resource request. Check docs before initiating requests")
  }
}

export class MissingOrInvalidSession extends AuthError {
  constructor() {
    super("Missing or invalid session.")
  }
}

export class MissingOrInvalidParams extends AuthError {
  constructor() {
    super("Missing or invalid params")
  }
}

export class AuthenticationFailed extends AuthError {
  constructor() {
    super("Failed to authenticate")
  }
}

export class UserNotFound extends AuthError {
  constructor() {
    super("User not found")
  }
}

export class InvalidCredentials extends AuthError {
  constructor() {
    super("Invalid credentials")
  }
}

export class MissingUsersCollection extends AuthError {
  constructor() {
    super("Missing users collection")
  }
}

export class MissingCollectionError extends AuthError {
  constructor(message: string) {
    super(message)
  }
}

export class InvalidPasskeyRequest extends AuthError {
  constructor() {
    super("Invalid or missing request")
  }
}
