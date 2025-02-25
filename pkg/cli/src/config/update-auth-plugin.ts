import { transform } from "../transformers/index.js"
import path from "path"
import { transformProvider } from "../transformers/provider.js"
import * as logger from "@clack/prompts"
import { AUTH_PROVIDERS } from "../utils/consts.js"
import fs from "fs-extra"
import { PayloadAuthConfig } from "../config/payload-auth-config.js"

export async function addAdminProviders(
  cwd: string,
  config: PayloadAuthConfig,
) {
  const source = await fs.readFile(
    path.resolve(cwd, config.paths["plugins"]),
    "utf-8",
  )

  const selectedAuthProviders = (await logger.multiselect({
    message: "Please select the auth providers you would like to add:",
    options: AUTH_PROVIDERS,
  })) as string[]

  const transformedPlugin = await transform(
    {
      filename: "payload-auth.ts",
      raw: source,
      pluginType: "adminAuthPlugin",
      providers: selectedAuthProviders,
    },
    [transformProvider],
  )

  await fs.writeFile(
    path.resolve(cwd, config.paths["plugins"]),
    transformedPlugin,
    "utf-8",
  )

  logger.log.success("Successfully Updated providers!!!")
}
