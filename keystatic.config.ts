import { config, fields, collection } from "@keystatic/core";

export default config({
	storage: {
		kind: "local",
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
	},
});
