// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import markdoc from "@astrojs/markdoc";
import keystatic from "@keystatic/astro";

import cloudflare from "@astrojs/cloudflare";

// Keystatic's admin UI needs Node filesystem APIs, which Cloudflare Workers
// do not provide. Keep it for local `astro dev` only; content is committed to git.
export default defineConfig({
	site: "https://example.com",
	integrations: [mdx(), sitemap(), markdoc(), react(), keystatic()],
	adapter: cloudflare({
		platformProxy: {
			enabled: true,
		},
	}),
});

