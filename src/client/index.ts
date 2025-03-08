import { adminSignin, appSignin } from "./signin.js"
interface BaseClientOptions {
  baseURL: string
}

interface AppClientOptions extends BaseClientOptions {
  name: string
}

export function appClient(options: AppClientOptions) {
  return {
    signin: () => appSignin(options),
    signup: () => {},
    resetPassword: () => {},
    forgotPassword: () => {},
  }
}

export function adminClient(options: BaseClientOptions) {
  return {
    signin: () => adminSignin({ baseURL: options.baseURL }),
  }
}
