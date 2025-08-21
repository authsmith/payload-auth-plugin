import * as jose from "jose"
import type { JsonObject, PayloadRequest, TypeWithID } from "payload"
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
import { removeExpiredSessions } from "../../utils/session.js"
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
  } = account
  const { payload } = request

  const email = _email.toLowerCase()

  const userRecords = await payload.find({
    collection: collections.usersCollection,
    where: {
      email: {
        equals: email,
      },
    },
  })
  let userRecord: JsonObject & TypeWithID
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
    return new UserNotFoundAPIError()
  }

  const data: Record<string, unknown> = {
    scope,
    name: name,
    picture: picture,
    issuerName: issuer,
    access_token,
    refresh_token,
    expires_in,
  }

  const accountRecords = await payload.find({
    collection: collections.accountsCollection,
    where: {
      sub: { equals: sub },
    },
  })
  if (accountRecords.docs && accountRecords.docs.length === 1) {
    await payload.update({
      collection: collections.accountsCollection,
      id: accountRecords.docs[0].id,
      data,
    })
  } else {
    data.sub = sub
    data.user = userRecord.id
    await payload.create({
      collection: collections.accountsCollection,
      data,
    })
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
    if (!userRecord["sessions"]?.length) {
      userRecord["sessions"] = [session]
    } else {
      userRecord.sessions = removeExpiredSessions(userRecord.sessions)
      userRecord.sessions.push(session)
    }
    await payload.db.updateOne({
      id: userRecord.id,
      collection: collections.usersCollection,
      data: userRecord,
      req: request,
      returning: false,
    })
  }
  const cookieName = useAdmin
    ? `${payload.config.cookiePrefix}-token`
    : `__${pluginType}-${APP_COOKIE_SUFFIX}`
  cookies = [
    ...(await createSessionCookies(
      cookieName,
      secret,
      {
        id: userRecord.id,
        email: email,
        sid: sessionID,
        collection: collections.usersCollection,
      },
      useAdmin ? collectionConfig?.auth.tokenExpiration : undefined,
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
