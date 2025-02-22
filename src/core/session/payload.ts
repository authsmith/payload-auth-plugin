import { BasePayload, getCookieExpiration } from "payload"
import { UserNotFound } from "../errors/consoleErrors.js"
import jwt from "jsonwebtoken"
import { AccountInfo } from "../../types.js"
import { hashCode } from "../utils/hash.js"

type Collections = {
  accountsCollectionSlug: string
  usersCollectionSlug: string
}

export class PayloadSession {
  readonly #collections: Collections
  readonly #successPath: string | undefined
  readonly #allowSignUp: boolean
  constructor(
    collections: Collections,
    allowSignUp?: boolean,
    successPath?: string,
  ) {
    this.#collections = collections
    this.#allowSignUp = !!allowSignUp
    this.#successPath = successPath
  }
  async #upsertAccount(
    accountInfo: AccountInfo,
    scope: string,
    issuerName: string,
    payload: BasePayload,
  ) {
    let userID: string | number

    const userQueryResults = await payload.find({
      collection: this.#collections.usersCollectionSlug,
      where: {
        email: {
          equals: accountInfo.email,
        },
      },
    })

    if (userQueryResults.docs.length === 0) {
      if (!this.#allowSignUp) {
        throw new UserNotFound()
      }

      const newUser = await payload.create({
        collection: this.#collections.usersCollectionSlug,
        data: {
          email: accountInfo.email,
          emailVerified: true,
          password: hashCode(accountInfo.email + payload.secret).toString(),
        },
      })
      userID = newUser.id
    } else {
      userID = userQueryResults.docs[0].id as string
    }

    const accounts = await payload.find({
      collection: this.#collections.accountsCollectionSlug,
      where: {
        sub: { equals: accountInfo.sub },
      },
    })
    const data: Record<string, unknown> = {
      scope,
      name: accountInfo.name,
      picture: accountInfo.picture,
    }

    // // Add passkey payload for auth
    if (issuerName === "Passkey" && accountInfo.passKey) {
      data["passkey"] = {
        ...accountInfo.passKey,
      }
    }

    if (accounts.docs.length > 0) {
      await payload.update({
        collection: this.#collections.accountsCollectionSlug,
        where: {
          id: {
            equals: accounts.docs[0].id,
          },
        },
        data,
      })
    } else {
      data["sub"] = accountInfo.sub
      data["issuerName"] = issuerName
      data["user"] = userID
      await payload.create({
        collection: this.#collections.accountsCollectionSlug,
        data,
      })
    }
    return userID
  }
  async createSession(
    accountInfo: AccountInfo,
    scope: string,
    issuerName: string,
    payload: BasePayload,
  ) {
    const userID = await this.#upsertAccount(
      accountInfo,
      scope,
      issuerName,
      payload,
    )

    const fieldsToSign = {
      id: userID,
      email: accountInfo.email,
      collection: this.#collections.usersCollectionSlug,
    }

    const cookieExpiration = getCookieExpiration({
      seconds: 7200,
    })

    const token = jwt.sign(fieldsToSign, payload.secret, {
      expiresIn: new Date(cookieExpiration).getTime(),
    })

    const cookies: string[] = []
    cookies.push(
      `${payload.config.cookiePrefix!}-token=${token};Path=/;HttpOnly;SameSite=lax;Expires=${cookieExpiration.toString()}`,
    )
    const expired = "Thu, 01 Jan 1970 00:00:00 GMT"
    cookies.push(
      `__session-oauth-state=; Path=/; HttpOnly; SameSite=Lax; Expires=${expired}`,
    )
    cookies.push(
      `__session-oauth-nonce=; Path=/; HttpOnly; SameSite=Lax; Expires=${expired}`,
    )
    cookies.push(
      `__session-code-verifier=; Path=/; HttpOnly; SameSite=Lax; Expires=${expired}`,
    )
    cookies.push(
      `__session-webpk-challenge=; Path=/; HttpOnly; SameSite=Lax; Expires=${expired}`,
    )

    let redirectURL = payload.getAdminURL()
    if (this.#successPath) {
      const newURL = new URL(payload.getAdminURL())
      newURL.pathname = this.#successPath
      redirectURL = newURL.toString()
    }
    const res = new Response(null, {
      status: 302,
      headers: {
        Location: redirectURL,
      },
    })

    cookies.forEach((cookie) => {
      res.headers.append("Set-Cookie", cookie)
    })
    return res
  }
}
