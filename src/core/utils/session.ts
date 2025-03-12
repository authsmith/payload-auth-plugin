import { SuccessKind } from "../../types.js"

export function sessionResponse(cookies: string[]) {
  const res = new Response(
    JSON.stringify({
      message: "Authentication successful",
      kind: SuccessKind.Created,
    }),
    {
      status: 200,
    },
  )

  cookies.forEach((cookie) => {
    res.headers.append("Set-Cookie", cookie)
  })
  return res
}
