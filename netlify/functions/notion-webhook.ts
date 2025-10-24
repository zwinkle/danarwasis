import crypto from "node:crypto";

const notionSigningSecret = process.env.NOTION_SIGNING_SECRET;
const notionDatabaseId = process.env.NOTION_BD_ID;
const notionRevalidateToken =
  process.env.NOTION_REVALIDATE_TOKEN ?? process.env.NOTION_SIGNING_SECRET;
const notionRevalidateEndpoint = process.env.NOTION_REVALIDATE_ENDPOINT;

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
  if (!notionDatabaseId) {
    return new Response("Notion database not configured", { status: 500 });
  }

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
  const relevantPageIds = new Set<string>();

  for (const eventPayload of events) {
    if (!isEventForDatabase(eventPayload, notionDatabaseId)) {
      continue;
    }

    const pageId = extractPageId(eventPayload);
    if (pageId) {
      relevantPageIds.add(pageId);
    }
  }

  if (!relevantPageIds.size) {
    return new Response(JSON.stringify({ status: "ignored" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const endpoint = resolveRefreshEndpoint();
  let siteRefresh: "skipped" | "success" | "failed" = "skipped";
  let message: string | undefined;

  if (endpoint && notionRevalidateToken) {
    const refreshResponse = await triggerRefresh(endpoint, notionRevalidateToken);
    if (refreshResponse.ok) {
      siteRefresh = "success";
    } else {
      siteRefresh = "failed";
      message = await refreshResponse.text().catch(() => "");
    }
  }

  return new Response(
    JSON.stringify({
      status: "refreshed",
      pages: Array.from(relevantPageIds),
      siteRefresh,
      message: message && message.length ? message : undefined,
    }),
    {
      status: siteRefresh === "failed" ? 207 : 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}

function isEventForDatabase(eventPayload: any, databaseId: string): boolean {
  const parent = eventPayload?.data?.parent ?? eventPayload?.parent;
  if (!parent) {
    return false;
  }

  const candidates = [parent.database_id, parent.id];
  return candidates.some((candidate) => matchesDatabaseId(candidate, databaseId));
}

function extractPageId(eventPayload: any): string | null {
  if (typeof eventPayload?.data?.id === "string") {
    return eventPayload.data.id;
  }
  if (typeof eventPayload?.id === "string") {
    return eventPayload.id;
  }
  if (typeof eventPayload?.data?.parent?.page_id === "string") {
    return eventPayload.data.parent.page_id;
  }
  if (typeof eventPayload?.parent?.page_id === "string") {
    return eventPayload.parent.page_id;
  }
  return null;
}

function matchesDatabaseId(candidate: unknown, expected: string): boolean {
  if (typeof candidate !== "string") {
    return false;
  }
  return normalizeId(candidate) === normalizeId(expected);
}

function normalizeId(value: string): string {
  return value.replace(/-/g, "").toLowerCase();
}

function resolveRefreshEndpoint(): string | null {
  if (notionRevalidateEndpoint) {
    return sanitizeUrl(notionRevalidateEndpoint);
  }

  const baseUrl =
    process.env.NOTION_REVALIDATE_BASE_URL ??
    process.env.SITE_URL ??
    process.env.URL ??
    process.env.DEPLOY_URL ??
    null;

  if (!baseUrl) {
    return null;
  }

  return `${sanitizeUrl(baseUrl)}/api/notion/refresh.json`;
}

function sanitizeUrl(url: string): string {
  return url.replace(/\/$/, "");
}

function triggerRefresh(endpoint: string, token: string): Promise<Response> {
  return fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
