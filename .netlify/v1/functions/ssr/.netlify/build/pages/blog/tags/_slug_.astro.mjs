/* empty css                                        */
import { d as createAstro, c as createComponent, a as renderComponent, r as renderTemplate, m as maybeRenderHead, b as addAttribute } from '../../../chunks/astro/server_BpWn34nF.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../../../chunks/Layout_DwNEso5n.mjs';
import { g as getNotionPosts } from '../../../chunks/notion_BBsuOFvB.mjs';
export { renderers } from '../../../renderers.mjs';

const $$Astro = createAstro("https://danarwasis.my.id");
const prerender = false;
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const rawTag = Astro2.params.slug;
  if (!rawTag) {
    return Astro2.rewrite("/404");
  }
  const tag = decodeURIComponent(rawTag);
  const normalizedTag = tag.toLowerCase();
  const posts = (await getNotionPosts()).map((post) => {
    const publishedAt = post.createdAt ? new Date(post.createdAt) : null;
    const isIdLang = post.tags.some((tagName) => tagName.toLowerCase() === "id");
    return {
      ...post,
      publishedAt: publishedAt && !Number.isNaN(publishedAt.getTime()) ? publishedAt : null,
      isIdLang
    };
  }).filter((post) => post.tags.some((postTag) => postTag.toLowerCase() === normalizedTag)).sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));
  const displayTag = posts.find((post) => post.tags.some((postTag) => postTag.toLowerCase() === normalizedTag))?.tags.find(
    (postTag) => postTag.toLowerCase() === normalizedTag
  ) ?? tag;
  const postsByYear = posts.reduce((acc, post) => {
    const year = (post.publishedAt ?? /* @__PURE__ */ new Date()).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(post);
    return acc;
  }, {});
  return renderTemplate`${renderComponent($$result, "DefautLayout", $$Layout, { "title": "Zwinkle Blog, sekilas kehidupan", "description": "Sekilas kisah kehidupan saya sebagai Mahasiswa (untuk sekarang ini, besok tidak tahu)" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="grid gap-6 mt-32 max-w-3xl mx-auto px-12 mb-20 slide-enter-content"> <h1> <span class="text-3xl lg:text-4xl font-bold font-lexend capitalize">${displayTag}</span> </h1> <p>
Disini ${posts.length} ${posts.length === 1 ? "postingan" : "postingan"} menggunakan tag "${displayTag}".
</p> ${Object.entries(postsByYear).sort(([a], [b]) => parseInt(b) - parseInt(a)).map(([year, yearPosts], yearIndex) => renderTemplate`<div class="my-12 relative"> <div class="text-2xl font-bold absolute -z-50 font-lexend text-9xl -top-12 -left-12 opacity-10 text-stroke dark:text-d-base text-l-base"${addAttribute(`--enter-stage: ${yearIndex + yearPosts.length + 2} !important;`, "style")}> ${year} </div> <ul class="mt-4 z-50 gap-4 grid slide-enter-content"> ${yearPosts.slice().sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0)).map((post, postIndex) => renderTemplate`<li${addAttribute([
    "mt-2 relative",
    {
      "before:content-['ID'] before:absolute before:-left-10 before:bg-#5551 before:text-#888 before:bg-opacity-25 before:px-2 before:py-1 before:text-xs before:rounded-md lang-id": post.isIdLang
    }
  ], "class:list")}${addAttribute(`--enter-stage: ${yearIndex > 0 ? yearIndex : ""}${postIndex + 2} !important;`, "style")}> <a${addAttribute(`/blog/${post.slug}`, "href")} class="inline-block duration-200 transition-all transform inline-flex items-end gap-4 opacity-90 hover:opacity-100"> <p> ${post.title} ${post.publishedAt && renderTemplate`<span class="text-xs text-gray-500 inline-block"> ${post.publishedAt.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long"
  })} </span>`} </p> </a> </li>`)} </ul> </div>`)} </div> ` })}`;
}, "D:/code/PORTOFOLIO/danarwasis/src/pages/blog/tags/[slug].astro", void 0);

const $$file = "D:/code/PORTOFOLIO/danarwasis/src/pages/blog/tags/[slug].astro";
const $$url = "/blog/tags/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$slug,
	file: $$file,
	prerender,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
