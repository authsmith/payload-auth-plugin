import { MissingEmailAPIError } from "../../errors/apiErrors.js";
import { hashCode } from "../../utils/hash.js";
export async function InitPasskey(request) {
    // @ts-expect-error TODO: Fix undefined object method
    const { data } = (await request.json());
    if (!data.email) {
        throw new MissingEmailAPIError();
    }
    const existingRecord = await request.payload.find({
        collection: "accounts",
        where: {
            sub: {
                equals: hashCode(data.email + request.payload.secret).toString(),
            },
        },
    });
    if (existingRecord.totalDocs !== 1) {
        return new Response(JSON.stringify({ data: {} }), { status: 200 });
    }
    return new Response(JSON.stringify({ data: existingRecord.docs[0] }), {
        status: 200,
    });
}
//# sourceMappingURL=index.js.map