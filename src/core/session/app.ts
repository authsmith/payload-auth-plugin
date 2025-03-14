import { BasePayload, JsonObject, PayloadRequest, TypeWithID } from "payload"
import { AccountInfo, AuthenticationStrategy } from "../../types.js"
import { UserNotFoundAPIError } from "../errors/apiErrors.js"
import {
  createSessionCookies,
  invalidateOAuthCookies,
} from "../utils/cookies.js"
import { sessionResponse } from "../utils/session.js"
import { APP_COOKIE_SUFFIX } from "../../constants.js"

export class AppSession {
  constructor(
    private appName: string,
    private collections: {
      usersCollection: string
      accountsCollection: string
    },
    private allowAutoSignUp: boolean,
    private authenticationStrategy: AuthenticationStrategy,
    private secret: string,
  ) {}

  private async oauthAccountMutations(
    userId: string,
    oauthAccountInfo: AccountInfo,
    scope: string,
    issuerName: string,
    payload: BasePayload,
  ): Promise<JsonObject & TypeWithID> {
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
      return await payload.update({
        collection: this.collections.accountsCollection,
        id: accountRecords.docs[0].id,
        data,
      })
    } else {
      data["sub"] = oauthAccountInfo.sub
      data["user"] = userId
      return await payload.create({
        collection: this.collections.accountsCollection,
        data,
      })
    }
  }

  async oauthSessionCallback(
    oauthAccountInfo: AccountInfo,
    scope: string,
    issuerName: string,
    request: PayloadRequest,
  ) {
    const { payload } = request
    const userRecords = await payload.find({
      collection: this.collections.usersCollection,
      where: {
        email: {
          equals: oauthAccountInfo.email,
        },
      },
    })
    let userRecord: JsonObject & TypeWithID
    if (userRecords.docs.length === 1) {
      userRecord = userRecords.docs[0]
    } else if (this.allowAutoSignUp) {
      const userRecords = await payload.create({
        collection: this.collections.usersCollection,
        data: {
          email: oauthAccountInfo.email,
        },
      })
      userRecord = userRecords
    } else {
      throw new UserNotFoundAPIError()
    }
    await this.oauthAccountMutations(
      userRecord["id"] as string,
      oauthAccountInfo,
      scope,
      issuerName,
      payload,
    )

    let cookies: string[] = []

    if (this.authenticationStrategy === "Cookie") {
      cookies = [
        ...(await createSessionCookies(
          `__${this.appName}-${APP_COOKIE_SUFFIX}`,
          this.secret,
          {
            id: userRecord["id"],
            email: oauthAccountInfo.email,
            collection: this.collections.usersCollection,
          },
        )),
      ]
      cookies = invalidateOAuthCookies(cookies)
    }

    return sessionResponse(cookies)
  }

  async passwordSessionCallback(
    user: Pick<AccountInfo, "email"> & { id: string },
  ) {
    let cookies: string[] = []

    if (this.authenticationStrategy === "Cookie") {
      cookies = [
        ...(await createSessionCookies(
          `__${this.appName}-${APP_COOKIE_SUFFIX}`,
          this.secret,
          {
            id: user.id,
            email: user.email,
            collection: this.collections.usersCollection,
          },
        )),
      ]
      cookies = invalidateOAuthCookies(cookies)
    }

    return sessionResponse(cookies)
  }
}
