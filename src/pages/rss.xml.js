import { SITE_DESCRIPTION, SITE_TITLE } from "../consts";

import { getNotionPosts, getNotionPost, type NotionPostSummary, type NotionPostDetail } from "../lib/notion";
import rss from "@astrojs/rss";

export const prerender = false;

export async function GET(context) {
  function getExcerpt(html, count = 1) {
    if (!html) return "";

    const plainText = html.replace(/<[^>]*>/g, " ");

    const cleanText = plainText.replace(/\s+/g, " ").trim();

    const sentences = cleanText.split(".").filter(sentence => sentence.trim() !== "");
    const excerpt = sentences.slice(0, count).join(".");

    return excerpt.trim();
  }

  const summaries = await getNotionPosts();
  const posts = await Promise.all(
    summaries.map(async (summary) => {
      const detail = await getNotionPost(summary.slug);
      return detail ? { summary, detail } : null;
    })
  );

  const items = posts
    .filter((item): item is { summary: NotionPostSummary; detail: NotionPostDetail } => item !== null)
    .map(({ summary, detail }) => ({
      categories: summary.tags,
      author: "Andika",
      link: `/blog/${summary.slug}/`,
      title: summary.title || "=--",
      pubDate: summary.createdAt ? new Date(summary.createdAt) : new Date(),
      description: getExcerpt(detail.html || ""),
      content: detail.html,
    }));

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    customData: "<language>en-us</language>",
    items,
  });
}
