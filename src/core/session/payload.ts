import { BasePayload, getCookieExpiration } from "payload"
import { UserNotFound } from "../errors/consoleErrors.js"
import * as jwt from "jsonwebtoken"
import { AccountInfo } from "../../types.js"
import { hashCode } from "../utils/hash.js"

type Collections = {
  accountsCollectionSlug: string
  relationConfig: {
    fieldName: string
    relationTo: string
    collectionField: string
    hasMany: boolean
    required: boolean
    label: string
  }
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
    let relatedEntityID: string | number;
    const { relationTo, collectionField, fieldName } = this.#collections.relationConfig;

    // Query the related collection to find an entity matching the email
    const entityQueryResults = await payload.find({
      collection: relationTo,
      where: {
        [collectionField]: {
          equals: accountInfo.email,
        },
      },
    })

    if (entityQueryResults.docs.length === 0) {
      if (!this.#allowSignUp) {
        throw new UserNotFound()
      }

      // Extract name parts if available
      const nameParts = this.#extractNameParts(accountInfo.name);

      // Create a new entity in the related collection
      const newEntity = await payload.create({
        collection: relationTo,
        data: {
          [collectionField]: accountInfo.email,
          // Add name fields if they exist in the collection
          ...(nameParts.firstName ? { firstName: nameParts.firstName } : {}),
          ...(nameParts.lastName ? { lastName: nameParts.lastName } : {}),
          // Add any other required fields based on the collection
          ...(relationTo === "users" ? {
            emailVerified: true,
            password: hashCode(accountInfo.email + payload.secret).toString(),
          } : {})
        },
      })
      relatedEntityID = newEntity.id
    } else {
      relatedEntityID = entityQueryResults.docs[0].id as string
    }

    // Check if the account already exists
    const accounts = await payload.find({
      collection: this.#collections.accountsCollectionSlug,
      where: {
        sub: { equals: accountInfo.sub },
      },
    })
    
    // Extract name parts for the account record
    const nameParts = this.#extractNameParts(accountInfo.name);
    
    const data: Record<string, unknown> = {
      scope,
      name: accountInfo.name,
      picture: accountInfo.picture,
      email: accountInfo.email,
      ...(nameParts.firstName ? { firstName: nameParts.firstName } : {}),
      ...(nameParts.lastName ? { lastName: nameParts.lastName } : {})
    }

    // Add passkey payload for auth
    if (issuerName === "Passkey" && accountInfo.passKey) {
      data["passkey"] = {
        ...accountInfo.passKey,
      }
    }

    if (accounts.docs.length > 0) {
      data["sub"] = accountInfo.sub
      data["issuerName"] = issuerName
      data[fieldName] = relatedEntityID
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
      data[fieldName] = relatedEntityID
      await payload.create({
        collection: this.#collections.accountsCollectionSlug,
        data,
      })
    }
    return relatedEntityID
  }
  
  // Helper method to extract first and last name from a full name
  #extractNameParts(fullName: string): { firstName?: string; lastName?: string } {
    if (!fullName) return {};
    
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) {
      return { firstName: parts[0] };
    } else if (parts.length > 1) {
      const firstName = parts[0];
      const lastName = parts.slice(1).join(' ');
      return { firstName, lastName };
    }
    
    return {};
  }
  
  async createSession(
    accountInfo: AccountInfo,
    scope: string,
    issuerName: string,
    payload: BasePayload,
  ) {
    const relatedEntityID = await this.#upsertAccount(
      accountInfo,
      scope,
      issuerName,
      payload,
    )

    // Determine the collection to use in the JWT token
    const collectionForToken = this.#collections.relationConfig.relationTo;

    const fieldsToSign = {
      id: relatedEntityID,
      email: accountInfo.email,
      collection: collectionForToken,
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