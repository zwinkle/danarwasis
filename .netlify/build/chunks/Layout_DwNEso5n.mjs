import { d as createAstro, c as createComponent, b as addAttribute, e as renderScript, r as renderTemplate, a as renderComponent, m as maybeRenderHead, n as defineScriptVars, u as unescapeHTML, o as renderHead, f as renderSlot } from './astro/server_BpWn34nF.mjs';
import 'kleur/colors';
import 'clsx';
/* empty css                          */

const $$Astro$4 = createAstro("https://danarwasis.my.id");
const $$ClientRouter = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$ClientRouter;
  const { fallback = "animate" } = Astro2.props;
  return renderTemplate`<meta name="astro-view-transitions-enabled" content="true"><meta name="astro-view-transitions-fallback"${addAttribute(fallback, "content")}>${renderScript($$result, "D:/code/PORTOFOLIO/danarwasis/node_modules/astro/components/ClientRouter.astro?astro&type=script&index=0&lang.ts")}`;
}, "D:/code/PORTOFOLIO/danarwasis/node_modules/astro/components/ClientRouter.astro", void 0);

var __freeze$2 = Object.freeze;
var __defProp$2 = Object.defineProperty;
var __template$2 = (cooked, raw) => __freeze$2(__defProp$2(cooked, "raw", { value: __freeze$2(cooked.slice()) }));
var _a$2;
const $$Astro$3 = createAstro("https://danarwasis.my.id");
const $$BaseHead = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$BaseHead;
  const canonicalURL = new URL(Astro2.url.pathname, Astro2.site);
  const { title, description, image = "/images/screenshot-dark.png" } = Astro2.props;
  return renderTemplate(_a$2 || (_a$2 = __template$2(['<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="generator"', '><link rel="canonical"', '><script defer>\n	!(function () {\n		var e = window.matchMedia("(prefers-color-scheme: dark)").matches;\n		var t = localStorage.getItem("isDarkMode") || "auto";\n		if (t === "true" || (e && t !== "false")) {\n			document.documentElement.classList.toggle("dark", !0);\n		}\n	})();\n<\/script><title>', '</title><meta name="title"', '><meta name="description"', '><meta property="og:type" content="website"><meta property="og:url"', '><meta property="og:title"', '><meta property="og:site_name"', '><meta property="og:description"', '><meta property="og:image"', '><meta property="twitter:card" content="summary_large_image"><meta property="twitter:url"', '><meta property="twitter:title"', '><meta property="twitter:description"', '><meta property="twitter:image"', '><link rel="sitemap" type="application/xml" href="/sitemap-index.xml">', ""])), addAttribute(Astro2.generator, "content"), addAttribute(canonicalURL, "href"), title, addAttribute(title, "content"), addAttribute(description, "content"), addAttribute(Astro2.url, "content"), addAttribute(title, "content"), addAttribute(Astro2.site, "content"), addAttribute(description, "content"), addAttribute(new URL(image, Astro2.url), "content"), addAttribute(Astro2.url, "content"), addAttribute(title, "content"), addAttribute(description, "content"), addAttribute(new URL(image, Astro2.url), "content"), renderComponent($$result, "ClientRouter", $$ClientRouter, {}));
}, "D:/code/PORTOFOLIO/danarwasis/src/components/BaseHead.astro", void 0);

const $$Astro$2 = createAstro("https://danarwasis.my.id");
const $$Footer = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$Footer;
  return renderTemplate`${maybeRenderHead()}<footer class="py-4 px-4 text-xs text-center slide-enter-content pb-32"> <p style="--enter-stage: 10 !important;"> <a href="https://creativecommons.org/licenses/by-nc-sa/4.0" target="_blank" rel="external nofollow noopener noreferrer" class="underline">CC BY-NC-SA 4.0</a> <span id="year"></span> © Zwinkle | <a href="/privacy" class="underline">Kebijakan Privasi</a> | <a href="/disclaimer" class="underline">Pernyataan</a> | <a href="https://danarwasis.betteruptime.com" target="_blank" rel="external nofollow noopener noreferrer" class="underline">Status</a> </p> ${renderScript($$result, "D:/code/PORTOFOLIO/danarwasis/src/components/Footer.astro?astro&type=script&index=0&lang.ts")}  <p style="--enter-stage: 11 !important;">
Dibuat oleh <a href="https://github.com/zwinkle" target="_blank" rel="external nofollow noopener noreferrer" class="underline">Zwinkle</a> menggunakan <a href="https://astro.build" target="_blank" rel="external nofollow noopener noreferrer" class="underline">Astro</a>, <a href="https://unocss.dev/" target="_blank" rel="external nofollow noopener noreferrer" class="underline">UnoCSS</a> </p> </footer>`;
}, "D:/code/PORTOFOLIO/danarwasis/src/components/Footer.astro", void 0);

var __freeze$1 = Object.freeze;
var __defProp$1 = Object.defineProperty;
var __template$1 = (cooked, raw) => __freeze$1(__defProp$1(cooked, "raw", { value: __freeze$1(raw || cooked.slice()) }));
var _a$1;
const $$ToggleTheme = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate(_a$1 || (_a$1 = __template$1(["", '<button class="toggle-theme flex items-center" id="toggle-theme" aria-label="Ganti Tema" title="Ganti Tema"> <div class="w5 h5 i-myna-moon dark:i-myna-sun dark:w5 dark:h5"></div> </button> <script>\n	document.addEventListener("astro:page-load", () => {\n		let theme = localStorage.getItem("isDarkMode") || "auto";\n		let windowTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;\n		let isDarkMode = theme === "true" || (theme === "auto" && windowTheme);\n\n		document.documentElement.classList.toggle("dark", isDarkMode);\n		localStorage.setItem("isDarkMode", isDarkMode.toString());\n\n		function toogleDarkMode(event) {\n			const isTransitionAvailable = document.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;\n\n			if (!isTransitionAvailable) {\n				let isDark = localStorage.getItem("isDarkMode") == "true";\n				localStorage.setItem("isDarkMode", !isDark);\n				document.documentElement.classList.toggle("dark", !isDark);\n				return;\n			}\n\n			const transition = document.startViewTransition(async () => {\n				const element = document.documentElement;\n				let isDark = element.classList.contains("dark");\n\n				isDark = !isDark;\n\n				element.classList.toggle("dark", isDark);\n				localStorage.setItem("isDarkMode", isDark);\n			});\n\n			transition.ready.then(() => {\n				let isDark = localStorage.getItem("isDarkMode") === "true";\n\n				// Use event instead of center of the button becuase in some cases the calculation is wrong\n				// This will fix later if i have time :D (or you can do it)\n				const x = event.clientX;\n				const y = event.clientY;\n				const endRadius = Math.hypot(Math.max(window.innerWidth - x, x), Math.max(window.innerHeight - y, y));\n\n				const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`];\n\n				document.documentElement.animate(\n					{\n						clipPath: isDark ? [...clipPath].reverse() : clipPath,\n					},\n					{\n						duration: 500,\n						easing: "ease-out",\n						pseudoElement: isDark ? "::view-transition-old(root)" : "::view-transition-new(root)",\n					}\n				);\n			});\n		}\n\n		document.getElementById("toggle-theme").addEventListener("click", toogleDarkMode);\n	});\n\n	document.addEventListener("astro:after-swap", () => {\n		localStorage.getItem("isDarkMode") === "true"\n			? document.documentElement.classList.add("dark")\n			: document.documentElement.classList.remove("dark");\n	});\n<\/script>'], ["", '<button class="toggle-theme flex items-center" id="toggle-theme" aria-label="Ganti Tema" title="Ganti Tema"> <div class="w5 h5 i-myna-moon dark:i-myna-sun dark:w5 dark:h5"></div> </button> <script>\n	document.addEventListener("astro:page-load", () => {\n		let theme = localStorage.getItem("isDarkMode") || "auto";\n		let windowTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;\n		let isDarkMode = theme === "true" || (theme === "auto" && windowTheme);\n\n		document.documentElement.classList.toggle("dark", isDarkMode);\n		localStorage.setItem("isDarkMode", isDarkMode.toString());\n\n		function toogleDarkMode(event) {\n			const isTransitionAvailable = document.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;\n\n			if (!isTransitionAvailable) {\n				let isDark = localStorage.getItem("isDarkMode") == "true";\n				localStorage.setItem("isDarkMode", !isDark);\n				document.documentElement.classList.toggle("dark", !isDark);\n				return;\n			}\n\n			const transition = document.startViewTransition(async () => {\n				const element = document.documentElement;\n				let isDark = element.classList.contains("dark");\n\n				isDark = !isDark;\n\n				element.classList.toggle("dark", isDark);\n				localStorage.setItem("isDarkMode", isDark);\n			});\n\n			transition.ready.then(() => {\n				let isDark = localStorage.getItem("isDarkMode") === "true";\n\n				// Use event instead of center of the button becuase in some cases the calculation is wrong\n				// This will fix later if i have time :D (or you can do it)\n				const x = event.clientX;\n				const y = event.clientY;\n				const endRadius = Math.hypot(Math.max(window.innerWidth - x, x), Math.max(window.innerHeight - y, y));\n\n				const clipPath = [\\`circle(0px at \\${x}px \\${y}px)\\`, \\`circle(\\${endRadius}px at \\${x}px \\${y}px)\\`];\n\n				document.documentElement.animate(\n					{\n						clipPath: isDark ? [...clipPath].reverse() : clipPath,\n					},\n					{\n						duration: 500,\n						easing: "ease-out",\n						pseudoElement: isDark ? "::view-transition-old(root)" : "::view-transition-new(root)",\n					}\n				);\n			});\n		}\n\n		document.getElementById("toggle-theme").addEventListener("click", toogleDarkMode);\n	});\n\n	document.addEventListener("astro:after-swap", () => {\n		localStorage.getItem("isDarkMode") === "true"\n			? document.documentElement.classList.add("dark")\n			: document.documentElement.classList.remove("dark");\n	});\n<\/script>'])), maybeRenderHead());
}, "D:/code/PORTOFOLIO/danarwasis/src/components/ToggleTheme.astro", void 0);

const $$Header = createComponent(($$result, $$props, $$slots) => {
  const links = [
    {
      href: "/blog",
      label: "Blog",
      icon: "i-myna-book"
    },
    {
      href: "/projects",
      label: "Projects",
      icon: "i-myna-sparkles"
    }
  ];
  const iconLinks = [
    {
      href: "https://github.com/zwinkle",
      icon: "i-myna-brand-github",
      label: "GitHub"
    },
    {
      href: "https://twitter.com/dandxman8",
      icon: "i-myna-brand-x",
      label: "Twitter"
    },
    {
      href: "mailto:danarwasis@gmail.com",
      icon: "i-myna-envelope",
      label: "Email"
    },
    {
      href: "/rss.xml",
      icon: "i-myna-rss",
      label: "RSS"
    }
  ];
  return renderTemplate`${maybeRenderHead()}<nav class="px-8 py-6 w-full flex items-center justify-between fixed bottom-0 left-0 md:relative bg-l-base dark:bg-d-base z-100"> <a href="/" title="Beranda" aria-label="Beranda"> <div class="flex justify-between gap-2 font-bold"> <span class="i-myna-terminal w-6 h-6"></span> <span class="hidden sm:block">Zwinkle</span> </div> </a> <div class="flex items-center gap-4"> ${links.map((link) => renderTemplate`<a${addAttribute(link.href, "href")} class=" flex items-center"${addAttribute(link.label, "title")}${addAttribute(link.label, "aria-label")}> <span${addAttribute(link.icon + " w-5 h-5 sm:hidden", "class")}></span> <span class=" hidden sm:block">${link.label}</span> </a>`)} ${iconLinks.map((link) => renderTemplate`<a${addAttribute(link.href, "href")} class=" flex items-center" rel="noopener" target="_blank"${addAttribute(link.label, "aria-label")}${addAttribute(link.label, "title")}> <span${addAttribute(link.icon + " w-5 h-5", "class")}></span> </a>`)} ${renderComponent($$result, "ToggleTheme", $$ToggleTheme, {})} </div> </nav>`;
}, "D:/code/PORTOFOLIO/danarwasis/src/components/Header.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro$1 = createAstro("https://danarwasis.my.id");
const $$LoadingIndicator = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$LoadingIndicator;
  const {
    color,
    height = "2px",
    class: className = "astro-loading-indicator",
    animationDuration = 300,
    threshold: defaultThreshold = 200
  } = Astro2.props;
  const threshold = defaultThreshold === false ? 0 : 200;
  const styles = `.${className} {
  pointer-events: none;
  background-color: ${color};
  position: fixed;
  z-index: 1031;
  top: 0;
  left: 0;
  width: 100%;
  height: ${height};
  transition: transform ${animationDuration}ms ease-out, opacity ${animationDuration / 2}ms ${animationDuration / 2}ms ease-in;
	transform: translate3d(0, 0, 0) scaleX(var(--progress, 0));
  transform-origin: 0;
}`;
  return renderTemplate(_a || (_a = __template(["<style is:global>", "</style><script>(function(){", `
(() => {
  let progress = 0.25
  let opacity = 0
  let trickleInterval = undefined
  let thresholdTimeout = undefined;

  const element = document.createElement("div")
  element.classList.add(className)
  element.ariaHidden = "true"

  const setProgress = (_progress) => {
    progress = _progress
    element.style.setProperty('--progress', String(progress))
  }

  const setOpacity = (_opacity) => {
    opacity = _opacity
    element.style.setProperty('opacity', String(opacity))
  }

  setOpacity(opacity)

  document.addEventListener("DOMContentLoaded", () => {
    document.body.prepend(element)
  })

  document.addEventListener("astro:before-preparation", () => {
    thresholdTimeout = setTimeout(() => {
      setOpacity(1)
      trickleInterval = window.setInterval(() => {
        setProgress(progress + Math.random() * 0.03)
      }, animationDuration)
    }, threshold)
  })

  document.addEventListener("astro:before-swap", (ev) => {
    if (!thresholdTimeout) {
      return
    }
    window.clearTimeout(thresholdTimeout)

    ev.newDocument.body.prepend(element)
    window.clearInterval(trickleInterval)
    trickleInterval = undefined

    setProgress(1)
    window.setTimeout(() => {
      setOpacity(0)
    }, animationDuration / 2)

    window.setTimeout(() => {
      setProgress(0.25)
    }, animationDuration * 2)
  })
})()
})();<\/script>`])), unescapeHTML(styles), defineScriptVars({ className, animationDuration, threshold }));
}, "D:/code/PORTOFOLIO/danarwasis/src/components/LoadingIndicator.astro", void 0);

const $$Astro = createAstro("https://danarwasis.my.id");
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title, description, image } = Astro2.props;
  return renderTemplate`<html lang="en"> <head>${renderComponent($$result, "BaseHead", $$BaseHead, { "title": title, "description": description, "image": image })}${renderHead()}</head> <body class=" dark:bg-d-base dark:text-d-on-base bg-l-base text-l-on-base font-sans pb-5 md:pb-3em"> <a href="#main" class="sr-only focus:not-sr-only" tabindex="0">Skip to main content</a> ${renderComponent($$result, "LoadingIndicator", $$LoadingIndicator, { "color": "#bcc0cc", "height": "2px", "threshold": 0, "animationDuration": 200 })} ${renderComponent($$result, "Header", $$Header, {})} <main id="main" class="pb-10 lg:pb-0"> ${renderSlot($$result, $$slots["default"])} </main> ${renderComponent($$result, "Footer", $$Footer, {})} </body></html>`;
}, "D:/code/PORTOFOLIO/danarwasis/src/layouts/Layout.astro", void 0);

export { $$Layout as $ };
