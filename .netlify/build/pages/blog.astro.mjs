/* empty css                                  */
import { c as createComponent, a as renderComponent, r as renderTemplate, g as defineScriptVars, b as addAttribute, m as maybeRenderHead } from '../chunks/astro/server_DwqtjhkU.mjs';
import 'kleur/colors';
import { a as getNotionPosts, g as getNotionContentVersion } from '../chunks/notion_BPuEf98Q.mjs';
import { $ as $$Layout } from '../chunks/Layout_D9HZCX9x.mjs';
export { renderers } from '../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const posts = await getNotionPosts();
  const contentVersion = await getNotionContentVersion();
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
  return renderTemplate`${renderComponent($$result, "DefautLayout", $$Layout, { "title": "Zwinkle Blog, sekilas kehidupan", "description": "Sekilas kisah kehidupan saya sebagai Mahasiswa (untuk sekarang ini, besok tidak tahu)" }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([" ", '<div class="grid gap-6 mt-32 max-w-3xl mx-auto px-12 mb-20 slide-enter-content"> <h1> <span class="text-3xl lg:text-4xl font-bold font-lexend">Blog</span> <span class="font-light text-sm">Zwinkle Blog, sekilas kehidupan</span> </h1> <p>\nSekilas kisah kehidupan saya sebagai Mahasiswa (untuk sekarang ini, besok tidak tahu)\n</p> ', " </div> <script>(function(){", '\n		(() => {\n			let currentVersion = initialVersion;\n			const intervalMs = 15000;\n\n			async function checkForUpdates() {\n				try {\n					const response = await fetch("/api/notion/updates.json", {\n						cache: "no-store",\n						headers: { "Cache-Control": "no-store" },\n					});\n					if (!response.ok) {\n						return;\n					}\n					const data = await response.json();\n					const nextVersion = data?.updatedAt ?? null;\n					if (!nextVersion) {\n						return;\n					}\n					if (!currentVersion) {\n						currentVersion = nextVersion;\n						return;\n					}\n					if (currentVersion !== nextVersion) {\n						window.location.reload();\n					}\n				} catch (error) {\n					console.debug("notion update poll failed", error);\n				}\n			}\n\n			setInterval(checkForUpdates, intervalMs);\n		})();\n	})();<\/script> '])), maybeRenderHead(), Object.entries(postsByYear).sort(([a], [b]) => parseInt(b) - parseInt(a)).map(([year, yearlyPosts], yearIndex) => renderTemplate`<div class="my-12 relative"> <div class="text-2xl font-bold absolute -z-50 font-lexend text-9xl -top-12 -left-12 opacity-10 text-stroke dark:text-d-base text-l-base"${addAttribute(`--enter-stage: ${yearIndex + yearlyPosts.length + 2} !important;`, "style")}> ${year} </div> <ul class="mt-4 z-50 gap-4 grid slide-enter-content"> ${yearlyPosts.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  }).map((post, postIndex) => renderTemplate`<li class="mt-2 relative"${addAttribute(`--enter-stage: ${yearIndex > 0 ? yearIndex : ""}${postIndex + 2} !important;`, "style")}> <a${addAttribute(`/blog/${post.slug}`, "href")} class="inline-block duration-200 transition-all transform inline-flex items-end gap-4 opacity-90 hover:opacity-100"> <p> ${post.title} <span class="text-xs text-gray-500 inline-block"> ${post.createdAt ? new Date(post.createdAt).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long"
  }) : ""} </span> </p> </a> </li>`)} </ul> </div>`), defineScriptVars({ initialVersion: contentVersion ?? null })) })}`;
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
