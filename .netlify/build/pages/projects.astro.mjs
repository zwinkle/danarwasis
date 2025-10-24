/* empty css                                  */
import { c as createComponent, a as renderComponent, e as renderScript, r as renderTemplate, m as maybeRenderHead, b as addAttribute, F as Fragment } from '../chunks/astro/server_BpWn34nF.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_DwNEso5n.mjs';
export { renderers } from '../renderers.mjs';

var data = { python:[ { name:"HEIC2PNG",
      description:"Konversi file HEIC ke PNG",
      url:"https://github.com/zwinkle/heic2png/",
      image:"i-solar-gallery-edit-bold-duotone" } ],
  web:[ { name:"Aplikasi Penilaian",
      description:"Website Penilaian SMP Muhammadiyah Plus Purwodadi",
      url:"https://github.com/zwinkle/muhiplus",
      image:"i-solar-code-circle-bold-duotone" } ],
  college:[ { name:"Tugas Kuliah",
      description:"Rekap Tugas Kuliah",
      url:"https://github.com/zwinkle/college",
      image:"i-solar-notebook-bold-duotone" } ] };

const $$Projects = createComponent(($$result, $$props, $$slots) => {
  const projectKeys = Object.keys(data);
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Zwinkle projects, sedikit project dari saya", "description": "Memang tidak seberapa, karena saya juga masih belajar dan mencoba." }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex min-h-screen p-12 max-w-6xl mx-auto relative"> <main class="w-full flex flex-col gap-6"> <div class="w-full flex flex-col gap-6 slide-enter-content"> <h1 class="text-center font-lexend text-3xl font-bold dark:text-#e5e7eb">Projects</h1> <p class="text-center">Yang sedang dikerjakan dan sudah selesai</p> </div> <div class="flex flex-col gap-16"${addAttribute(`--enter-stage: 0 !important;`, "style")}> ${projectKeys.map((key, keyIndex) => {
    const _projects = data[key];
    let prevProjectLength = 0;
    if (keyIndex > 0) {
      prevProjectLength = projectKeys.slice(0, keyIndex).map((k) => data[k].length).reduce((acc, curr) => acc + curr);
    }
    return renderTemplate`<div class="flex flex-col gap-4 relative pt-8"> <h2 class="absolute text-6xl top-0 left-0 font-mono stroke-blueGray dark:text-d-base text-l-base opacity-20 font-bold capitalize -z-1 text-stroke slide-enter-content"> <div${addAttribute(`--enter-stage: ${prevProjectLength + 2} !important;`, "style")}> ${key} </div> </h2> <div class=" grid sm:grid-cols-2 md:grid-cols-3 gap-3 slide-enter-content"> ${_projects.map((p, projectIndex) => {
      const pContent = renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": ($$result3) => renderTemplate` <div class="mouses absolute w-10 h-10 blur-3xl dark:bg-white bg-black" style="display: none;"></div> <div class="pt-2 pr-5"> <div${addAttribute([
        `w-full h-10 w-10 aspect-square grow-0 shrink object-contain rounded-lg block`,
        p.image
      ], "class:list")}></div> </div> <div class="w-full"> <h3 class="font-lexend text-xl font-bold">${p.name}</h3> <p class="font-lexend text-sm">${p.description}</p> </div> ` })}`;
      const className = "relative duration-500 ease-in-out transition-all flex items-center opacity-75 rounded-md overflow-hidden py-2 px-4 hover:opacity-100 project-items";
      const animationOffset = `--enter-stage: ${prevProjectLength + projectIndex + 5} !important;`;
      return p.url ? renderTemplate`<a${addAttribute(p.url, "href")} target="_blank"${addAttribute(className, "class")}${addAttribute(animationOffset, "style")}> ${pContent} </a>` : renderTemplate`<div${addAttribute([className, "cursor-not-allowed"], "class:list")}${addAttribute(animationOffset, "style")}> ${pContent} </div>`;
    })} </div> </div>`;
  })} </div> </main> </div> ` })} ${renderScript($$result, "D:/code/PORTOFOLIO/danarwasis/src/pages/projects.astro?astro&type=script&index=0&lang.ts")}`;
}, "D:/code/PORTOFOLIO/danarwasis/src/pages/projects.astro", void 0);

const $$file = "D:/code/PORTOFOLIO/danarwasis/src/pages/projects.astro";
const $$url = "/projects";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Projects,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
