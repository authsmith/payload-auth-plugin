import { AuthPluginOutput } from "../types.js"
import * as qs from "qs-esm"

interface BaseOptions {
  name: string
}
interface QueryOptions {
  fields?: string[] | undefined
}
export const getCurrentUser = async (
  options: BaseOptions,
  queryOpts?: QueryOptions | undefined,
) => {
  const base = process.env.NEXT_PUBLIC_SERVER_URL
  let query = ""
  if (queryOpts) {
    query = "?"
    if (queryOpts.fields) {
      query += qs.stringify({ fields: queryOpts.fields })
    }
  }
  const response = await fetch(`${base}/api/${options.name}/session${query}`)
  const { message, kind, data } = (await response.json()) as AuthPluginOutput
  return {
    message,
    kind,
    data,
  }
}
