import { APIError } from "payload"

export class AuthAPIError extends APIError {
  constructor(
    message: string,
    status?: number,
    data?: Record<string, unknown> | undefined,
  ) {
    super(message, status ?? 400, data, true)
  }
}

export class MissingEmailAPIError extends AuthAPIError {
  constructor() {
    super("Missing email. Email is required")
  }
}

export class EmailNotFoundAPIError extends AuthAPIError {
  constructor() {
    super("Now user found with this email", 404)
  }
}

export class PasskeyVerificationAPIError extends AuthAPIError {
  constructor() {
    super("Passkey verification failed", 403)
  }
}
