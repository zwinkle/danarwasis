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

type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

const cache = new Map<string, CacheEntry<unknown>>();

function getCachedValue<T>(key: string): T | null {
  const item = cache.get(key) as CacheEntry<T> | undefined;
  if (!item) return null;

  if (Date.now() > item.expiresAt) {
    cache.delete(key);
    return null;
  }

  return item.value;
}

function setCachedValue<T>(key: string, value: T, ttlMs: number) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
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
  tags: string[];
  thumbnail: string | null;
  credit: string | null;
}

export interface NotionPostDetail extends NotionPostSummary {
  html: string;
  headings: Array<{ depth: number; text: string; slug: string }>;
}

const POSTS_CACHE_KEY = "notion::posts";
const POSTS_CACHE_TTL = 1000 * 60; // 1 minute

export async function getNotionPosts(): Promise<NotionPostSummary[]> {
  const cached = getCachedValue<NotionPostSummary[]>(POSTS_CACHE_KEY);
  if (cached) {
    return cached.map(cloneSummary);
  }

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
    .map((page) => mapPageToSummary(page))
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

  setCachedValue(POSTS_CACHE_KEY, summaries, POSTS_CACHE_TTL);

  return summaries.map(cloneSummary);
}

export async function getNotionPost(slug: string): Promise<NotionPostDetail | null> {
  const summaries = await getNotionPosts();
  const summaryFromCache = summaries.find((post) => post.slug === slug);

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

  const summary = mapPageToSummary(page);
  const renderer = new NotionPageRenderer(notion, page, noopLogger);
  const rendered = await renderer.render(processNotionContent);

  return {
    ...(summaryFromCache ?? summary),
    html: rendered?.html ?? "",
    headings: rendered?.metadata?.headings ?? [],
  };
}

function cloneSummary(summary: NotionPostSummary): NotionPostSummary {
  return {
    ...summary,
    tags: [...summary.tags],
  };
}

function mapPageToSummary(page: any): NotionPostSummary {
	const slug = getRichText(page.properties?.slug) ?? page.id;

  return {
    id: page.id,
		slug,
    title: getTitle(page.properties?.Name) ?? "Untitled",
    createdAt: getDate(page.properties?.created_at),
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
