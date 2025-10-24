import crypto from "node:crypto";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const notionSigningSecret = process.env.NOTION_SIGNING_SECRET;

function unauthorized(message: string) {
  return new Response(message, { status: 401 });
}

function badRequest(message: string) {
  return new Response(message, { status: 400 });
}

async function writeRedis(command: string, ...args: string[]) {
  if (!redisUrl || !redisToken) {
    throw new Error("Redis credentials not configured");
  }

  const segments = [command, ...args.map((value) => encodeURIComponent(value))];
  const url = `${redisUrl}/${segments.join("/")}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${redisToken}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Redis command failed: ${response.status} ${text}`);
  }
}

function verifyNotionSignature(headers: Headers, body: string) {
  if (!notionSigningSecret) {
    return true;
  }

  const signatureHeader = headers.get("x-notion-signature");
  const timestampHeader = headers.get("x-notion-timestamp");

  if (!signatureHeader || !timestampHeader) {
    return false;
  }

  const hmac = crypto.createHmac("sha256", notionSigningSecret);
  hmac.update(`${timestampHeader}:${body}`);
  const expected = hmac.digest("hex");

  const provided = Buffer.from(signatureHeader, "hex");
  const expectedBuf = Buffer.from(expected, "hex");
  if (provided.length !== expectedBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(provided, expectedBuf);
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { Allow: "POST" },
    });
  }

  const rawBody = await request.text();

  if (!verifyNotionSignature(request.headers, rawBody)) {
    return unauthorized("Invalid signature");
  }

  if (!rawBody) {
    return badRequest("Missing body");
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch (error) {
    return badRequest("Invalid JSON payload");
  }

  if (payload.type === "url_verification" || payload.type === "url_validation") {
    // Notion will send this when validating the webhook URL.
    return new Response(
      JSON.stringify({ challenge: payload.challenge }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  if (!redisUrl || !redisToken) {
    return badRequest("Redis integration not configured");
  }

  const events = Array.isArray(payload.events) ? payload.events : [];
  const pageIds = new Set<string>();

  for (const eventPayload of events) {
    const parentPageId = eventPayload?.data?.parent?.page_id ?? eventPayload?.parent?.page_id;
    if (parentPageId) {
      pageIds.add(parentPageId);
    }

    const directPageId = eventPayload?.data?.id ?? eventPayload?.id;
    if (directPageId) {
      pageIds.add(directPageId);
    }
  }

  if (!pageIds.size) {
    return new Response(JSON.stringify({ status: "no-op" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const timestamp = new Date().toISOString();

  try {
    await Promise.all(
      Array.from(pageIds).map(async (pageId) => {
        await writeRedis("sadd", "notion:updated", pageId);
        await writeRedis("set", `notion:updated:timestamp:${pageId}`, timestamp);
      }),
    );
  } catch (error) {
    console.error("Failed to record updates", error);
    return new Response("Failed to persist updates", { status: 500 });
  }

  return new Response(
    JSON.stringify({ status: "ok", pages: Array.from(pageIds) }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}
