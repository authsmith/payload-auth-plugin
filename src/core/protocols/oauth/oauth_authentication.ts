import * as jose from "jose"
import {
  generatePayloadCookie,
  getFieldsToSign,
  jwtSign,
  TypedUser,
  type JsonObject,
  type PayloadRequest,
  type TypeWithID
} from "payload"
import {
  MissingCollection,
  UserNotFoundAPIError,
} from "../../errors/apiErrors.js"

import { v4 as uuid } from "uuid"
import { removeExpiredSessions } from "../../utils/session.js"


async function _createUser({ email, name, collections, request, allowOAuthAutoSignUp }: {
  email: string, name: string, collections: {
    usersCollection: string
    accountsCollection: string
  }, request: PayloadRequest, allowOAuthAutoSignUp: boolean
}) {
  const { payload } = request
  let userRecord = await payload.db.findOne({
    collection: collections.usersCollection,
    where: {
      email: {
        equals: email,
      },
    },
    req: request,
  })
  if (!userRecord && allowOAuthAutoSignUp) {
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
    userRecord = await payload.db.create({
      collection: collections.usersCollection,
      data,
      returning: true
    })
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
  const trxID = await payload.db.beginTransaction()
  let userRecord: (JsonObject & TypeWithID) | null = null
  const accountRecords = await payload.db.find({
    collection: collections.accountsCollection,
    where: {
      sub: { equals: sub },
    },
    req: request,
  }) as { docs: (JsonObject & TypeWithID)[] }
  if (accountRecords.docs && accountRecords.docs.length === 1) {
    if (accountRecords.docs[0].user) {
      userRecord = await payload.db.findOne({
        collection: collections.usersCollection,
        where: {
          id: { equals: accountRecords.docs[0].user },
        },
        req: request,
      })
    }
    await payload.db.updateOne({
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
      req: request
    })

  } else {
    userRecord = await _createUser({
      email: _email.toLowerCase(),
      name,
      request,
      collections,
      allowOAuthAutoSignUp
    })
    if (userRecord) {
      await payload.db.create({
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
        req: request,
      })
    }
  }
  if (!userRecord) {
    if (trxID) {
      await payload.db.rollbackTransaction(trxID)
    }
    return new UserNotFoundAPIError()
  }


  const collectionConfig = payload.config.collections.find(
    (collection) => collection.slug === collections.usersCollection,
  )
  if (!collectionConfig) {
    if (trxID) {
      await payload.db.rollbackTransaction(trxID)
    }
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
    userRecord.updatedAt = null
    const r = await payload.db.updateOne({
      id: userRecord.id,
      collection: collectionConfig.slug,
      data: userRecord,
      req: request,
      returning: true,
    })
    userRecord.collection = collectionConfig.slug
    userRecord._strategy = 'local-jwt'
  }

  const claimUser = await payload.db.findOne({
    collection: collections.usersCollection,
    where: {
      id: {
        equals: userRecord.id,
      },
    },
    req: request,
  })
  const fieldsToSign = getFieldsToSign({
    user: claimUser as TypedUser,
    email: _email.toLowerCase(),
    sid: sessionID ?? undefined,
    collectionConfig,
  })

  if (collectionConfig.hooks?.beforeLogin?.length) {
    for (const hook of collectionConfig.hooks.beforeLogin) {
      userRecord =
        (await hook({
          collection: collectionConfig,
          context: request.context,
          req: request,
          user: claimUser as TypedUser,
        })) || userRecord
    }
  }

  const { exp, token } = await jwtSign({
    fieldsToSign,
    secret,
    tokenExpiration: collectionConfig.auth.tokenExpiration,
  })

  if (collectionConfig.hooks?.afterLogin?.length) {
    for (const hook of collectionConfig.hooks.afterLogin) {
      userRecord =
        (await hook({
          collection: collectionConfig,
          context: request.context,
          req: request,
          token,
          user: userRecord,
        })) || userRecord
    }
  }

  if (collectionConfig.hooks?.afterRead?.length) {
    for (const hook of collectionConfig.hooks.afterRead) {
      userRecord =
        (await hook({
          collection: collectionConfig,
          context: request.context,
          doc: userRecord,
          req: request,
        })) || userRecord
    }
  }

  const successRedirectionURL = new URL(
    `${payload.config.serverURL}${successRedirectPath}`,
  )

  let result = {
    exp,
    token,
    user: userRecord,
  }

  // const args: Arguments<any> = {
  //   collection: payload.collections[collections.usersCollection],
  //   data: {
  //     email: _email.toLowerCase(),
  //     password: userRecord?.password,
  //     // username: userRecord?.username,
  //   },
  //   depth: 0,
  //   req: isolateObjectProperty(request, 'transactionID'),
  // }
  // result = await buildAfterOperation({
  //   args,
  //   collection: collectionConfig,
  //   operation: 'login',
  //   result,
  // })

  const cookie = generatePayloadCookie({
    collectionAuthConfig: collectionConfig.auth,
    cookiePrefix: useAdmin
      ? `${payload.config.cookiePrefix}`
      : `__${pluginType}`,
    token: result.token,
  })
  if (trxID) {
    await payload.db.commitTransaction(trxID)
  }
  const res = new Response(null, {
    status: 302,
    headers: {
      Location: successRedirectionURL.href,
    },
  })

  res.headers.append("Set-Cookie", cookie)

  return res
}
