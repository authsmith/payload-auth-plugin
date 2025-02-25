import { execa } from "execa"
import { getPackageManager } from "./pkg-manager.js"
import * as logger from "@clack/prompts"

const DEPENDENCIES = ["payload-auth-plugin@latest"]

export async function installDeps(cwd: string) {
  const packageManager = await getPackageManager(cwd)
  const installDeps = logger.spinner()
  installDeps.start(`Installing required dependencies....`)

  await execa(
    packageManager,
    [packageManager === "npm" ? "install" : "add", ...DEPENDENCIES],
    {
      cwd,
    },
  )
  installDeps.stop()
  logger.log.success("Successfully installed all required dependencies.")
}
