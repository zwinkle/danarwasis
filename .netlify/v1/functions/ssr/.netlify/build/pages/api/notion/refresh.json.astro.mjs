import { r as rebuildNotionCache } from '../../../chunks/notion_BPuEf98Q.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
async function POST({ request }) {
  const token = process.env.NOTION_REVALIDATE_TOKEN ?? process.env.NOTION_SIGNING_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!token || authHeader !== `Bearer ${token}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    await rebuildNotionCache();
  } catch (error) {
    console.error("Failed to rebuild Notion cache", error);
    const message = error instanceof Error ? error.message : typeof error === "string" ? error : "Failed to rebuild cache";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  return new Response(JSON.stringify({ status: "ok" }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
