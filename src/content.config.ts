import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({
		base: "./src/content/blog",
		pattern: "**/*.{md,mdx,mdoc}",
	}),

	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string(),
		description: z.string(),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
	}),
});

const pages = defineCollection({
	// Locale folders: da/*.mdoc, en/*.mdoc — entry ids like `da/baggrund`
	loader: glob({
		base: "./src/content/pages",
		pattern: "**/*.{md,mdoc}",
	}),

	schema: z.object({
		title: z.string(),
		description: z.string(),
		heroImage: z.string().optional(),
	}),
});

const footer = defineCollection({
	loader: glob({
		base: "./src/content/footer",
		pattern: "*/index.mdoc",
	}),
	schema: z.object({}),
});

export const collections = { blog, pages, footer };
