export const ErrorKind = {
  NotFound: "NotFound",
  InternalServer: "InternalServer",
  BadRequest: "BadRequest",
  Unauthorized: "Unauthorized",
  UnAuthenticated: "Unauthenticated",
} as const

export interface PluginError {
  message: string
  kind: (typeof ErrorKind)[keyof typeof ErrorKind]
}
