import { d as createAstro, c as createComponent, a as renderComponent, r as renderTemplate, m as maybeRenderHead, f as renderSlot } from './astro/server_BpWn34nF.mjs';
import 'kleur/colors';
import { $ as $$Layout } from './Layout_DwNEso5n.mjs';
/* empty css                              */

const $$Astro = createAstro("https://danarwasis.my.id");
const $$PlainMarkdown = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$PlainMarkdown;
  const { title, description } = Astro2.props.frontmatter;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": title, "description": description }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="relative" id="top"> <div class="px-8"> <article class="max-w-3xl m-auto prose slide-enter-content pb32"> ${renderSlot($$result2, $$slots["default"])} </article> </div> </div> <a href="#top" id="back-to-top" class="fixed bottom-4 right-4 m-4 i-solar-alt-arrow-up-bold w8 h8"></a> ` })} `;
}, "D:/code/PORTOFOLIO/danarwasis/src/layouts/PlainMarkdown.astro", void 0);

export { $$PlainMarkdown as $ };
