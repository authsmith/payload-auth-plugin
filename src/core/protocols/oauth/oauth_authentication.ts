import * as jose from "jose"
import { v4 as uuid } from "uuid"
import { parseCookies } from "payload"
import type {
  JsonObject,
  PayloadRequest,
  TypeWithID,
  UserSession,
} from "payload"
import { OAuthAccountData, OAuthCollections } from "@/types"
import { APP_COOKIE_SUFFIX } from "@/constants"
import {
  UserNotFoundAPIError,
  MissingCollection,
} from "@/core/errors/apiErrors"
import {
  createSessionCookies,
  invalidateOAuthCookies,
} from "@/core/utils/cookies"
import { removeExpiredSessions } from "@/core/utils/session"

export async function OAuthAuthentication(
  pluginType: string,
  collections: OAuthCollections,
  allowOAuthAutoSignUp: boolean,
  useAdmin: boolean,
  secret: string,
  request: PayloadRequest,
  successRedirectPath: string,
  errorRedirectPath: string,
  userData: OAuthAccountData,
): Promise<Response> {
  const {
    email: _email,
    sub,
    name,
    scope,
    issuer,
    picture,
    access_token,
  } = userData
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
  if (userRecords.docs.length === 1 && userRecords.docs[0]) {
    userRecord = userRecords.docs[0]
  } else if (allowOAuthAutoSignUp) {
    const data: Record<string, unknown> = {
      email,
      name,
      _verified: true,
    }
    const hasAuthEnabled = Boolean(
      payload.collections[collections.usersCollection]?.config.auth,
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

  const accountData: Record<string, unknown> = {
    scope,
    name,
    picture,
    issuerName: issuer,
    access_token,
  }

  const accountRecords = await payload.find({
    collection: collections.accountsCollection,
    where: {
      sub: { equals: sub },
    },
  })

  if (
    accountRecords.docs &&
    accountRecords.docs.length === 1 &&
    accountRecords.docs[0]
  ) {
    await payload.update({
      collection: collections.accountsCollection,
      id: accountRecords.docs[0].id,
      data: accountData,
    })
  } else {
    accountData.sub = sub
    accountData.user = userRecord.id
    await payload.create({
      collection: collections.accountsCollection,
      data: accountData,
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

    const session: UserSession = {
      id: sessionID!,
      createdAt: now,
      expiresAt,
    }

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

  // Get the state data from cookies and pass it as a query parameter
  const parsedCookies = parseCookies(request.headers)
  const cookieState = parsedCookies.get("__session-oauth-state")

  const successRedirectionURL = new URL(
    `${payload.config.serverURL}${successRedirectPath}`,
  )

  // Add the state as a query parameter if it exists
  if (cookieState) {
    try {
      // Validate that it's proper JSON
      JSON.parse(cookieState)
      // Add the state as a query parameter (URL encode it)
      successRedirectionURL.searchParams.set(
        "state",
        encodeURIComponent(cookieState),
      )
      console.log("Added state to redirect URL:", cookieState)
    } catch (error) {
      console.error(
        "Failed to parse state data, continuing without state:",
        error,
      )
    }
  }

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
