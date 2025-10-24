/* empty css                                  */
import { c as createComponent, a as renderComponent, r as renderTemplate, m as maybeRenderHead, b as addAttribute } from '../chunks/astro/server_BpWn34nF.mjs';
import 'kleur/colors';
import { g as getNotionPosts } from '../chunks/notion_BBsuOFvB.mjs';
import { $ as $$Layout } from '../chunks/Layout_DwNEso5n.mjs';
export { renderers } from '../renderers.mjs';

const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const posts = await getNotionPosts();
  const postsByYear = posts.reduce((groups, post) => {
    if (!post.createdAt) {
      return groups;
    }
    const year = new Date(post.createdAt).getFullYear();
    if (!groups[year]) {
      groups[year] = [];
    }
    groups[year].push(post);
    return groups;
  }, {});
  return renderTemplate`${renderComponent($$result, "DefautLayout", $$Layout, { "title": "Zwinkle Blog, sekilas kehidupan", "description": "Sekilas kisah kehidupan saya sebagai Mahasiswa (untuk sekarang ini, besok tidak tahu)" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="grid gap-6 mt-32 max-w-3xl mx-auto px-12 mb-20 slide-enter-content"> <h1> <span class="text-3xl lg:text-4xl font-bold font-lexend">Blog</span> <span class="font-light text-sm">Zwinkle Blog, sekilas kehidupan</span> </h1> <p>
Sekilas kisah kehidupan saya sebagai Mahasiswa (untuk sekarang ini, besok tidak tahu)
</p> ${Object.entries(postsByYear).sort(([a], [b]) => parseInt(b) - parseInt(a)).map(([year, yearlyPosts], yearIndex) => renderTemplate`<div class="my-12 relative"> <div class="text-2xl font-bold absolute -z-50 font-lexend text-9xl -top-12 -left-12 opacity-10 text-stroke dark:text-d-base text-l-base"${addAttribute(`--enter-stage: ${yearIndex + yearlyPosts.length + 2} !important;`, "style")}> ${year} </div> <ul class="mt-4 z-50 gap-4 grid slide-enter-content"> ${yearlyPosts.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  }).map((post, postIndex) => renderTemplate`<li class="mt-2 relative"${addAttribute(`--enter-stage: ${yearIndex > 0 ? yearIndex : ""}${postIndex + 2} !important;`, "style")}> <a${addAttribute(`/blog/${post.slug}`, "href")} class="inline-block duration-200 transition-all transform inline-flex items-end gap-4 opacity-90 hover:opacity-100"> <p> ${post.title} <span class="text-xs text-gray-500 inline-block"> ${post.createdAt ? new Date(post.createdAt).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long"
  }) : ""} </span> </p> </a> </li>`)} </ul> </div>`)} </div> ` })}`;
}, "D:/code/PORTOFOLIO/danarwasis/src/pages/blog/index.astro", void 0);

const $$file = "D:/code/PORTOFOLIO/danarwasis/src/pages/blog/index.astro";
const $$url = "/blog";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	prerender,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
