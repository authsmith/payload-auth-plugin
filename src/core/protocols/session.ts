import { parseCookies, PayloadRequest } from "payload"
import {
  UnauthorizedAPIRequest,
  UserNotFoundAPIError,
} from "../errors/apiErrors.js"
import { createSessionCookies, verifySessionCookie } from "../utils/cookies.js"
import { ErrorKind, SuccessKind } from "../../types.js"

export const SessionRefresh = async (
  cookieName: string,
  secret: string,
  request: PayloadRequest,
) => {
  const cookies = parseCookies(request.headers)
  const token = cookies.get(cookieName)
  if (!token) {
    return new UnauthorizedAPIRequest()
  }

  const jwtResponse = await verifySessionCookie(token, secret)
  if (!jwtResponse.payload) {
    return new UnauthorizedAPIRequest()
  }
  let refreshCookies: string[] = []
  refreshCookies = [
    ...(await createSessionCookies(cookieName, secret, jwtResponse.payload)),
  ]

  const res = new Response(
    JSON.stringify({ message: "Session refreshed", kind: SuccessKind.Updated }),
    {
      status: 201,
    },
  )
  refreshCookies.forEach((cookie) => {
    res.headers.append("Set-Cookie", cookie)
  })
  return res
}

export const UserSession = async (
  cookieName: string,
  secret: string,
  request: PayloadRequest,
  internal: {
    usersCollectionSlug: string
  },
  fields: string[],
) => {
  const cookies = parseCookies(request.headers)
  const token = cookies.get(cookieName)
  console.log(cookies.get("payload-token"))

  if (!token) {
    return new Response(
      JSON.stringify({
        message: "Missing user session",
        kind: ErrorKind.NotAuthenticated,
        data: {
          isAuthenticated: false,
        },
      }),
      {
        status: 403,
      },
    )
  }

  const jwtResponse = await verifySessionCookie(token, secret)
  if (!jwtResponse.payload) {
    return new Response(
      JSON.stringify({
        message: "Invalid user session",
        kind: ErrorKind.NotAuthenticated,
        data: {
          isAuthenticated: false,
        },
      }),
      {
        status: 401,
      },
    )
  }

  const doc = await request.payload.findByID({
    collection: internal.usersCollectionSlug,
    id: jwtResponse.payload.id,
  })
  if (!doc?.id) {
    return new UserNotFoundAPIError()
  }

  const queryData: Record<string, unknown> = {}
  fields.forEach((field) => {
    if (Object.hasOwn(doc, field)) {
      queryData[field] = doc[field]
    }
  })

  return new Response(
    JSON.stringify({
      message: "Fetched user session",
      kind: SuccessKind.Retrieved,
      data: {
        isAuthenticated: true,
        ...queryData,
      },
    }),
    {
      status: 201,
    },
  )
}
