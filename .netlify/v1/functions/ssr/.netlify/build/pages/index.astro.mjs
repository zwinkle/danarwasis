/* empty css                                  */
import { c as createComponent, a as renderComponent, r as renderTemplate, m as maybeRenderHead, b as addAttribute } from '../chunks/astro/server_BpWn34nF.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_DwNEso5n.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  const socialMedia = [
    {
      link: "https://github.com/zwinkle",
      icon: "i-myna-brand-github",
      name: "Github"
    },
    {
      link: "https://www.facebook.com/danarwasis",
      icon: "i-myna-brand-facebook",
      name: "Facebook"
    },
    {
      link: "https://twitter.com/dandxman8",
      icon: "i-myna-brand-x",
      name: "Twitter"
    }
  ];
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Halo, Zwinkle disini", "description": "Danar Wasis Pambudi, Mahasiswa S1 Pendidikan Teknik Informatika, Universitas Muhammadiyah Surakarta. Saya menyukai teknologi dan hal rumit di dalamnya. Saya menyukai teknologi khususnya Networking dan mungkin Desain Grafis termasuk juga. Kalian bisa melihat hasil dari pekerjaan saya di web ini, walaupun memang tidak sebagus yang kalian kira. Selain menjadi Mahasiswa yang biasa-biasa saja dan Coding 24/7, saya memiliki hobi untuk olahraga Bulu Tangkis, menonton Anime dan terkadang Bersenandung. Saya lahir di Sragen, kalian bisa menyapa saya di sosial media atau secara langsung, saya juga terbuka untuk ajakan kolaborasi atau pekerjaan yang selinear dengan kemampuan dan minat saya." }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex items-center justify-center min-h-70vh p-12"> <div class="w-full grid gap-3 max-w-xl slide-enter-content"> <h1 class="dark:text-#e5e7eb text-4xl font-bold item">
Danar<span class="text-sm font-normal opacity-75 ml-1">atau <span class="bold underline">Zwinkle</span></span> </h1> <div> <p>Halo, aku Danar Wasis Pambudi</p> <p>Mahasiswa S1 Pendidikan Teknik Informatika.</p> </div> <p>
Saya menyukai teknologi dan hal rumit di dalamnya. Saya menyukai teknologi khususnya Networking, Machine Learning, dan mungkin Desain Grafis termasuk juga. Kalian bisa melihat hasil dari pekerjaan saya di web ini, walaupun memang tidak sebagus yang kalian kira. <a href="/projects" class="font-bold underline">project saya</a>.
</p> <p>
Selain menjadi Mahasiswa yang biasa-biasa saja dan Coding 24/7, saya memiliki hobi untuk olahraga Bulu Tangkis, menonton Anime dan terkadang Bersenandung. Saya lahir di Sragen, kalian bisa menyapa saya di sosial media atau secara langsung, saya juga terbuka untuk ajakan kolaborasi atau pekerjaan yang selinear dengan kemampuan dan minat saya.
</p> <div class="w-20 h-1px bg-gray opacity-50 mx-auto mt-2"></div> <div class="text-sm"> <p>Aku ada di</p> <div class="flex items-start justify-start gap-4 mt-2"> ${socialMedia.map((url) => renderTemplate`<a${addAttribute(url.link, "href")} class="btn-normal flex items-center justify-center gap-2 transition-all duration-300 ease-in-out hover:opacity-100 hover:bg-#8882 opacity-90" target="_blank" rel="external nofollow noopener noreferrer"> <span${addAttribute([url.icon, "inline-block", "w-4", "h-4"], "class:list")}></span> ${url.name} </a>`)} </div> </div> </div> </div> ` })}`;
}, "D:/code/PORTOFOLIO/danarwasis/src/pages/index.astro", void 0);

const $$file = "D:/code/PORTOFOLIO/danarwasis/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
