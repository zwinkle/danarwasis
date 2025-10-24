import { renderers } from './renderers.mjs';
import { s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_CvSoi7hX.mjs';
import { manifest } from './manifest_D21M58Xq.mjs';
import { createExports } from '@astrojs/netlify/ssr-function.js';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/404.astro.mjs');
const _page2 = () => import('./pages/api/notion/refresh.json.astro.mjs');
const _page3 = () => import('./pages/api/notion/revalidate.json.astro.mjs');
const _page4 = () => import('./pages/api/notion/updates.json.astro.mjs');
const _page5 = () => import('./pages/blog/tags/_slug_.astro.mjs');
const _page6 = () => import('./pages/blog/_slug_.astro.mjs');
const _page7 = () => import('./pages/blog.astro.mjs');
const _page8 = () => import('./pages/disclaimer.astro.mjs');
const _page9 = () => import('./pages/privacy.astro.mjs');
const _page10 = () => import('./pages/projects.astro.mjs');
const _page11 = () => import('./pages/robots.txt.astro.mjs');
const _page12 = () => import('./pages/rss.xml.astro.mjs');
const _page13 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/404.astro", _page1],
    ["src/pages/api/notion/refresh.json.ts", _page2],
    ["src/pages/api/notion/revalidate.json.ts", _page3],
    ["src/pages/api/notion/updates.json.ts", _page4],
    ["src/pages/blog/tags/[slug].astro", _page5],
    ["src/pages/blog/[slug].astro", _page6],
    ["src/pages/blog/index.astro", _page7],
    ["src/pages/disclaimer.md", _page8],
    ["src/pages/privacy.md", _page9],
    ["src/pages/projects.astro", _page10],
    ["src/pages/robots.txt.ts", _page11],
    ["src/pages/rss.xml.js", _page12],
    ["src/pages/index.astro", _page13]
]);
const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./_noop-actions.mjs'),
    middleware: undefined
});
const _args = {
    "middlewareSecret": "7f077ca0-bc11-47d5-a84f-10c1885e0e26"
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (_start in serverEntrypointModule) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { __astrojsSsrVirtualEntry as default, pageMap };
