import { config, fields, collection } from "@keystatic/core";

/**
 * Keystatic Configuration
 *
 * This config supports both:
 * - Local mode: No KEYSTATIC_GITHUB_CLIENT_ID env var → uses local file storage
 * - GitHub mode: KEYSTATIC_GITHUB_CLIENT_ID env var provided → uses GitHub + OAuth
 *
 * Keystatic automatically detects the mode based on environment variables.
 */

// Safely access environment variables - works in server, browser, and Cloudflare Worker contexts
const getEnv = (key: string): string | undefined => {
	if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env[key]) {
		return import.meta.env[key];
	}
	if (typeof process !== "undefined" && process.env && process.env[key]) {
		return process.env[key];
	}
	return undefined;
};

const clientId = getEnv("KEYSTATIC_GITHUB_CLIENT_ID");
const clientSecret = getEnv("KEYSTATIC_GITHUB_CLIENT_SECRET");
const secret = getEnv("KEYSTATIC_SECRET");

// Base config - always valid
const baseConfig: Parameters<typeof config>[0] = {
	storage:
		process.env.NODE_ENV === "development" && !clientId
			? { kind: "local" }
			: {
					kind: "github",
					repo: {
						owner: "alexhornbake",
						name: "ankersted-web",
					},
					branch: "main",
			  },

	collections: {
		blog: collection({
			label: "Blog",
			slugField: "title",
			path: "src/content/blog/*",
			format: { contentField: "content" },
			schema: {
				title: fields.slug({ name: { label: "Title" } }),
				description: fields.text({
					label: "Description",
					multiline: true,
				}),
				pubDate: fields.date({ label: "Publish date" }),
				updatedDate: fields.date({ label: "Updated date" }),
				heroImage: fields.text({ label: "Hero image" }),
				content: fields.markdoc({
					label: "Content",
				}),
			},
		}),
		pages: collection({
			label: "Pages",
			slugField: "title",
			path: "src/content/pages/*",
			format: { contentField: "content" },
			schema: {
				title: fields.slug({ name: { label: "Title" } }),
				description: fields.text({
					label: "Description",
					multiline: true,
				}),
				heroImage: fields.text({ label: "Hero image" }),
				content: fields.markdoc({
					label: "Content",
				}),
			},
		}),
	},
};

// Include GitHub config so Keystatic handles GitHub OAuth on Cloudflare Workers
(baseConfig as any).github = {
	clientId,
	clientSecret,
	secret,
};

export default config(baseConfig);
