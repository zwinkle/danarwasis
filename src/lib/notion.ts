import { Client, isFullPage } from "@notionhq/client";
import { env } from "astro:env/server";
import rehypeExternalLinks from "rehype-external-links";
import rehypeShiki from "@shikijs/rehype";

// Not exported from the package root, so we rely on the compiled output.
import { buildProcessor, NotionPageRenderer } from "notion-astro-loader/dist/render.js";

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

function getNotionClient(): Client {
  if (cachedNotionClient) {
    return cachedNotionClient;
  }

  const token = env.NOTION_TOKEN;
  if (!token) {
    throw new Error("Missing NOTION_TOKEN environment variable");
  }

  cachedNotionClient = new Client({ auth: token });
  return cachedNotionClient;
}

function getDatabaseId(): string {
  const databaseId = env.NOTION_BD_ID;
  if (!databaseId) {
    throw new Error("Missing NOTION_BD_ID environment variable");
  }

  return databaseId;
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
