import { SuccessKind, type AuthPluginOutput } from "../types.js"

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

  if (response.redirected) {
    window.location.href = response.url
    return {
      data: {},
      message: "Redirecting user...",
      kind: SuccessKind.Retrieved,
      isError: false,
      isSuccess: true,
    }
  }
  const { data, message, kind, isError, isSuccess } =
    (await response.json()) as AuthPluginOutput
  return {
    data,
    message,
    kind,
    isError,
    isSuccess,
  }
}

export interface PasswordSignupPayload {
  email: string
  password: string
  allowAutoSignin?: boolean
  userInfo?: Record<string, unknown>
}

export const passwordSignup = async (
  opts: BaseOptions,
  payload: PasswordSignupPayload,
): Promise<AuthPluginOutput> => {
  const response = await fetch(`/api/${opts.name}/auth/signup`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
  if (response.redirected) {
    window.location.href = response.url
    return {
      data: {},
      message: "Redirecting user...",
      kind: SuccessKind.Retrieved,
      isError: false,
      isSuccess: true,
    }
  }
  const { data, message, kind, isError, isSuccess } =
    (await response.json()) as AuthPluginOutput
  return {
    data,
    message,
    kind,
    isError,
    isSuccess,
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

  const { data, message, kind, isError, isSuccess } =
    (await response.json()) as AuthPluginOutput
  return {
    data,
    message,
    kind,
    isError,
    isSuccess,
  }
}

export interface PasswordRecoverPayload {
  email: string
  password: string
  code: string
}
export const recoverPassword = async (
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

  const { data, message, kind, isError, isSuccess } =
    (await response.json()) as AuthPluginOutput
  return {
    data,
    message,
    kind,
    isError,
    isSuccess,
  }
}

export interface PasswordResetPayload {
  email: string
  password: string
}
export const resetPassword = async (
  opts: BaseOptions,
  payload: PasswordResetPayload,
): Promise<AuthPluginOutput> => {
  const response = await fetch(`/api/${opts.name}/auth/reset-password`, {
    method: "POST",
    body: JSON.stringify(payload),
  })

  const { data, message, kind, isError, isSuccess } =
    (await response.json()) as AuthPluginOutput
  return {
    data,
    message,
    kind,
    isError,
    isSuccess,
  }
}
