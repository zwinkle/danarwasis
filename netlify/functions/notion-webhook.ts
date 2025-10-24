import crypto from "node:crypto";

const notionSigningSecret = process.env.NOTION_SIGNING_SECRET;
const revalidateToken = process.env.NOTION_REVALIDATE_TOKEN ?? notionSigningSecret;

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
      Array.from(pageIds).map(async (pageId) => {
        console.log("Triggering revalidation", { pageId });
        await triggerRevalidation(pageId);
      }),
    );
  } catch (error) {
    console.error("Failed to trigger cache refresh", error);
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

async function triggerRevalidation(pageId: string) {
  if (!revalidateToken) {
    throw new Error("Missing NOTION_REVALIDATE_TOKEN");
  }

  const baseUrl = resolveBaseUrl();
  const url = new URL("/api/notion/revalidate.json", baseUrl).toString();

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${revalidateToken}`,
    },
    body: JSON.stringify({ pageId }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Revalidate failed (${response.status}): ${text}`);
  }

  console.log("Revalidation success", { pageId });
}

function resolveBaseUrl(): string {
  const candidates = [
    process.env.SITE_URL,
    process.env.URL,
    process.env.DEPLOY_URL,
    process.env.DEPLOY_PRIME_URL,
  ].filter((value): value is string => Boolean(value));

  if (candidates.length > 0) {
    return normalizeUrl(candidates[0]);
  }

  if (process.env.NETLIFY_SITE_NAME) {
    return `https://${process.env.NETLIFY_SITE_NAME}.netlify.app`;
  }

  throw new Error("Missing base URL environment variable");
}

function normalizeUrl(value: string): string {
  try {
    const url = new URL(value);
    return url.origin;
  } catch {
    return `https://${value.replace(/^https?:\/\//, "")}`;
  }
}
