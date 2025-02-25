#!/usr/bin/env node
import { Command } from "commander"
import { initCommand } from "./cmd/init.js"
import { addCommand } from "./cmd/add.js"

process.on("SIGINT", () => process.exit(0))
process.on("SIGTERM", () => process.exit(0))

async function main() {
  const program = new Command()
    .name("payload-auth")
    .description(
      "Adds payload-auth-plugin to your Payload project, and configures your project to implement authentication",
    )

  program.addCommand(initCommand)
  program.addCommand(addCommand)

  program.parse()
}

main()
