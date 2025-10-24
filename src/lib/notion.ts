import {
  Client,
  isFullBlock,
  isFullPage,
  iteratePaginatedAPI,
} from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { MarkdownHeading } from "astro";
import {
  toc as rehypeToc,
  type HtmlElementNode,
  type ListNode,
  type TextNode,
} from "@jsdevtools/rehype-toc";
import rehypeExternalLinks from "rehype-external-links";
import rehypeKatex from "rehype-katex";
import rehypeShiki from "@shikijs/rehype";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import notionRehype from "notion-rehype-k";
import { unified, type Plugin } from "unified";
import { fileToImageAsset, fileToUrl } from "notion-astro-loader";
import { Redis } from "@upstash/redis";

type Logger = {
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
  fork: (...args: unknown[]) => Logger;
};

const noopLogger: Logger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
  fork: () => noopLogger,
};

let cachedNotionClient: Client | null = null;

function getEnvVar(key: "NOTION_TOKEN" | "NOTION_BD_ID"): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing ${key} environment variable`);
  }

  return value;
}

function getNotionClient(): Client {
  if (cachedNotionClient) {
    return cachedNotionClient;
  }

  const token = getEnvVar("NOTION_TOKEN");

  cachedNotionClient = new Client({ auth: token });
  return cachedNotionClient;
}

function getDatabaseId(): string {
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

async function redisGet<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  const value = await redis.get<string>(key);
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }
  return value as T;
}

async function redisSet<T>(key: string, value: T) {
  if (!redis) return;
  if (typeof value === "string") {
    await redis.set(key, value);
  } else {
    await redis.set(key, JSON.stringify(value));
  }
}

async function redisDel(key: string) {
  if (!redis) return;
  await redis.del(key);
}

async function markContentUpdated() {
  if (!redis) return;
  await redis.set(LAST_UPDATED_KEY, new Date().toISOString());
}

export async function getNotionContentVersion(): Promise<string | null> {
  if (!redis) return null;
  const value = await redis.get<string>(LAST_UPDATED_KEY);
  return typeof value === "string" ? value : null;
}

function getPostDetailKey(slug: string): string {
  return `${POST_DETAIL_KEY_PREFIX}${slug}`;
}

function getPageSlugKey(pageId: string): string {
  return `${PAGE_SLUG_KEY_PREFIX}${pageId}`;
}

type FileObject = Parameters<typeof fileToImageAsset>[0];
type RehypePlugin = Plugin<any[], any>;

function createBaseProcessor() {
  const processor = unified();
  (processor as any)
    .use(notionRehype, {})
    .use(rehypeSlug)
    .use(rehypeKatex)
    .use(rehypeStringify);
  return processor as any;
}

function buildProcessor(
  rehypePlugins: Promise<ReadonlyArray<readonly [RehypePlugin, any]>>,
) {
  let headings: MarkdownHeading[] = [];

  const processorWithToc = (createBaseProcessor() as any).use(rehypeToc, {
    customizeTOC(toc: HtmlElementNode) {
      headings = extractTocHeadings(toc);
      return false;
    },
  });

  const processorPromise = rehypePlugins.then((plugins) => {
    let processor = processorWithToc as any;
    for (const [plugin, options] of plugins) {
      processor = processor.use(plugin as any, options);
    }
    return processor;
  });

  return async function process(blocks: unknown[]) {
    const processor = await processorPromise;
    const vFile = await processor.process({ data: blocks } as Record<
      string,
      unknown
    >);
    return { vFile, headings };
  };
}

async function awaitAll<T>(iterable: AsyncIterable<T>) {
  const result: T[] = [];
  for await (const item of iterable) {
    result.push(item);
  }
  return result;
}

async function* listBlocks(
  client: Client,
  blockId: string,
  fetchImage: (file: FileObject) => Promise<string>,
) {
  for await (const block of iteratePaginatedAPI(
    client.blocks.children.list,
    {
      block_id: blockId,
    },
  )) {
    if (!isFullBlock(block)) {
      continue;
    }

    if (block.has_children) {
      const children = await awaitAll(
        listBlocks(client, block.id, fetchImage),
      );
      // @ts-ignore – notion-rehype-k expects children here
      block[block.type].children = children;
    }

    if (block.type === "image") {
      const url = await fetchImage(block.image as FileObject);
      yield {
        ...block,
        image: {
          type: block.image.type,
          [block.image.type]: url,
          caption: block.image.caption,
        },
      } as unknown as typeof block;
    } else {
      yield block;
    }
  }
}

function extractTocHeadings(toc: HtmlElementNode): MarkdownHeading[] {
  if (toc.tagName !== "nav") {
    throw new Error(`Expected nav, got ${toc.tagName}`);
  }

  function listElementToTree(ol: ListNode, depth: number): MarkdownHeading[] {
    return ol.children.flatMap((li) => {
      const [linkNode, subList] = li.children;
      const link = linkNode as HtmlElementNode;

      const currentHeading: MarkdownHeading = {
        depth,
        text: (link.children![0] as TextNode).value,
        slug: link.properties.href!.slice(1),
      };

      let headingsList = [currentHeading];
      if (subList) {
        headingsList = headingsList.concat(
          listElementToTree(subList as ListNode, depth + 1),
        );
      }
      return headingsList;
    });
  }

  return listElementToTree(toc.children![0] as ListNode, 0);
}

interface RenderedNotionEntry {
  html: string;
  metadata: {
    imagePaths: string[];
    headings: MarkdownHeading[];
  };
}

class NotionPageRenderer {
  #imagePaths: string[] = [];
  #logger: Logger;

  constructor(
    private readonly client: Client,
    private readonly page: PageObjectResponse,
    parentLogger: Logger,
  ) {
    this.#logger = parentLogger.fork(`page ${page.id}`);
  }

  async render(
    process: ReturnType<typeof buildProcessor>,
  ): Promise<RenderedNotionEntry | undefined> {
    this.#logger.debug("Rendering");
    try {
      const blocks = await awaitAll(
        listBlocks(this.client, this.page.id, this.#fetchImage),
      );

      const { vFile, headings } = await process(blocks);

      this.#logger.debug("Rendered");
      return {
        html: vFile.toString(),
        metadata: {
          headings,
          imagePaths: this.#imagePaths,
        },
      };
    } catch (error) {
      this.#logger.error(`Failed to render: ${getErrorMessage(error)}`);
      return undefined;
    }
  }

  #fetchImage = async (imageFileObject: FileObject) => {
    try {
      const fetchedImageData = await fileToImageAsset(imageFileObject);
      this.#imagePaths.push(fetchedImageData.src);
      return fetchedImageData.src;
    } catch (error) {
      this.#logger.error(
        `Failed to fetch image when rendering page: ${getErrorMessage(error)}`,
      );
      return fileToUrl(imageFileObject) ?? "";
    }
  };
}

function getErrorMessage(error: unknown): string {
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
    [rehypeShiki, { theme: "github-dark" }] as const,
    [
      rehypeExternalLinks,
      {
        rel: ["external", "nofollow", "noopener", "noreferrer"],
        target: ["_blank"],
      },
    ] as const,
  ])
);

export interface NotionPostSummary {
  id: string;
  slug: string;
  title: string;
  createdAt: string | null;
  updatedAt: string | null;
  tags: string[];
  thumbnail: string | null;
  credit: string | null;
}

export interface NotionPostDetail extends NotionPostSummary {
  html: string;
  headings: Array<{ depth: number; text: string; slug: string }>;
}

export async function getNotionPosts(): Promise<NotionPostSummary[]> {
  if (redis) {
    const cached = await redisGet<NotionPostSummary[]>(POSTS_CACHE_KEY);
    if (cached) {
      return cached.map(cloneSummary);
    }
  }

  const summaries = await fetchNotionPostsFromApi();

  if (redis) {
    await redisSet(POSTS_CACHE_KEY, summaries);
    await Promise.all(
      summaries.map((summary) => redisSet(getPageSlugKey(summary.id), summary.slug)),
    );
    await markContentUpdated();
  }

  return summaries.map(cloneSummary);
}

export async function getNotionPost(slug: string): Promise<NotionPostDetail | null> {
  if (redis) {
    const cached = await redisGet<NotionPostDetail>(getPostDetailKey(slug));
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

export async function refreshNotionCacheForPage(pageId: string): Promise<void> {
  const notion = getNotionClient();
  const page = await notion.pages.retrieve({ page_id: pageId });

  if (!isFullPage(page)) {
    await removeCachedPostById(pageId);
    return;
  }

  const published = getCheckbox(page.properties?.published);
  if (!published) {
    await removeCachedPostById(page.id);
    return;
  }

  const detail = await buildDetailFromPage(notion, page);
  await cacheNotionPost(detail);
}

function cloneSummary(summary: NotionPostSummary): NotionPostSummary {
  return {
    ...summary,
    tags: [...summary.tags],
  };
}

function cloneDetail(detail: NotionPostDetail): NotionPostDetail {
  return {
    ...detail,
    tags: [...detail.tags],
    headings: detail.headings.map((heading) => ({ ...heading })),
  };
}

function mapPageToSummary(page: any): NotionPostSummary {
	const slug = getRichText(page.properties?.slug) ?? page.id;

  return {
    id: page.id,
		slug,
    title: getTitle(page.properties?.Name) ?? "Untitled",
    createdAt: getDate(page.properties?.created_at),
    updatedAt:
      typeof page.last_edited_time === "string" ? page.last_edited_time : null,
    tags: getMultiSelect(page.properties?.tags),
    thumbnail: getUrl(page.properties?.thumbnail),
    credit: getRichText(page.properties?.credit),
  };
}

function getTitle(property: any): string | null {
  if (property?.type === "title") {
    const value = property.title?.map((item: any) => item.plain_text).join("") ?? "";
    return value.trim() || null;
  }
  return null;
}

function getRichText(property: any): string | null {
  if (property?.type === "rich_text") {
    const value = property.rich_text?.map((item: any) => item.plain_text).join("") ?? "";
    return value.trim() || null;
  }
  return null;
}

function getDate(property: any): string | null {
  if (property?.type === "date") {
    return property.date?.start ?? null;
  }
  return null;
}

function getUrl(property: any): string | null {
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

function getMultiSelect(property: any): string[] {
  if (property?.type === "multi_select") {
    return property.multi_select?.map((item: any) => item.name).filter(Boolean) ?? [];
  }
  return [];
}

function getCheckbox(property: any): boolean {
  if (property?.type === "checkbox") {
    return Boolean(property.checkbox);
  }
  return false;
}

function sortSummariesByCreatedAt(posts: NotionPostSummary[]): NotionPostSummary[] {
  return [...posts].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });
}

async function fetchNotionPostsFromApi(): Promise<NotionPostSummary[]> {
  const notion = getNotionClient();
  const response = await notion.databases.query({
    database_id: getDatabaseId(),
    filter: {
      property: "published",
      checkbox: { equals: true },
    },
    sorts: [
      {
        property: "created_at",
        direction: "descending",
      },
    ],
  });

  const summaries = response.results
    .filter((page): page is typeof page & { id: string } => isFullPage(page))
    .map((page) => mapPageToSummary(page));

  return sortSummariesByCreatedAt(summaries);
}

async function fetchNotionPostFromApi(slug: string): Promise<NotionPostDetail | null> {
  const notion = getNotionClient();
  const response = await notion.databases.query({
    database_id: getDatabaseId(),
    filter: {
      and: [
        {
          property: "published",
          checkbox: { equals: true },
        },
        {
          property: "slug",
          rich_text: { equals: slug },
        },
      ],
    },
    page_size: 1,
  });

  const page = response.results.find((result) => isFullPage(result));
  if (!page) {
    return null;
  }

  const detail = await buildDetailFromPage(notion, page);
  await cacheNotionPost(detail);
  return detail;
}

async function buildDetailFromPage(
  notion: Client,
  page: PageObjectResponse,
  summary?: NotionPostSummary,
): Promise<NotionPostDetail> {
  const baseSummary = summary ?? mapPageToSummary(page);
  const renderer = new NotionPageRenderer(notion, page, noopLogger);
  const rendered = await renderer.render(processNotionContent);

  return {
    ...baseSummary,
    html: rendered?.html ?? "",
    headings: rendered?.metadata?.headings ?? [],
  };
}

async function cacheNotionPost(detail: NotionPostDetail) {
  if (!redis) return;
  const previous = await updateCachedSummaries(detail);
  await redisSet(getPostDetailKey(detail.slug), detail);
  await redisSet(getPageSlugKey(detail.id), detail.slug);
  if (previous && previous.slug !== detail.slug) {
    await redisDel(getPostDetailKey(previous.slug));
  }
  await markContentUpdated();
}

async function updateCachedSummaries(
  summary: NotionPostSummary,
): Promise<NotionPostSummary | null> {
  if (!redis) return null;
  const cached = (await redisGet<NotionPostSummary[]>(POSTS_CACHE_KEY)) ?? [];
  const previous = cached.find((item) => item.id === summary.id) ?? null;
  const next = cached.filter((item) => item.id !== summary.id);
  next.push(cloneSummary(summary));
  const sorted = sortSummariesByCreatedAt(next);
  await redisSet(POSTS_CACHE_KEY, sorted);
  return previous;
}

async function removeCachedPostById(pageId: string) {
  if (!redis) return;
  const cached = await redisGet<NotionPostSummary[]>(POSTS_CACHE_KEY);
  if (!cached) return;
  const existing = cached.find((item) => item.id === pageId);
  if (!existing) return;
  const next = cached.filter((item) => item.id !== pageId);
  await redisDel(getPostDetailKey(existing.slug));
  await redisDel(getPageSlugKey(pageId));
  await redisSet(POSTS_CACHE_KEY, sortSummariesByCreatedAt(next));
  await markContentUpdated();
}

async function removeCachedPostBySlug(slug: string) {
  if (!redis) return;
  const cached = await redisGet<NotionPostSummary[]>(POSTS_CACHE_KEY);
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
