import path from "path"
import { AUTH_PLUGIN_CONFIG_FILE } from "../utils/consts.js"
import fs from "fs-extra"
import * as logger from "@clack/prompts"

export interface PayloadAuthConfig {
  paths: Record<string, any>
  admin: boolean
  app: boolean
}

export async function createPayloadAuthConfig(
  cwd: string,
  config: PayloadAuthConfig,
) {
  const configFile = path.resolve(cwd, AUTH_PLUGIN_CONFIG_FILE)
  if (fs.existsSync(configFile)) {
    logger.log.warn(
      `Looks like the ${AUTH_PLUGIN_CONFIG_FILE} already exists. Removing it!`,
    )
    fs.removeSync(configFile)
  }
  logger.intro("Creating a new config file.")
  await fs.createFile(configFile)
  await fs.writeFile(configFile, JSON.stringify(config))
  logger.log.success("Successfully created a new config file.")
}
