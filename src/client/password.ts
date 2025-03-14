import { AuthPluginOutput } from "../types.js"

interface BaseOptions {
  name: string
}

export interface PasswordSigninPayload {
  email: string
  password: string
}
export const passwordSignin = async (
  opts: BaseOptions,
  payload: PasswordSigninPayload,
): Promise<AuthPluginOutput> => {
  const response = await fetch(`/api/${opts.name}/auth/signin`, {
    method: "POST",
    body: JSON.stringify(payload),
  })

  const { data, message, kind } = (await response.json()) as AuthPluginOutput
  return {
    data,
    message,
    kind,
  }
}

export interface PasswordSignupPayload {
  email: string
  password: string
  allowAutoSignin?: boolean
  profile?: Record<string, unknown>
}

export const passwordSignup = async (
  opts: BaseOptions,
  payload: PasswordSignupPayload,
) => {
  const response = await fetch(`/api/${opts.name}/auth/signup`, {
    method: "POST",
    body: JSON.stringify(payload),
  })

  const { data, message, kind } = (await response.json()) as AuthPluginOutput
  return {
    data,
    message,
    kind,
  }
}

export interface ForgotPasswordPayload {
  email: string
}
export const forgotPassword = async (
  opts: BaseOptions,
  payload: ForgotPasswordPayload,
): Promise<AuthPluginOutput> => {
  const response = await fetch(
    `/api/${opts.name}/auth/forgot-password?stage=init`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  )

  const { data, message, kind } = (await response.json()) as AuthPluginOutput
  return {
    data,
    message,
    kind,
  }
}

export interface PasswordRecoverPayload {
  email: string
  password: string
  code: string
}
export const passwordRecover = async (
  opts: BaseOptions,
  payload: PasswordRecoverPayload,
): Promise<AuthPluginOutput> => {
  const response = await fetch(
    `/api/${opts.name}/auth/forgot-password?stage=verify`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  )

  const { data, message, kind } = (await response.json()) as AuthPluginOutput
  return {
    data,
    message,
    kind,
  }
}

export interface PasswordResetPayload {
  email: string
  password: string
}
export const passwordReset = async (
  opts: BaseOptions,
  payload: PasswordResetPayload,
): Promise<AuthPluginOutput> => {
  const response = await fetch(`/api/${opts.name}/auth/reset-password`, {
    method: "POST",
    body: JSON.stringify(payload),
  })

  const { data, message, kind } = (await response.json()) as AuthPluginOutput
  return {
    data,
    message,
    kind,
  }
}
