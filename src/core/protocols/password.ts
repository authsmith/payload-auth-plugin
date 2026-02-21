import { parseCookies, type PayloadRequest } from "payload"
import { v4 as uuid } from "uuid"
import { APP_COOKIE_SUFFIX } from "../../constants.js"
import { SuccessKind } from "../../types.js"
import {
  EmailAlreadyExistError,
  InvalidCredentials,
  InvalidRequestBodyError,
  MissingCollection,
  MissingOrInvalidVerification,
  UnauthorizedAPIRequest,
  UserNotFoundAPIError,
} from "../errors/apiErrors.js"
import {
  createSessionCookies,
  invalidateOAuthCookies,
  verifySessionCookie,
} from "../utils/cookies.js"
import { ephemeralCode, verifyEphemeralCode } from "../utils/hash.js"
import { hashPassword, verifyPassword } from "../utils/password.js"
import { removeExpiredSessions } from "../utils/session.js"

const redirectWithSession = async (
  cookieName: string,
  path: string,
  secret: string,
  fields: Record<string, string | number | null>,
  request: PayloadRequest,
  tokenExpiration?: number,
) => {
  let cookies = []

  cookies = [
    ...(await createSessionCookies(
      cookieName,
      secret,
      fields,
      tokenExpiration,
    )),
  ]
  cookies = invalidateOAuthCookies(cookies)
  const successRedirectionURL = new URL(`${request.origin}${path}`)
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

export const PasswordSignin = async (
  pluginType: string,
  request: PayloadRequest,
  internal: {
    usersCollectionSlug: string
  },
  useAdmin: boolean,
  secret: string,
  successRedirectPath: string,
  errorRedirectPath: string,
) => {
  const body =
    request.json &&
    ((await request.json()) as { email: string; password: string })

  if (!body?.email || !body.password) {
    return new InvalidRequestBodyError()
  }

  const email = body.email.toLowerCase()

  const { payload } = request
  const { docs } = await payload.find({
    collection: internal.usersCollectionSlug,
    where: {
      email: { equals: email },
    },
    limit: 1,
  })

  if (docs.length !== 1) {
    return new UserNotFoundAPIError()
  }
  const userRecord = docs[0]
  if (!userRecord.hashedPassword) {
    return new InvalidCredentials()
  }

  const isVerified = await verifyPassword(
    body.password,
    userRecord.hashedPassword,
    userRecord.hashSalt,
    userRecord.hashIterations,
  )
  if (!isVerified) {
    return new InvalidCredentials()
  }

  const collectionConfig = payload.config.collections.find(
    (collection) => collection.slug === internal.usersCollectionSlug,
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
      collection: internal.usersCollectionSlug,
      data: userRecord,
      req: request,
      returning: false,
    })
  }

  const cookieName = useAdmin
    ? `${payload.config.cookiePrefix}-token`
    : `__${pluginType}-${APP_COOKIE_SUFFIX}`
  const signinFields = {
    id: userRecord.id,
    email,
    sid: sessionID,
    collection: internal.usersCollectionSlug,
  }
  return await redirectWithSession(
    cookieName,
    successRedirectPath,
    secret,
    signinFields,
    request,
    useAdmin ? collectionConfig.auth.tokenExpiration : undefined,
  )
}

export const PasswordSignup = async (
  pluginType: string,
  request: PayloadRequest,
  internal: {
    usersCollectionSlug: string
  },
  useAdmin: boolean,
  secret: string,
  successRedirectPath: string,
  errorRedirectPath: string,
) => {
  const body =
    request.json &&
    ((await request.json()) as {
      email: string
      password: string
      allowAutoSignin?: boolean
      userInfo?: Record<string, unknown>
    })

  if (!body?.email || !body.password) {
    return new InvalidRequestBodyError()
  }

  const email = body.email.toLowerCase()
  const { payload } = request
  const { docs } = await payload.find({
    collection: internal.usersCollectionSlug,
    where: {
      email: { equals: email },
    },
    limit: 1,
  })

  if (docs.length > 0) {
    return new EmailAlreadyExistError()
  }

  const {
    hash: hashedPassword,
    salt: hashSalt,
    iterations,
  } = await hashPassword(body.password)

  const userRecord = await payload.create({
    collection: internal.usersCollectionSlug,
    data: {
      email,
      hashedPassword: hashedPassword,
      hashIterations: iterations,
      hashSalt,
      ...body.userInfo,
    },
  })

  if (body.allowAutoSignin) {
    const collectionConfig = payload.config.collections.find(
      (collection) => collection.slug === internal.usersCollectionSlug,
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
        collection: internal.usersCollectionSlug,
        data: userRecord,
        req: request,
        returning: false,
      })
    }

    const cookieName = useAdmin
      ? `${payload.config.cookiePrefix}-token`
      : `__${pluginType}-${APP_COOKIE_SUFFIX}`
    const signinFields = {
      id: userRecord.id,
      email,
      sid: sessionID,
      collection: internal.usersCollectionSlug,
    }
    return await redirectWithSession(
      cookieName,
      successRedirectPath,
      secret,
      signinFields,
      request,
      useAdmin ? collectionConfig.auth.tokenExpiration : undefined,
    )
  }

  return Response.json(
    {
      message: "Signed up successfully",
      kind: SuccessKind.Created,
      isSuccess: true,
      isError: false,
    },
    { status: 201 },
  )
}

export const ForgotPasswordInit = async (
  request: PayloadRequest,
  internal: {
    usersCollectionSlug: string
  },
  emailTemplate: any,
) => {
  const { payload } = request

  const body =
    request.json &&
    ((await request.json()) as {
      email: string
    })

  if (!body?.email) {
    return new InvalidRequestBodyError()
  }
  const email = body.email.toLowerCase()
  const { docs } = await payload.find({
    collection: internal.usersCollectionSlug,
    where: {
      email: { equals: email },
    },
    limit: 1,
  })

  if (docs.length !== 1) {
    return new UserNotFoundAPIError()
  }
  const { code, hash } = await ephemeralCode(6, payload.secret)

  await payload.sendEmail({
    to: email,
    subject: "Password recovery",
    html: await emailTemplate({
      verificationCode: code,
    }),
  })

  const res = new Response(
    JSON.stringify({
      message: "Verification email sent",
      kind: SuccessKind.Created,
      isSuccess: true,
      isError: false,
    }),
    { status: 201 },
  )
  const verification_token_expires = new Date()
  verification_token_expires.setDate(verification_token_expires.getDate() + 7)

  await payload.update({
    collection: internal.usersCollectionSlug,
    id: docs[0].id,
    data: {
      verificationHash: hash,
      verificationCode: code,
      verificationTokenExpire: Math.floor(
        verification_token_expires.getTime() / 1000,
      ),
      verificationKind: "PASSWORD_RESTORE",
    },
  })
  return res
}

export const ForgotPasswordVerify = async (
  request: PayloadRequest,
  internal: {
    usersCollectionSlug: string
  },
) => {
  const { payload } = request

  const body =
    request.json &&
    ((await request.json()) as {
      password: string
      code: string
    })

  if (!body?.password || !body.code) {
    return new InvalidRequestBodyError()
  }
  const { docs } = await payload.find({
    collection: internal.usersCollectionSlug,
    where: {
      verificationCode: { equals: body.code },
    },
  })

  const currentDate = Date.now()
  if (
    docs.length === 0 ||
    docs[0].verificationCode !== body.code ||
    !docs[0].verificationHash ||
    Math.floor(currentDate / 1000) > docs[0].verificationTokenExpire ||
    docs[0].verificationKind !== "PASSWORD_RESTORE"
  ) {
    return new MissingOrInvalidVerification()
  }

  const { verificationHash: hash, id: userId } = docs[0]

  const isVerified = await verifyEphemeralCode(body.code, hash, payload.secret)

  if (!isVerified) {
    return new MissingOrInvalidVerification()
  }

  const {
    hash: hashedPassword,
    salt: hashSalt,
    iterations,
  } = await hashPassword(body.password)

  await payload.update({
    collection: internal.usersCollectionSlug,
    id: userId,
    data: {
      hashedPassword,
      hashSalt,
      hashIterations: iterations,
      verificationHash: null,
      verificationCode: null,
      verificationTokenExpire: null,
      verificationKind: null,
    },
  })

  const res = new Response(
    JSON.stringify({
      message: "Password recovered successfully",
      kind: SuccessKind.Updated,
      isSuccess: true,
      isError: false,
    }),
    { status: 201 },
  )
  return res
}

export const ResetPassword = async (
  cookieName: string,
  secret: string,
  internal: {
    usersCollectionSlug: string
  },
  request: PayloadRequest,
) => {
  const { payload } = request
  const cookies = parseCookies(request.headers)
  const token = cookies.get(cookieName)
  if (!token) {
    return new UnauthorizedAPIRequest()
  }

  const jwtResponse = await verifySessionCookie(token, secret)
  if (!jwtResponse.payload) {
    return new UnauthorizedAPIRequest()
  }

  const body =
    request.json &&
    ((await request.json()) as {
      email: string
      currentPassword: string
      newPassword: string
      signoutOnUpdate?: boolean | undefined
    })

  if (!body?.email || !body?.currentPassword || !body?.newPassword) {
    return new InvalidRequestBodyError()
  }

  const email = body.email.toLowerCase()

  const { docs } = await payload.find({
    collection: internal.usersCollectionSlug,
    where: {
      email: { equals: email },
    },
    limit: 1,
  })

  if (docs.length !== 1) {
    return new UserNotFoundAPIError()
  }

  const user = docs[0]
  const isVerified = await verifyPassword(
    body.currentPassword,
    user.hashedPassword,
    user.hashSalt,
    user.hashIterations,
  )
  if (!isVerified) {
    return new InvalidCredentials()
  }

  const {
    hash: hashedPassword,
    salt: hashSalt,
    iterations,
  } = await hashPassword(body.newPassword)

  await payload.update({
    collection: internal.usersCollectionSlug,
    id: user.id,
    data: {
      hashedPassword,
      hashSalt,
      hashIterations: iterations,
    },
  })

  // if (body.signoutOnUpdate) {
  //   let cookies: string[] = []
  //   cookies = [...invalidateSessionCookies(cookieName, cookies)]
  //   return
  // }

  const res = new Response(
    JSON.stringify({
      message: "Password reset complete",
      kind: SuccessKind.Updated,
      isSuccess: true,
      isError: false,
    }),
    {
      status: 201,
    },
  )
  return res
}
