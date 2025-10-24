import { getNotionContentVersion } from "../../../lib/notion";

export const prerender = false;

export async function GET() {
  const updatedAt = await getNotionContentVersion();

  return new Response(
    JSON.stringify({ updatedAt }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    },
  );
}
