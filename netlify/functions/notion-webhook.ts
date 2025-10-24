import crypto from "node:crypto";
import { refreshNotionCacheForPage } from "../../src/lib/notion";

const notionSigningSecret = process.env.NOTION_SIGNING_SECRET;

function unauthorized(message: string) {
  return new Response(message, { status: 401 });
}

function badRequest(message: string) {
  return new Response(message, { status: 400 });
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
  if (request.method === "GET" || request.method === "HEAD") {
    return new Response(
      JSON.stringify({ status: "ready", message: "Notion webhook" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

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

  try {
    await Promise.all(
      Array.from(pageIds).map(async (pageId) => refreshNotionCacheForPage(pageId)),
    );
  } catch (error) {
    console.error("Failed to refresh Notion cache", error);
    return new Response("Failed to refresh cache", { status: 500 });
  }

  return new Response(
    JSON.stringify({ status: "ok", pages: Array.from(pageIds) }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}
