import { parseCookies } from "payload";
import { UnauthorizedAPIRequest, UserNotFoundAPIError, } from "../errors/apiErrors.js";
import { createSessionCookies, verifySessionCookie } from "../utils/cookies.js";
import { ErrorKind, SuccessKind } from "../../types.js";
export const SessionRefresh = async (cookieName, request) => {
    const { payload } = request;
    const cookies = parseCookies(request.headers);
    const token = cookies.get(cookieName);
    if (!token) {
        return new UnauthorizedAPIRequest();
    }
    const jwtResponse = await verifySessionCookie(token, payload.secret);
    if (!jwtResponse.payload) {
        return new UnauthorizedAPIRequest();
    }
    let refreshCookies = [];
    refreshCookies = [
        ...(await createSessionCookies(cookieName, payload.secret, jwtResponse.payload)),
    ];
    const res = new Response(JSON.stringify({
        message: "Session refreshed",
        kind: SuccessKind.Updated,
        isSuccess: true,
        isError: false,
    }), {
        status: 201,
    });
    for (const cookie of refreshCookies) {
        res.headers.append("Set-Cookie", cookie);
    }
    return res;
};
export const SessionUser = async (cookieName, request, internal, fields) => {
    const { payload } = request;
    const cookies = parseCookies(request.headers);
    const token = cookies.get(cookieName);
    if (!token) {
        return new Response(JSON.stringify({
            message: "Missing user session",
            kind: ErrorKind.NotAuthenticated,
            data: {},
            isSuccess: false,
            isError: true,
        }), {
            status: 403,
        });
    }
    const jwtResponse = await verifySessionCookie(token, payload.secret);
    if (!jwtResponse.payload) {
        return new Response(JSON.stringify({
            message: "Invalid user session",
            kind: ErrorKind.NotAuthenticated,
            data: {},
            isSuccess: false,
            isError: true,
        }), {
            status: 401,
        });
    }
    const doc = await request.payload.findByID({
        collection: internal.usersCollectionSlug,
        id: jwtResponse.payload.id,
    });
    if (!doc?.id) {
        return new UserNotFoundAPIError();
    }
    return new Response(JSON.stringify({
        message: "Fetched user session",
        kind: SuccessKind.Retrieved,
        data: {
            isAuthenticated: true,
            user: {
                id: doc.id,
                email: doc.email,
            },
        },
        isSuccess: true,
        isError: false,
    }), {
        status: 200,
    });
};
export const SessionSignout = async (cookieName, request) => {
    const searchParams = request.query;
    const expired = "Thu, 01 Jan 1970 00:00:00 GMT";
    const cookies = [];
    cookies.push(`${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Expires=${expired}`);
    let res = new Response(JSON.stringify({
        message: "Signed Out",
        kind: SuccessKind.Deleted,
        isSuccess: true,
        isError: false,
    }), {
        status: 200,
    });
    if (searchParams.returnTo) {
        const returnToURL = new URL(`${request.origin}/${searchParams.returnTo}`);
        res = new Response(null, {
            status: 302,
            headers: {
                Location: returnToURL.href,
            },
        });
    }
    for (const cookie of cookies) {
        res.headers.append("Set-Cookie", cookie);
    }
    return res;
};
//# sourceMappingURL=session.js.map