/* empty css                                     */
import { d as createAstro, c as createComponent, m as maybeRenderHead, b as addAttribute, r as renderTemplate, a as renderComponent, e as renderScript, f as renderSlot, u as unescapeHTML } from '../../chunks/astro/server_BpWn34nF.mjs';
import 'kleur/colors';
import 'clsx';
import { $ as $$Layout } from '../../chunks/Layout_DwNEso5n.mjs';
/* empty css                                     */
import { g as getNotionPosts, a as getNotionPost } from '../../chunks/notion_DGe11JMA.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro$2 = createAstro("https://danarwasis.my.id");
const $$FormattedDate = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$FormattedDate;
  const { date } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<time${addAttribute(date.toISOString(), "datetime")}> ${date.toLocaleDateString("en-us", {
    year: "numeric",
    month: "short",
    day: "numeric"
  })} </time>`;
}, "D:/code/PORTOFOLIO/danarwasis/src/components/FormattedDate.astro", void 0);

const $$Astro$1 = createAstro("https://danarwasis.my.id");
const $$BlogPost = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$BlogPost;
  const { title, description, pubDate, thumbnail, headings, caption } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": title, "description": description, "image": thumbnail || void 0 }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="relative" id="top"> <div class="px-8 pt-10"> <article class="max-w-3xl m-auto slide-enter-content pb32"> <div class="mb-8"> <h1 class="leading-none text-2xl md:text-5xl font-bold mb-4"${addAttribute(title.replace(/\s+/g, "-").toLowerCase(), "id")}>${title}</h1> <p class="text-sm"> ${pubDate && renderTemplate`${renderComponent($$result2, "FormattedDate", $$FormattedDate, { "date": pubDate })}`} </p> ${thumbnail && renderTemplate`<figure class="w-full h-fit object-contain"> <picture> <img${addAttribute(thumbnail, "src")}${addAttribute("Thumbnail for " + title, "alt")} class="rounded-lg mt-8 shimmer aspect-video w-full h-auto"> </picture> ${caption && renderTemplate`<figcaption class="text-xs mt-2 text-gray-500 dark:text-gray-400">Gambar: ${caption}</figcaption>`} </figure>`} </div> <nav class="fixed top-32 right-8 h-500px flex-col group xl:flex z-99 hidden lg:block"> <div class="relative group w-62 h-500px"> <div class="grid space-y-2 absolute top-0 right-0"> <div class="grid space-y-2"> ${headings.map((h) => renderTemplate`<div${addAttribute(h.slug, "data-slug")} class="w-5 h-2 bg-l-on-base dark:bg-d-on-base rounded-sm transition-all duration-500 ease-in-out heading-indicator opacity-10"></div>`)} </div> </div> <div class="max-h-500px bg-l-base dark:bg-d-base dark:border-d-on-base/10 grid absolute top-0 right-0 border border-l-on-base/10 rounded-lg p-4 overflow-y-auto group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 opacity-0 transition-all duration-500 ease-in-out"> <div class="justify-center flex-col w-full z-90 list-none bg-l-base dark:bg-d-base grid h-fit"> <a${addAttribute(`#${title.replace(/\s+/g, "-").toLowerCase()}`, "href")} class="text-xs transition-all duration-300 ease-in-out whitespace-pre-wrap px-2 hover:bg-l-on-base/10 hover:dark:bg-d-on-base/10 hover:opacity-100 opacity-50 transition-all duration-100 ease-in-out rounded-sm py-1">${title.trim()}</a> ${headings.map((h) => renderTemplate`<a${addAttribute(`#${h.slug}`, "href")} class="text-xs transition-all duration-300 ease-in-out whitespace-pre-wrap px-2 hover:bg-l-on-base/10 hover:dark:bg-d-on-base/10 hover:opacity-100 opacity-50 transition-all duration-100 ease-in-out rounded-sm py-1"${addAttribute(`margin-left: ${h.depth * 1}rem;`, "style")}> ${h.text.trim()} </a>`)} </div> </div> </div> </nav> <details class="group top-32 right-8 flex-col z-99 block bg-l-on-base/10 dark:bg-d-on-base/10 md:hidden p-4 rounded-md"> <summary class="relative flex items-center gap-1"><i class="i-myna-list w-5 h-5"></i> Tabel Konten</summary> <nav class="relative grid gap-1 mt-4"> <a${addAttribute(`#${title.replace(/\s+/g, "-").toLowerCase()}`, "href")} class="decoration-none">${title.trim()}</a> ${headings.map((h) => renderTemplate`<a${addAttribute(`#${h.slug}`, "href")} class="decoration-none"${addAttribute(`margin-left: ${h.depth * 1}rem;`, "style")}> ${h.text.trim()} </a>`)} </nav> </details> <div class="prose w-full max-w-none"> ${renderSlot($$result2, $$slots["default"])} </div> </article> </div> </div> <a href="#top" id="back-to-top" class="fixed lg:bottom-4 bottom-16 right-4 m-4 i-solar-alt-arrow-up-bold w8 h8 z-100"></a> ` })} ${renderScript($$result, "D:/code/PORTOFOLIO/danarwasis/src/layouts/BlogPost.astro?astro&type=script&index=0&lang.ts")} `;
}, "D:/code/PORTOFOLIO/danarwasis/src/layouts/BlogPost.astro", void 0);

const $$Astro = createAstro("https://danarwasis.my.id");
const prerender = false;
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const posts = await getNotionPosts();
  posts.length;
  const params = Astro2.params.slug;
  const postIndex = posts.findIndex((post) => post.slug === params);
  const postDetail = params ? await getNotionPost(params) : null;
  function getAtIndex(index) {
    const target = posts[index];
    return target ? {
      title: target.title,
      slug: target.slug
    } : null;
  }
  function getExcerpt(html, sentences = 1) {
    if (!html) return "";
    const plainText = html.replace(/<[^>]*>/g, " ");
    const cleanText = plainText.replace(/\s+/g, " ").trim();
    const words = cleanText.split(".");
    const excerpt = words.slice(0, sentences).join(".");
    return excerpt.trim();
  }
  if (!postDetail || postIndex === -1) {
    return Astro2.rewrite("/404");
  }
  const pageData = {
    post: {
      html: postDetail.html,
      thumbnail: postDetail.thumbnail,
      title: postDetail.title,
      slug: postDetail.slug,
      description: getExcerpt(postDetail.html, 1),
      pubDate: new Date(postDetail.createdAt ?? /* @__PURE__ */ new Date()),
      headings: postDetail.headings,
      credit: postDetail.credit,
      tags: postDetail.tags
    }};
  const prevPost = getAtIndex(postIndex);
  const nextPost = getAtIndex(postIndex);
  return renderTemplate`${renderComponent($$result, "BlogPost", $$BlogPost, { "title": pageData.post.title, "thumbnail": pageData.post.thumbnail, "pubDate": pageData.post.pubDate, "description": pageData.post.description, "caption": pageData.post.credit ?? void 0, "headings": pageData.post.headings }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<section>${unescapeHTML(pageData.post.html)}</section> <div class="grid gap-2"> <div> <p>Tags:</p> <div class="flex gap-2 flex-wrap"> ${pageData.post.tags.map((tag) => renderTemplate`<a${addAttribute(`/blog/tags/${tag}`, "href")} class="btn-normal decoration-none font-normal px-4"> <span>${tag}</span> </a>`)} </div> </div> <hr class="w-20 mx-auto px-10vw bg-gray h-1px opacity50"> <a href="/blog"> <span class="inline-flex opacity50 items-center lg:justify-end gap-2 mt-4"> <i class="i-myna-chevron-double-left"></i> Kembali ke Blog
</span> </a> <div class="grid lg:grid-cols-2 gap-2 mt-2"> <div> ${prevPost && renderTemplate`<a${addAttribute(`/blog/${prevPost.slug}`, "href")} class="btn-normal decoration-none opacity-75 hover:opacity-100 hover:bg-#30344620 rounded-md transition-all duration-300 ease-in-out text-left flex flex-col gap-2 p-4"> <span class="inline-flex opacity50 items-center gap-2"> <i class="i-myna-chevron-double-left"></i> Sebelumnya
</span> <span>${prevPost.title}</span> </a>`} </div> <div> ${nextPost && renderTemplate`<a${addAttribute(`/blog/${nextPost.slug}`, "href")} class="btn-normal decoration-none opacity-75 hover:opacity-100 hover:bg-#30344620 rounded-md transition-all duration-300 ease-in-out flex flex-col gap-2 p-4 text-left lg:text-right"> <span class="inline-flex opacity50 items-center lg:justify-end gap-2">
Selanjutnya <i class="i-myna-chevron-double-right"></i> </span> <span>${nextPost.title}</span> </a>`} </div> </div> </div> ` })}`;
}, "D:/code/PORTOFOLIO/danarwasis/src/pages/blog/[slug].astro", void 0);

const $$file = "D:/code/PORTOFOLIO/danarwasis/src/pages/blog/[slug].astro";
const $$url = "/blog/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$slug,
	file: $$file,
	prerender,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
