import { config, fields, collection } from "@keystatic/core";

/**
 * Keystatic Configuration
 *
 * Supports two modes:
 * 1. Local mode (development): Files stored in src/content/blog/, edited via admin UI at /keystatic
 * 2. GitHub mode (production): Content committed to GitHub, edited from deployed admin UI with OAuth
 *
 * GitHub mode is enabled when KEYSTATIC_GITHUB_CLIENT_ID environment variable is present.
 * This allows:
 * - Production admin UI with GitHub OAuth authentication
 * - Automatic commits of content changes to your git repository
 * - Read-only fallback on Cloudflare Workers (no local filesystem access)
 */

const isGitHubMode =
	typeof process !== "undefined" &&
	process.env.KEYSTATIC_GITHUB_CLIENT_ID &&
	process.env.KEYSTATIC_GITHUB_CLIENT_SECRET;

export default config({
	storage: isGitHubMode
		? {
				kind: "github",
				repo: {
					owner: process.env.KEYSTATIC_GITHUB_REPO_OWNER || "alexhornbake",
					name: process.env.KEYSTATIC_GITHUB_REPO_NAME || "ankersted-web",
				},
				branch: process.env.KEYSTATIC_GITHUB_BRANCH || "main",
			}
		: {
				kind: "local",
			},

	...(isGitHubMode && {
		github: {
			clientId: process.env.KEYSTATIC_GITHUB_CLIENT_ID!,
			clientSecret: process.env.KEYSTATIC_GITHUB_CLIENT_SECRET!,
			secret: process.env.KEYSTATIC_SECRET,
		},
	}),

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
	},
});
