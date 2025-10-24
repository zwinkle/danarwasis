import { isFullPage, Client, iteratePaginatedAPI, isFullBlock } from '@notionhq/client';
import { toc } from '@jsdevtools/rehype-toc';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeKatex from 'rehype-katex';
import rehypeShiki from '@shikijs/rehype';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import notionRehype from 'notion-rehype-k';
import { unified } from 'unified';
import { a as getImage } from './_astro_assets_DXORqzvp.mjs';
import * as z from 'zod';
import '@astrojs/internal-helpers/path';
import '@astrojs/internal-helpers/remote';
import './astro/server_DwqtjhkU.mjs';
import { Redis } from '@upstash/redis';

/**
 * Extract a plain string from a list of rich text items.
 *
 * @see https://developers.notion.com/reference/rich-text
 *
 * @example
 * richTextToPlainText(page.properties.Name.title)
 */
function richTextToPlainText(data) {
    return data.map((text) => text.plain_text).join("");
}
function fileToUrl(file) {
    switch (file?.type) {
        case "external":
            return file.external.url;
        case "file":
            return file.file.url;
        default:
            return undefined;
    }
}
/**
 * Extract and locally cache the image from a file object.
 * @see https://developers.notion.com/reference/file-object
 */
async function fileToImageAsset(file) {
    return getImage({
        src: fileToUrl(file),
        inferSize: true,
    });
}
/**
 * Replace date strings with date objects.
 *
 * @see https://developers.notion.com/reference/page-property-values#date
 */
function dateToDateObjects(dateResponse) {
    if (dateResponse === null) {
        return null;
    }
    return {
        start: new Date(dateResponse.start),
        end: dateResponse.end ? new Date(dateResponse.end) : null,
        time_zone: dateResponse.time_zone,
    };
}

const filePropertyResponse = z.object({
    type: z.literal("file"),
    file: z.object({
        url: z.string(),
        expiry_time: z.string(),
    }),
});
const externalPropertyResponse = z.object({
    type: z.literal("external"),
    external: z.object({
        url: z.string(),
    }),
});

function propertySchema(type, schema) {
    return z.object({
        type: z.literal(type),
        id: z.string(),
        [type]: schema,
    });
}
const userObjectResponse = z
    .object({
    id: z.string(),
    object: z.literal("user"),
})
    .passthrough();
const selectPropertyResponse = z.object({
    id: z.string(),
    name: z.string(),
    color: z.string(),
});
const dateField = z.union([
    z.string().date(),
    z.string().datetime({ offset: true }),
]);
const dateResponse = z.object({
    start: dateField,
    end: dateField.nullable(),
    time_zone: z.string().nullable(),
});
const formulaPropertyResponse = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("string"),
        string: z.string().nullable().nullable(),
    }),
    z.object({
        type: z.literal("date"),
        date: z.string().datetime({ offset: true }).nullable(),
    }),
    z.object({
        type: z.literal("number"),
        number: z.number().nullable(),
    }),
    z.object({
        type: z.literal("boolean"),
        boolean: z.boolean().nullable(),
    }),
]);
const baseRickTextResponse = z.object({
    annotations: z
        .object({
        bold: z.boolean(),
        italic: z.boolean(),
        strikethrough: z.boolean(),
        underline: z.boolean(),
        code: z.boolean(),
        color: z.string(),
    })
        .passthrough(),
    plain_text: z.string(),
    href: z.string().nullable(),
});
const richTextItemResponse = z.discriminatedUnion("type", [
    baseRickTextResponse.extend({
        type: z.literal("text"),
        text: z.object({
            content: z.string(),
            link: z
                .object({
                url: z.string(),
            })
                .nullable(),
        }),
    }),
    baseRickTextResponse.extend({
        type: z.literal("mention"),
        mention: z
            .object({
            type: z.enum([
                "user",
                "date",
                "link_preview",
                "template_mention",
                "page",
                "database",
            ]),
        })
            .passthrough(),
    }),
    baseRickTextResponse.extend({
        type: z.literal("equation"),
        equation: z.object({
            expression: z.string(),
        }),
    }),
]);
const relationResponse = z.object({ id: z.string() });
const number = propertySchema("number", z.number().nullable());
const url = propertySchema("url", z.string().nullable());
const select = propertySchema("select", selectPropertyResponse.nullable());
const multi_select = propertySchema("multi_select", z.array(selectPropertyResponse));
const status = propertySchema("status", selectPropertyResponse.nullable());
const date = propertySchema("date", dateResponse.nullable());
const email = propertySchema("email", z.string().nullable());
const phone_number = propertySchema("phone_number", z.string().nullable());
const checkbox = propertySchema("checkbox", z.boolean());
propertySchema("files", z.array(z.discriminatedUnion("type", [
    filePropertyResponse.extend({ name: z.string() }),
    externalPropertyResponse.extend({ name: z.string() }),
])));
propertySchema("created_by", userObjectResponse);
const created_time = propertySchema("created_time", z.string().datetime({ offset: true }));
propertySchema("last_edited_by", userObjectResponse);
propertySchema("last_edited_time", z.string().datetime({ offset: true }));
propertySchema("formula", formulaPropertyResponse);
const title = propertySchema("title", z.array(richTextItemResponse));
const rich_text = propertySchema("rich_text", z.array(richTextItemResponse));
propertySchema("people", z.array(userObjectResponse));
propertySchema("relation", z.array(relationResponse));
propertySchema("rollup", z.discriminatedUnion("type", [
    z.object({
        function: z.string(),
        type: z.literal("number"),
        number: z.number().nullable(),
    }),
    z.object({
        function: z.string(),
        type: z.literal("date"),
        date: z.string().datetime({ offset: true }).nullable(),
    }),
    z.object({
        function: z.string(),
        type: z.literal("array"),
        array: z.array(z.discriminatedUnion("type", [
            z.object({
                type: z.literal("title"),
                title: z.array(richTextItemResponse),
            }),
            z.object({
                type: z.literal("rich_text"),
                rich_text: z.array(richTextItemResponse),
            }),
            z.object({
                type: z.literal("people"),
                people: z.array(userObjectResponse),
            }),
            z.object({
                type: z.literal("relation"),
                relation: z.array(relationResponse),
            }),
        ])),
    }),
]));
propertySchema("unique_id", z.any());

number.transform((property) => property.number);
url.transform((property) => property.url);
email.transform((property) => property.email);
phone_number.transform((property) => property.phone_number);
checkbox.transform((property) => property.checkbox);
select.transform((property) => property.select?.name ?? null);
multi_select.transform((property) => property.multi_select.map((option) => option.name) ?? []);
status.transform((property) => property.status?.name ?? null);
title.transform((property) => richTextToPlainText(property.title));
rich_text.transform((property) => richTextToPlainText(property.rich_text));
date.transform((property) => dateToDateObjects(property.date));
created_time.transform((property) => new Date(property.created_time));

unified()
    .use(notionRehype, {}) // Parse Notion blocks to rehype AST
    .use(rehypeSlug)
    .use(
// @ts-ignore
rehypeKatex) // Then you can use any rehype plugins to enrich the AST
    .use(rehypeStringify); // Turn AST to HTML string

z.object({
    icon: z
        .discriminatedUnion("type", [
        externalPropertyResponse,
        filePropertyResponse,
        z.object({
            type: z.literal("emoji"),
            emoji: z.string(),
        }),
    ])
        .nullable(),
    cover: z
        .discriminatedUnion("type", [
        externalPropertyResponse,
        filePropertyResponse,
    ])
        .nullable(),
    archived: z.boolean(),
    in_trash: z.boolean(),
    url: z.string().url(),
    public_url: z.string().url().nullable(),
    properties: z.object({}).catchall(z
        .object({
        type: z.string(),
        id: z.string(),
    })
        .passthrough()),
});

const noopLogger = {
  info: () => {
  },
  warn: () => {
  },
  error: () => {
  },
  debug: () => {
  },
  fork: () => noopLogger
};
let cachedNotionClient = null;
function getEnvVar(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing ${key} environment variable`);
  }
  return value;
}
function getNotionClient() {
  if (cachedNotionClient) {
    return cachedNotionClient;
  }
  const token = getEnvVar("NOTION_TOKEN");
  cachedNotionClient = new Client({ auth: token });
  return cachedNotionClient;
}
function getDatabaseId() {
  return getEnvVar("NOTION_BD_ID");
}
const redis = (() => {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  try {
    return Redis.fromEnv();
  } catch {
    return null;
  }
})();
const POSTS_CACHE_KEY = "notion:posts";
const POST_DETAIL_KEY_PREFIX = "notion:post:";
const PAGE_SLUG_KEY_PREFIX = "notion:page-slug:";
const LAST_UPDATED_KEY = "notion:last-updated";
async function redisGet(key) {
  if (!redis) return null;
  const value = await redis.get(key);
  if (value === null || value === void 0) {
    return null;
  }
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}
async function redisSet(key, value) {
  if (!redis) return;
  if (typeof value === "string") {
    await redis.set(key, value);
  } else {
    await redis.set(key, JSON.stringify(value));
  }
}
async function redisDel(key) {
  if (!redis) return;
  await redis.del(key);
}
async function markContentUpdated() {
  if (!redis) return;
  await redis.set(LAST_UPDATED_KEY, (/* @__PURE__ */ new Date()).toISOString());
}
async function getNotionContentVersion() {
  if (!redis) return null;
  const value = await redis.get(LAST_UPDATED_KEY);
  return typeof value === "string" ? value : null;
}
function getPostDetailKey(slug) {
  return `${POST_DETAIL_KEY_PREFIX}${slug}`;
}
function getPageSlugKey(pageId) {
  return `${PAGE_SLUG_KEY_PREFIX}${pageId}`;
}
function createBaseProcessor() {
  const processor = unified();
  processor.use(notionRehype, {}).use(rehypeSlug).use(rehypeKatex).use(rehypeStringify);
  return processor;
}
function buildProcessor(rehypePlugins) {
  let headings = [];
  const processorWithToc = createBaseProcessor().use(toc, {
    customizeTOC(toc) {
      headings = extractTocHeadings(toc);
      return false;
    }
  });
  const processorPromise = rehypePlugins.then((plugins) => {
    let processor = processorWithToc;
    for (const [plugin, options] of plugins) {
      processor = processor.use(plugin, options);
    }
    return processor;
  });
  return async function process2(blocks) {
    const processor = await processorPromise;
    const vFile = await processor.process({ data: blocks });
    return { vFile, headings };
  };
}
async function awaitAll(iterable) {
  const result = [];
  for await (const item of iterable) {
    result.push(item);
  }
  return result;
}
async function* listBlocks(client, blockId, fetchImage) {
  for await (const block of iteratePaginatedAPI(
    client.blocks.children.list,
    {
      block_id: blockId
    }
  )) {
    if (!isFullBlock(block)) {
      continue;
    }
    if (block.has_children) {
      const children = await awaitAll(
        listBlocks(client, block.id, fetchImage)
      );
      block[block.type].children = children;
    }
    if (block.type === "image") {
      const url = await fetchImage(block.image);
      yield {
        ...block,
        image: {
          type: block.image.type,
          [block.image.type]: url,
          caption: block.image.caption
        }
      };
    } else {
      yield block;
    }
  }
}
function extractTocHeadings(toc) {
  if (toc.tagName !== "nav") {
    throw new Error(`Expected nav, got ${toc.tagName}`);
  }
  function listElementToTree(ol, depth) {
    return ol.children.flatMap((li) => {
      const [linkNode, subList] = li.children;
      const link = linkNode;
      const currentHeading = {
        depth,
        text: link.children[0].value,
        slug: link.properties.href.slice(1)
      };
      let headingsList = [currentHeading];
      if (subList) {
        headingsList = headingsList.concat(
          listElementToTree(subList, depth + 1)
        );
      }
      return headingsList;
    });
  }
  return listElementToTree(toc.children[0], 0);
}
class NotionPageRenderer {
  constructor(client, page, parentLogger) {
    this.client = client;
    this.page = page;
    this.#logger = parentLogger.fork(`page ${page.id}`);
  }
  #imagePaths = [];
  #logger;
  async render(process2) {
    this.#logger.debug("Rendering");
    try {
      const blocks = await awaitAll(
        listBlocks(this.client, this.page.id, this.#fetchImage)
      );
      const { vFile, headings } = await process2(blocks);
      this.#logger.debug("Rendered");
      return {
        html: vFile.toString(),
        metadata: {
          headings,
          imagePaths: this.#imagePaths
        }
      };
    } catch (error) {
      this.#logger.error(`Failed to render: ${getErrorMessage(error)}`);
      return void 0;
    }
  }
  #fetchImage = async (imageFileObject) => {
    try {
      const fetchedImageData = await fileToImageAsset(imageFileObject);
      this.#imagePaths.push(fetchedImageData.src);
      return fetchedImageData.src;
    } catch (error) {
      this.#logger.error(
        `Failed to fetch image when rendering page: ${getErrorMessage(error)}`
      );
      return fileToUrl(imageFileObject) ?? "";
    }
  };
}
function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Unknown error";
}
const processNotionContent = buildProcessor(
  Promise.resolve([
    [rehypeShiki, { theme: "github-dark" }],
    [
      rehypeExternalLinks,
      {
        rel: ["external", "nofollow", "noopener", "noreferrer"],
        target: ["_blank"]
      }
    ]
  ])
);
async function getNotionPosts() {
  if (redis) {
    const cached = await redisGet(POSTS_CACHE_KEY);
    if (cached) {
      return cached.map(cloneSummary);
    }
  }
  const summaries = await fetchNotionPostsFromApi();
  if (redis) {
    await redisSet(POSTS_CACHE_KEY, summaries);
    await Promise.all(
      summaries.map((summary) => redisSet(getPageSlugKey(summary.id), summary.slug))
    );
    await markContentUpdated();
  }
  return summaries.map(cloneSummary);
}
async function getNotionPost(slug) {
  if (redis) {
    const cached = await redisGet(getPostDetailKey(slug));
    if (cached) {
      return cloneDetail(cached);
    }
  }
  const detail = await fetchNotionPostFromApi(slug);
  if (!detail && redis) {
    await removeCachedPostBySlug(slug);
  }
  return detail ? cloneDetail(detail) : null;
}
async function invalidateNotionCacheForPage(pageId) {
  if (!redis) return;
  const slug = await redisGet(getPageSlugKey(pageId));
  if (slug) {
    await removeCachedPostBySlug(slug);
    return;
  }
  await removeCachedPostById(pageId);
}
async function rebuildNotionCache() {
  const summaries = await fetchNotionPostsFromApi();
  if (!redis) {
    return;
  }
  await redisSet(POSTS_CACHE_KEY, summaries);
  await Promise.all(
    summaries.map((summary) => redisSet(getPageSlugKey(summary.id), summary.slug))
  );
  await markContentUpdated();
  await Promise.all(
    summaries.map(async (summary) => {
      const detail = await fetchNotionPostFromApi(summary.slug);
      if (!detail) {
        await removeCachedPostById(summary.id);
      }
    })
  );
}
function cloneSummary(summary) {
  return {
    ...summary,
    tags: [...summary.tags]
  };
}
function cloneDetail(detail) {
  return {
    ...detail,
    tags: [...detail.tags],
    headings: detail.headings.map((heading) => ({ ...heading }))
  };
}
function mapPageToSummary(page) {
  const slug = getRichText(page.properties?.slug) ?? page.id;
  return {
    id: page.id,
    slug,
    title: getTitle(page.properties?.Name) ?? "Untitled",
    createdAt: getDate(page.properties?.created_at),
    updatedAt: typeof page.last_edited_time === "string" ? page.last_edited_time : null,
    tags: getMultiSelect(page.properties?.tags),
    thumbnail: getUrl(page.properties?.thumbnail),
    credit: getRichText(page.properties?.credit)
  };
}
function getTitle(property) {
  if (property?.type === "title") {
    const value = property.title?.map((item) => item.plain_text).join("") ?? "";
    return value.trim() || null;
  }
  return null;
}
function getRichText(property) {
  if (property?.type === "rich_text") {
    const value = property.rich_text?.map((item) => item.plain_text).join("") ?? "";
    return value.trim() || null;
  }
  return null;
}
function getDate(property) {
  if (property?.type === "date") {
    return property.date?.start ?? null;
  }
  return null;
}
function getUrl(property) {
  if (property?.type === "url") {
    return property.url ?? null;
  }
  if (property?.type === "files") {
    const file = property.files?.[0];
    if (!file) {
      return null;
    }
    if (file.type === "file") {
      return file.file?.url ?? null;
    }
    if (file.type === "external") {
      return file.external?.url ?? null;
    }
  }
  return null;
}
function getMultiSelect(property) {
  if (property?.type === "multi_select") {
    return property.multi_select?.map((item) => item.name).filter(Boolean) ?? [];
  }
  return [];
}
function sortSummariesByCreatedAt(posts) {
  return [...posts].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });
}
async function fetchNotionPostsFromApi() {
  const notion = getNotionClient();
  const response = await notion.databases.query({
    database_id: getDatabaseId(),
    filter: {
      property: "published",
      checkbox: { equals: true }
    },
    sorts: [
      {
        property: "created_at",
        direction: "descending"
      }
    ]
  });
  const summaries = response.results.filter((page) => isFullPage(page)).map((page) => mapPageToSummary(page));
  return sortSummariesByCreatedAt(summaries);
}
async function fetchNotionPostFromApi(slug) {
  const notion = getNotionClient();
  const response = await notion.databases.query({
    database_id: getDatabaseId(),
    filter: {
      and: [
        {
          property: "published",
          checkbox: { equals: true }
        },
        {
          property: "slug",
          rich_text: { equals: slug }
        }
      ]
    },
    page_size: 1
  });
  const page = response.results.find((result) => isFullPage(result));
  if (!page) {
    return null;
  }
  const detail = await buildDetailFromPage(notion, page);
  await cacheNotionPost(detail);
  return detail;
}
async function buildDetailFromPage(notion, page, summary) {
  const baseSummary = mapPageToSummary(page);
  const renderer = new NotionPageRenderer(notion, page, noopLogger);
  const rendered = await renderer.render(processNotionContent);
  return {
    ...baseSummary,
    html: rendered?.html ?? "",
    headings: rendered?.metadata?.headings ?? []
  };
}
async function cacheNotionPost(detail) {
  if (!redis) return;
  const previous = await updateCachedSummaries(detail);
  await redisSet(getPostDetailKey(detail.slug), detail);
  await redisSet(getPageSlugKey(detail.id), detail.slug);
  if (previous && previous.slug !== detail.slug) {
    await redisDel(getPostDetailKey(previous.slug));
  }
  await markContentUpdated();
}
async function updateCachedSummaries(summary) {
  if (!redis) return null;
  const cached = await redisGet(POSTS_CACHE_KEY) ?? [];
  const previous = cached.find((item) => item.id === summary.id) ?? null;
  const next = cached.filter((item) => item.id !== summary.id);
  next.push(cloneSummary(summary));
  const sorted = sortSummariesByCreatedAt(next);
  await redisSet(POSTS_CACHE_KEY, sorted);
  return previous;
}
async function removeCachedPostById(pageId) {
  if (!redis) return;
  const cached = await redisGet(POSTS_CACHE_KEY);
  if (!cached) return;
  const existing = cached.find((item) => item.id === pageId);
  if (!existing) return;
  const next = cached.filter((item) => item.id !== pageId);
  await redisDel(getPostDetailKey(existing.slug));
  await redisDel(getPageSlugKey(pageId));
  await redisSet(POSTS_CACHE_KEY, sortSummariesByCreatedAt(next));
  await markContentUpdated();
}
async function removeCachedPostBySlug(slug) {
  if (!redis) return;
  const cached = await redisGet(POSTS_CACHE_KEY);
  if (!cached) return;
  const target = cached.find((item) => item.slug === slug);
  const next = cached.filter((item) => item.slug !== slug);
  if (next.length === cached.length) {
    return;
  }
  await redisDel(getPostDetailKey(slug));
  if (target) {
    await redisDel(getPageSlugKey(target.id));
  }
  await redisSet(POSTS_CACHE_KEY, sortSummariesByCreatedAt(next));
  await markContentUpdated();
}

export { getNotionPosts as a, getNotionPost as b, getNotionContentVersion as g, invalidateNotionCacheForPage as i, rebuildNotionCache as r };
