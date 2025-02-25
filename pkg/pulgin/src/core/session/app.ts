import { BasePayload } from "payload"
import { AccountInfo } from "../../types.js"
import { ErrorKind, PluginError } from "../../error.js"

export class AppSession {
  constructor(
    private appName: string,
    private collections: {
      usersCollection: string
      accountsCollection: string
      sessionsCollection: string
    },
    private onSuccess: (user: unknown) => void,
    private onError: (err: PluginError) => void,
    private allowAutoSignUp: boolean,
  ) {}

  private async oauthAccountMutations(
    userId: string,
    oauthAccountInfo: AccountInfo,
    scope: string,
    issuerName: string,
    payload: BasePayload,
  ) {
    const data: Record<string, unknown> = {
      scope,
      name: oauthAccountInfo.name,
      picture: oauthAccountInfo.picture,
      issuerName,
    }

    const accountRecords = await payload.find({
      collection: this.collections.accountsCollection,
      where: {
        sub: { equals: oauthAccountInfo.sub },
      },
    })

    if (accountRecords.docs && accountRecords.docs.length === 1) {
      await payload.update({
        collection: this.collections.accountsCollection,
        id: accountRecords.docs[0].id,
        data,
      })
    } else {
      data["sub"] = oauthAccountInfo.sub
      data["user"] = userId
      await payload.create({
        collection: this.collections.accountsCollection,
        data,
      })
    }
  }

  async oauthSessionCallback(
    oauthAccountInfo: AccountInfo,
    scope: string,
    issuerName: string,
    payload: BasePayload,
  ) {
    const userRecords = await payload.find({
      collection: this.collections.usersCollection,
      where: {
        email: {
          equals: oauthAccountInfo.email,
        },
      },
    })
    let userRecordID: string
    if (userRecords.docs.length === 1) {
      userRecordID = userRecords.docs[0].id as string
    } else if (this.allowAutoSignUp) {
      const userRecords = await payload.create({
        collection: this.collections.usersCollection,
        data: {
          email: oauthAccountInfo.email,
        },
      })
      userRecordID = userRecords.id as string
    } else {
      return this.onError({
        message: "User not found",
        kind: ErrorKind.NotFound,
      })
    }

    await this.oauthAccountMutations(
      userRecordID,
      oauthAccountInfo,
      scope,
      issuerName,
      payload,
    )
    return this.onSuccess(oauthAccountInfo)
  }
}
