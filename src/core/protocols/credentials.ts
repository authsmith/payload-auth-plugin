import { PayloadRequest } from "payload"

export async function CredentialSignin(
  request: PayloadRequest,
): Promise<Response> {
  const body = request.json && ((await request.json()) as { email: string })

  return Response.json({})
}
