import fs from "fs-extra"
import path from "path"
import * as logger from "@clack/prompts"
import { AUTH_PLUGIN_CONFIG_FILE } from "../utils/consts.js"
import kleur from "kleur"
import { PayloadAuthConfig } from "../config/payload-auth-config.js"

export async function preflightAuthConfigCheck(
  cwd: string,
  configFile: string,
) {
  if (!fs.existsSync(path.resolve(cwd, configFile))) {
    logger.log.error(
      `Failed to locate ${kleur.cyan(AUTH_PLUGIN_CONFIG_FILE)} file, it is required to proceed further. \nTry running ${kleur.green().bold("payload-auth init")} to initialize project setup`,
    )
    process.exit(1)
  }
}

export async function preflightPluginFileCheck(
  cwd: string,
  config: PayloadAuthConfig,
) {
  if (
    !config.paths["plugins"] ||
    !fs.existsSync(path.resolve(cwd, config.paths["plugins"]))
  ) {
    logger.log.error(
      `Failed to locate ${kleur.cyan("payload-auth.ts")} file. \nTry running ${kleur.green().bold("payload-auth init")} to initialize project setup`,
    )
    process.exit(1)
  }
}

export async function preflightAdminAccountsFileCheck(
  cwd: string,
  config: PayloadAuthConfig,
) {
  if (
    !config.paths["admin"]["accountsCollection"] ||
    !fs.existsSync(
      path.resolve(cwd, config.paths["admin"]["accountsCollection"]),
    )
  ) {
    logger.log.error(
      `Failed to locate Accounts collection file. \nTry running ${kleur.green().bold("payload-auth init")} to initialize project setup`,
    )
    process.exit(1)
  }
}
