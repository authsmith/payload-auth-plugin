import { Command } from "commander"
import * as logger from "@clack/prompts"
import * as v from "valibot"
import { AUTH_PLUGIN_CONFIG_FILE, AUTH_PROVIDERS } from "../utils/consts.js"
import {
  preflightAuthConfigCheck,
  preflightPluginFileCheck,
} from "../preflights/add.js"
import fs from "fs-extra"
import { PayloadAuthConfig } from "../config/payload-auth-config.js"
import { addAdminProviders } from "../config/update-auth-plugin.js"

const addOptionsSchema = v.object({
  cwd: v.string(),
  authPluginConfig: v.string(),
})

export const addCommand = new Command()
  .name("add")
  .description("Add 3rd party authentication providers")

addCommand
  .command("providers")
  .description("Add auth providers")
  .option(
    "-c, --cwd <cwd>",
    "the working directory. Defaults to the current directory.",
    process.cwd(),
  )
  .option(
    "-C, --authPluginConfig <authPluginConfig>",
    `the path to ${AUTH_PLUGIN_CONFIG_FILE}. Defaults to the ${AUTH_PLUGIN_CONFIG_FILE}.`,
    AUTH_PLUGIN_CONFIG_FILE,
  )
  .action(async (incomingOptions) => {
    try {
      const options = v.parse(addOptionsSchema, incomingOptions)

      // Pre-Flights
      await preflightAuthConfigCheck(options.cwd, options.authPluginConfig)

      const authPluginConfig = (await fs.readJSON(
        options.authPluginConfig,
      )) as PayloadAuthConfig

      await preflightPluginFileCheck(options.cwd, authPluginConfig)

      const pluginType = await logger.select({
        message: "Which plugin you want to add the provider for?",
        options: [
          {
            label: "Admin authentication plugin",
            hint: "This plugin is used for implementing authentication only to the Admin of Payload project.",
            value: "admin",
          },
          {
            label: "App authentication plugin",
            hint: "This plugin is used for implementing authentication only to the frontend of Payload project.",
            value: "app",
          },
        ],
      })

      if (
        (pluginType === "admin" && !authPluginConfig.admin) ||
        (pluginType === "app" && !authPluginConfig.app)
      ) {
        logger.log.error(
          "Selected plugin is not installed. Cannot proceed further.",
        )
        process.exit(1)
      }

      if (pluginType === "admin") {
        await addAdminProviders(options.cwd, authPluginConfig)
      }
    } catch (error) {
      console.log(error)
      logger.log.error("Something is not right. Try again")
    }
  })
