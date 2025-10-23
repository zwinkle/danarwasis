import UnoCss from "unocss/astro";
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import netlify from '@astrojs/netlify';
import yaml from "@rollup/plugin-yaml";

// https://astro.build/config
export default defineConfig({
  site: "https://danarwasis.my.id",
  experimental: {
    session: true
  },
  vite: {
    plugins: [ yaml() ]
  },
  integrations: [
    sitemap({
      changefreq: 'monthly',
      'priority': 0.7,
      'lastmod': new Date(),
    }),
    UnoCss({ injectReset: true }),
  ],
  output: "server",
  adapter: netlify({
    edgeMiddleware: true
  }),
});
