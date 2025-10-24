import crypto from "node:crypto";

const notionSigningSecret = process.env.NOTION_SIGNING_SECRET;
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const POSTS_KEY = "notion:posts";
const LAST_UPDATED_KEY = "notion:last-updated";
const PAGE_SLUG_PREFIX = "notion:page-slug:";
const POST_DETAIL_PREFIX = "notion:post:";

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
    await invalidateCache(Array.from(pageIds));
  } catch (error) {
    console.error("Failed to invalidate cache", error);
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

async function invalidateCache(pageIds: string[]) {
  if (!redisUrl || !redisToken) {
    console.warn("Redis credentials missing; skipping invalidation");
    return;
  }

  const posts = await redisGet(POSTS_KEY);
  const slugsToDelete = new Set<string>();

  if (Array.isArray(posts)) {
    for (const post of posts) {
      if (post && typeof post.slug === "string") {
        slugsToDelete.add(post.slug);
      }
    }
  }

  // Remove detail caches for known slugs
  await Promise.all(
    Array.from(slugsToDelete).map((slug) => redisDel(`${POST_DETAIL_PREFIX}${slug}`)),
  );

  // Remove page-to-slug mappings for affected pages
  await Promise.all(
    pageIds.map((pageId) => redisDel(`${PAGE_SLUG_PREFIX}${pageId}`)),
  );

  await redisDel(POSTS_KEY);
  await redisSet(LAST_UPDATED_KEY, new Date().toISOString());

  console.log("Cache invalidated", {
    pages: pageIds,
    removedPosts: slugsToDelete.size,
  });
}

async function redisGet(key: string): Promise<any> {
  const response = await fetch(`${redisUrl}/get/${encodeURIComponent(key)}`, {
    headers: {
      Authorization: `Bearer ${redisToken}`,
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Redis GET failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  const result = data.result ?? null;
  if (typeof result === "string") {
    try {
      return JSON.parse(result);
    } catch {
      return result;
    }
  }
  return result;
}

async function redisDel(key: string): Promise<void> {
  const response = await fetch(`${redisUrl}/del/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${redisToken}`,
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Redis DEL failed (${response.status}): ${text}`);
  }
}

async function redisSet(key: string, value: string): Promise<void> {
  const encodedValue = encodeURIComponent(value);
  const response = await fetch(
    `${redisUrl}/set/${encodeURIComponent(key)}/${encodedValue}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${redisToken}`,
      },
    },
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Redis SET failed (${response.status}): ${text}`);
  }
}
