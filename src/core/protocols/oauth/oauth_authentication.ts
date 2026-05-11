import * as jose from "jose"
import type {
  BasePayload,
  JsonObject,
  PayloadRequest,
  SanitizedCollectionConfig,
  TypeWithID,
} from "payload"
import { APP_COOKIE_SUFFIX } from "../../../constants.js"
import {
  MissingCollection,
  UserNotFoundAPIError,
} from "../../errors/apiErrors.js"
import {
  createSessionCookies,
  invalidateOAuthCookies,
} from "../../utils/cookies.js"

import { v4 as uuid } from "uuid"
import { traverseFields } from "../../utils/collection.js"
import { removeExpiredSessions } from "../../utils/session.js"


async function _createUser({ email, name, collections, payload, allowOAuthAutoSignUp }: {
  email: string, name: string, collections: {
    usersCollection: string
    accountsCollection: string
  }, payload: BasePayload, allowOAuthAutoSignUp: boolean
}) {

  const userRecords = await payload.find({
    collection: collections.usersCollection,
    where: {
      email: {
        equals: email,
      },
    },
  })
  let userRecord: (JsonObject & TypeWithID) | null
  if (userRecords.docs.length === 1) {
    userRecord = userRecords.docs[0]
  } else if (allowOAuthAutoSignUp) {
    const data: Record<string, unknown> = {
      email,
      name,
    }
    const hasAuthEnabled = Boolean(
      payload.collections[collections.usersCollection].config.auth,
    )
    if (hasAuthEnabled) {
      data.password = jose.base64url.encode(
        crypto.getRandomValues(new Uint8Array(16)),
      )
    }
    const userRecords = await payload.create({
      collection: collections.usersCollection,
      data,
    })
    userRecord = userRecords
  } else {
    return null
  }
  return userRecord
}
export async function OAuthAuthentication(
  pluginType: string,
  collections: {
    usersCollection: string
    accountsCollection: string
  },
  allowOAuthAutoSignUp: boolean,
  useAdmin: boolean,
  secret: string,
  request: PayloadRequest,
  successRedirectPath: string,
  errorRedirectPath: string,
  account: {
    email: string
    sub: string
    name: string
    scope: string
    issuer: string
    picture?: string | undefined
    access_token: string
    refresh_token?: string
    expires_in?: number
    claims: Record<string, unknown>
  },
): Promise<Response> {
  const {
    email: _email,
    sub,
    name,
    scope,
    issuer,
    picture,
    access_token,
    refresh_token,
    expires_in,
    claims,
  } = account
  const { payload } = request

  let userRecord: (JsonObject & TypeWithID) | null = null
  const accountRecords = await payload.find({
    collection: collections.accountsCollection,
    where: {
      sub: { equals: sub },
    },
  })
  if (accountRecords.docs && accountRecords.docs.length === 1) {
    const accountUserRecords = await payload.find({
      collection: collections.usersCollection,
      where: {
        id: { equals: typeof accountRecords.docs[0].user === "string" ? accountRecords.docs[0].user : accountRecords.docs[0].user.id }
      }
    })
    if (accountUserRecords.docs.length === 0) {
      userRecord = await _createUser({
        email: _email.toLowerCase(),
        name,
        payload,
        collections,
        allowOAuthAutoSignUp
      })
    } else {
      userRecord = accountUserRecords.docs[0]
    }
    await payload.update({
      collection: collections.accountsCollection,
      id: accountRecords.docs[0].id,
      data: {
        scope,
        name: name,
        picture: picture,
        issuerName: issuer,
        access_token,
        refresh_token,
        expires_in,
      },
    })

  } else {
    userRecord = await _createUser({
      email: _email.toLowerCase(),
      name,
      payload,
      collections,
      allowOAuthAutoSignUp
    })
    if (userRecord) {
      await payload.create({
        collection: collections.accountsCollection,
        data: {
          scope,
          name: name,
          picture: picture,
          issuerName: issuer,
          access_token,
          refresh_token,
          expires_in,
          sub,
          user: userRecord.id
        },
      })
    }
  }
  if (!userRecord) {
    return new UserNotFoundAPIError()
  }
  let cookies: string[] = []

  const collectionConfig = payload.config.collections.find(
    (collection) => collection.slug === collections.usersCollection,
  )
  if (!collectionConfig) {
    return new MissingCollection()
  }

  const sessionID = collectionConfig?.auth.useSessions ? uuid() : null

  if (collectionConfig?.auth.useSessions) {
    const now = new Date()
    const tokenExpInMs = collectionConfig.auth.tokenExpiration * 1000
    const expiresAt = new Date(now.getTime() + tokenExpInMs)
    const session = { id: sessionID, createdAt: now, expiresAt }

    if (!userRecord?.sessions?.length) {
      userRecord.sessions = [session]
    } else {
      userRecord.sessions = removeExpiredSessions(userRecord.sessions)
      userRecord.sessions.push(session)
    }
    userRecord.claims = claims
    await payload.update({
      where: {
        id: {
          equals: userRecord.id
        }
      },
      collection: collections.usersCollection,
      data: userRecord,
    })
  }
  const cookieResult = {
    id: userRecord.id,
    email: _email.toLowerCase(),
    sid: sessionID,
    collection: collections.usersCollection,
  }
  traverseFields({
    data: userRecord,
    "fields": collectionConfig.fields,
    result: cookieResult
  })
  const cookieName = useAdmin
    ? `${payload.config.cookiePrefix}-token`
    : `__${pluginType}-${APP_COOKIE_SUFFIX}`
  cookies = [
    ...(await createSessionCookies(
      cookieName,
      secret,
      cookieResult,
      useAdmin ? collectionConfig?.auth.tokenExpiration : undefined,
      collectionConfig.auth as SanitizedCollectionConfig["auth"] || false,
    )),
  ]
  cookies = invalidateOAuthCookies(cookies)
  const successRedirectionURL = new URL(
    `${payload.config.serverURL}${successRedirectPath}`,
  )
  const res = new Response(null, {
    status: 302,
    headers: {
      Location: successRedirectionURL.href,
    },
  })

  for (const c of cookies) {
    res.headers.append("Set-Cookie", c)
  }

  return res
}
