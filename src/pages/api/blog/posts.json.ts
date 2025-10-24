import { getNotionPosts } from "../../../lib/notion";

export const prerender = false;

export async function GET() {
	try {
		const posts = await getNotionPosts();
		return new Response(JSON.stringify({ posts }), {
			status: 200,
			headers: {
				"content-type": "application/json",
				"cache-control": "no-store, no-cache, must-revalidate",
			},
		});
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Failed to load posts";
		return new Response(JSON.stringify({ error: message }), {
			status: 500,
			headers: {
				"content-type": "application/json",
			},
		});
	}
}
