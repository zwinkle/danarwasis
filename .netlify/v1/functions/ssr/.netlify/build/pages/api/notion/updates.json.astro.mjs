import { g as getNotionContentVersion } from '../../../chunks/notion_BPuEf98Q.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
async function GET() {
  const updatedAt = await getNotionContentVersion();
  return new Response(
    JSON.stringify({ updatedAt }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate"
      }
    }
  );
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
