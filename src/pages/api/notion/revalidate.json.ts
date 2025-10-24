import { refreshNotionCacheForPage } from "../../../lib/notion";

export const prerender = false;

export async function POST({ request }: { request: Request }) {
  const authHeader = request.headers.get("authorization");
  const token = process.env.NOTION_REVALIDATE_TOKEN ?? process.env.NOTION_SIGNING_SECRET;

  if (!token || authHeader !== `Bearer ${token}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let payload: any;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const pageId = payload?.pageId;
  if (!pageId || typeof pageId !== "string") {
    return new Response(JSON.stringify({ error: "Missing pageId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    await refreshNotionCacheForPage(pageId);
  } catch (error) {
    console.error("Failed to refresh cache for page", pageId, error);
    return new Response(JSON.stringify({ error: "Failed to refresh cache" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ status: "ok" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
