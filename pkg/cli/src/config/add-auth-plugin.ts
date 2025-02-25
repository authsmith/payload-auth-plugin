import fs from "fs-extra"
import { AUTH_PLUGIN_FILE, AUTH_PROVIDERS } from "../utils/consts.js"
import path from "path"
import { providersConfig } from "./auth-provider-config.js"
import kleur from "kleur"
import * as logger from "@clack/prompts"
import { PayloadAuthConfig } from "./payload-auth-config.js"

export async function addAuthPlugin(
  cwd: string,
  pluginType: string,
  payloadAuthConfig: PayloadAuthConfig,
) {
  const pluginsDir = (await logger.text({
    message: "Where is the Payload plugins directory located?",
    placeholder: "src/plugins",
    defaultValue: "src/plugins",
  })) as string

  const pluginsFile = path.resolve(cwd, pluginsDir, AUTH_PLUGIN_FILE)
  if (fs.existsSync(pluginsFile)) {
    logger.log.warn(`Looks like the ${AUTH_PLUGIN_FILE} already exists.`)
    const overwritePluginsFile = (await logger.confirm({
      message: `Do you want to overwrite the existing ${AUTH_PLUGIN_FILE} file?`,
    })) as boolean

    if (overwritePluginsFile) {
      fs.removeSync(pluginsFile)
    } else {
      logger.log.error("Failed to create the plugins file!!!")
      process.exit(1)
    }
  }

  await fs.createFile(pluginsFile)

  const selectedAuthProviders = (await logger.multiselect({
    message: "Please select the auth providers you would like to add:",
    options: AUTH_PROVIDERS,
  })) as string[]

  await fs.writeFile(pluginsFile, addPlugin(pluginType, selectedAuthProviders))

  payloadAuthConfig.paths.plugins = path.join(pluginsDir, AUTH_PLUGIN_FILE)

  logger.log.success(
    `Successfully created ${kleur.bold(path.join(pluginsDir, AUTH_PLUGIN_FILE))}, and added the plugin along with the selected providers.`,
  )
}

const addPlugin = (pluginType: string, providers: string[]) =>
  `import {${pluginType}} from "payload-auth-plugin";
import {${providers.join(", ")}} from "payload-auth-plugin/providers";

export const payloadAuthPlugins=[
  adminAuthPlugin({
    providers: [
      ${providers.map((provider) => providersConfig[provider])}
    ]
  })
]
`
