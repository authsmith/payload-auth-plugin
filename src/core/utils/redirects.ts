import { PayloadRequest } from "payload"

export function sessionRedirect(
  request: PayloadRequest,
  cookies: string[],
  successRedirect?: string | undefined | null,
) {
  const redirectURL = new URL(request.url!)
  redirectURL.pathname = successRedirect ?? ""
  const res = new Response(null, {
    status: 302,
    headers: {
      Location: redirectURL.toString(),
    },
  })

  cookies.forEach((cookie) => {
    res.headers.append("Set-Cookie", cookie)
  })
  return res
}
