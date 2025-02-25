import path from "path"
import fs from "fs-extra"
import { accountsCollection } from "./collections/accounts.js"
import * as logger from "@clack/prompts"
import { PayloadAuthConfig } from "./payload-auth-config.js"
import { ACCOUNTS_COLLECTION_FILE } from "../utils/consts.js"

export async function addAccountsCollection(
  cwd: string,
  payloadAuthConfig: PayloadAuthConfig,
) {
  const collectionsDir = (await logger.text({
    message: "Where is the Payload collections directory located?",
    placeholder: "src/collections",
    defaultValue: "src/collections",
  })) as string

  const accountsCollectionSlug = (await logger.text({
    message: "What should be the slug for the accounts collection?",
    placeholder: "accounts",
    defaultValue: "accounts",
  })) as string

  const collectionCheck = logger.spinner()
  collectionCheck.start("Checking for collections...")

  if (
    fs.existsSync(path.resolve(cwd, collectionsDir, ACCOUNTS_COLLECTION_FILE))
  ) {
    collectionCheck.stop("Looks like Accounts collection already exists.")

    const overwriteAccountsCollection = (await logger.confirm({
      message: "Do you want to ovewrite the existing Accounts collection?",
    })) as boolean

    if (overwriteAccountsCollection) {
      fs.removeSync(path.resolve(cwd, collectionsDir, ACCOUNTS_COLLECTION_FILE))
    } else {
      logger.log.error("Failed to create Accounts collection.")
      process.exit(1)
    }
  }

  await fs.createFile(
    path.resolve(cwd, collectionsDir, ACCOUNTS_COLLECTION_FILE),
  )

  await fs.writeFile(
    path.resolve(cwd, collectionsDir, ACCOUNTS_COLLECTION_FILE),
    accountsCollection(accountsCollectionSlug),
  )
  collectionCheck.stop()

  payloadAuthConfig.paths.admin.accountsCollection = path.join(
    collectionsDir,
    ACCOUNTS_COLLECTION_FILE,
  )

  logger.log.success("Successfully created Accounts collection")
}
