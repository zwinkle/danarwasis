import { g as getNotionPosts, a as getNotionPost } from '../chunks/notion_BBsuOFvB.mjs';
import rss from '@astrojs/rss';
export { renderers } from '../renderers.mjs';

const SITE_TITLE = "Danar Blog";
const SITE_DESCRIPTION = "Website milik Danar";

const prerender = false;

async function GET(context) {
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
    .filter((item) => item !== null)
    .map((item) => {
      const { summary, detail } = item;

      return {
      categories: summary.tags,
      author: "Andika",
      link: `/blog/${summary.slug}/`,
      title: summary.title || "=--",
      pubDate: summary.createdAt ? new Date(summary.createdAt) : new Date(),
      description: getExcerpt(detail.html || ""),
      content: detail.html,
      };
    });

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    customData: "<language>en-us</language>",
    items,
  });
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
