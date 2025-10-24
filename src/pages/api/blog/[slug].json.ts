import type { APIContext } from "astro";
import { getNotionPost } from "../../../lib/notion";

export const prerender = false;

function getExcerpt(html: string, sentences = 1): string {
	if (!html) {
		return "";
	}

	const plainText = html.replace(/<[^>]*>/g, " ");
	const cleanText = plainText.replace(/\s+/g, " ").trim();
	const sentencesArray = cleanText.split(".");
	return sentencesArray.slice(0, sentences).join(".").trim();
}

export async function GET({ params }: APIContext) {
	const slug = params?.slug;
	if (!slug) {
		return new Response(JSON.stringify({ error: "Missing slug" }), {
			status: 400,
			headers: { "content-type": "application/json" },
		});
	}

	try {
		const detail = await getNotionPost(slug);
		if (!detail) {
			return new Response(JSON.stringify({ error: "Not found" }), {
				status: 404,
				headers: { "content-type": "application/json" },
			});
		}

		const post = {
			id: detail.id,
			slug: detail.slug,
			title: detail.title,
			html: detail.html,
			thumbnail: detail.thumbnail,
			credit: detail.credit,
			tags: detail.tags,
			createdAt: detail.createdAt,
			updatedAt: detail.updatedAt,
			description: getExcerpt(detail.html, 1),
			headings: detail.headings,
		};

		return new Response(JSON.stringify({ post }), {
			status: 200,
			headers: {
				"content-type": "application/json",
				"cache-control": "no-store, no-cache, must-revalidate",
			},
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to load post";
		return new Response(JSON.stringify({ error: message }), {
			status: 500,
			headers: { "content-type": "application/json" },
		});
	}
}
