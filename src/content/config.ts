import { defineCollection, z } from 'astro:content';
// import {
// 	notionPageSchema,
// 	propertySchema,
// 	transformedPropertySchema,
// } from "notion-astro-loader/schemas";

// import { notionLoader } from "notion-astro-loader";
// import rehypeExternalLinks from 'rehype-external-links';
// import rehypeShiki from "@shikijs/rehype";

// const blog = defineCollection({
// 	loader: notionLoader({
// 		auth: import.meta.env.NOTION_TOKEN,
// 		database_id: import.meta.env.NOTION_BD_ID,
// 		filter: {
// 			property: "published",
// 			checkbox: { equals: true },
// 		},

// 		rehypePlugins: [
// 			[ rehypeShiki, { theme: "github-dark" } ],
// 			[ rehypeExternalLinks,
// 				{
// 					rel: [ 'external', 'nofollow', 'noopener', 'noreferrer' ],
// 					target: [ "_blank" ]
// 				}
// 			],
// 		],

// 	}),
// 	schema: notionPageSchema({
// 		properties: z.object({
// 			Name: transformedPropertySchema.title,
// 			created_at: propertySchema.date,
// 			tags: transformedPropertySchema.multi_select,
// 			slug: transformedPropertySchema.rich_text,
// 			thumbnail: transformedPropertySchema.url,
// 			credit: transformedPropertySchema.rich_text.optional(),
// 		})
// 	})
// });

const blog = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		idOnly: z.boolean().optional(),
		hasMath: z.boolean().optional(),
		draft: z.boolean().optional(),
		heroImage: z.string()
	}),
});

export const collections = { blog };
