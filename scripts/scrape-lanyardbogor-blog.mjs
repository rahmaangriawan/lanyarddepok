import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/client/client.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");
const siteOrigin = "https://lanyardbogor.com";
const blogPages = [`${siteOrigin}/blog`, `${siteOrigin}/blog?page=2`];

function loadEnv() {
  const envPath = path.join(rootDir, ".env");
  return fs.readFile(envPath, "utf8").then((env) => {
    for (const line of env.split(/\r?\n/)) {
      const match = line.match(/^([A-Z0-9_]+)=["']?(.+?)["']?$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2];
      }
    }
  });
}

function decodeHtml(value = "") {
  const entities = {
    amp: "&",
    quot: '"',
    apos: "'",
    lt: "<",
    gt: ">",
    nbsp: " ",
    hellip: "...",
    ldquo: "\u201c",
    rdquo: "\u201d",
    lsquo: "\u2018",
    rsquo: "\u2019",
  };

  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (_, key) => entities[key.toLowerCase()] || `&${key};`)
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(value = "") {
  return decodeHtml(value.replace(/<[^>]*>/g, " "));
}

function slugFromUrl(url) {
  return new URL(url).pathname.split("/").filter(Boolean).pop();
}

function parseArticles(html) {
  const articles = [];
  const articleMatches = html.matchAll(/<article\b[\s\S]*?<\/article>/g);

  for (const match of articleMatches) {
    const block = match[0];
    const titleMatch = block.match(/<h2[\s\S]*?<a href="([^"]+)"[\s\S]*?>([\s\S]*?)<\/a>[\s\S]*?<\/h2>/);
    if (!titleMatch) continue;

    const categoryMatch = block.match(/<a href="https:\/\/lanyardbogor\.com\/category\/([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
    const datetimeMatch = block.match(/<time datetime="([^"]+)"/);
    const excerptMatch = block.match(/<p class="[^"]*line-clamp-3[^"]*"[^>]*>([\s\S]*?)<\/p>/);

    articles.push({
      url: titleMatch[1],
      slug: slugFromUrl(titleMatch[1]),
      title: stripTags(titleMatch[2]),
      categorySlug: categoryMatch ? categoryMatch[1] : "artikel",
      categoryName: categoryMatch ? stripTags(categoryMatch[2]) : "Artikel",
      createdAt: datetimeMatch ? new Date(datetimeMatch[1]) : new Date(),
      excerpt: excerptMatch ? stripTags(excerptMatch[1]) : "",
    });
  }

  return articles;
}

function findClosingDiv(html, openStart) {
  const openEnd = html.indexOf(">", openStart);
  let depth = 1;
  const tagPattern = /<\/?div\b[^>]*>/gi;
  tagPattern.lastIndex = openEnd + 1;

  for (const tag of html.matchAll(tagPattern)) {
    const token = tag[0];
    if (token.startsWith("</")) {
      depth -= 1;
      if (depth === 0) return tag.index;
    } else if (!token.endsWith("/>")) {
      depth += 1;
    }
  }

  return -1;
}

function extractProse(html) {
  const marker = '<div class="prose prose-lg max-w-none mb-8">';
  const start = html.indexOf(marker);
  if (start === -1) return "";

  const contentStart = html.indexOf(">", start) + 1;
  const contentEnd = findClosingDiv(html, start);
  if (contentEnd === -1) return "";

  return html.slice(contentStart, contentEnd).trim();
}

function getMetaDescription(html, fallback) {
  const match = html.match(/<meta name="description" content="([^"]*)"/);
  const description = match ? decodeHtml(match[1]) : "";
  return description || fallback;
}

function getFeaturedImage(html) {
  const figureMatch = html.match(/<figure[\s\S]*?<img[^>]+src="([^"]+)"/);
  return figureMatch?.[1] || null;
}

function resolveSourceUrl(src, pageUrl) {
  return new URL(decodeHtml(src), pageUrl).toString();
}

function localUrlFromSource(sourceUrl) {
  const url = new URL(sourceUrl);
  return decodeURIComponent(url.pathname);
}

async function downloadImage(sourceUrl, prisma) {
  const localUrl = localUrlFromSource(sourceUrl);
  const targetPath = path.join(publicDir, ...localUrl.split("/").filter(Boolean));

  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`Failed to download ${sourceUrl}: ${response.status}`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, bytes);

  const mimetype = response.headers.get("content-type")?.split(";")[0] || "application/octet-stream";
  const filename = path.basename(localUrl);
  const existing = await prisma.media.findFirst({ where: { url: localUrl } });

  if (existing) {
    await prisma.media.update({
      where: { id: existing.id },
      data: {
        filename,
        filepath: localUrl,
        mimetype,
        size: bytes.byteLength,
      },
    });
  } else {
    await prisma.media.create({
      data: {
        filename,
        filepath: localUrl,
        mimetype,
        size: bytes.byteLength,
        url: localUrl,
      },
    });
  }

  return localUrl;
}

async function rewriteContentImages(content, pageUrl, prisma, downloaded) {
  const imageMatches = [...content.matchAll(/<img\b[^>]*\bsrc="([^"]+)"[^>]*>/g)];
  let rewritten = content;

  for (const match of imageMatches) {
    const sourceUrl = resolveSourceUrl(match[1], pageUrl);
    const localUrl = downloaded.get(sourceUrl) || (await downloadImage(sourceUrl, prisma));
    downloaded.set(sourceUrl, localUrl);
    rewritten = rewritten.replace(match[1], localUrl);
  }

  return rewritten;
}

async function main() {
  await loadEnv();
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaMariaDb(process.env.DATABASE_URL),
  });
  const downloaded = new Map();

  try {
    const listingHtml = await Promise.all(blogPages.map((url) => fetch(url).then((res) => res.text())));
    const articles = listingHtml.flatMap(parseArticles);
    const uniqueArticles = [...new Map(articles.map((article) => [article.slug, article])).values()];

    let imageCount = 0;
    let postCount = 0;

    for (const article of uniqueArticles) {
      const html = await fetch(article.url).then((res) => res.text());
      const title = stripTags(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] || article.title);
      const rawContent = extractProse(html);
      const featuredSource = getFeaturedImage(html);
      let featuredImage = null;

      if (featuredSource) {
        const sourceUrl = resolveSourceUrl(featuredSource, article.url);
        featuredImage = downloaded.get(sourceUrl) || (await downloadImage(sourceUrl, prisma));
        if (!downloaded.has(sourceUrl)) imageCount += 1;
        downloaded.set(sourceUrl, featuredImage);
      }

      const beforeContentDownloads = downloaded.size;
      const content = await rewriteContentImages(rawContent, article.url, prisma, downloaded);
      imageCount += downloaded.size - beforeContentDownloads;

      const category = await prisma.category.upsert({
        where: { slug: article.categorySlug },
        update: {
          name: article.categoryName,
          type: "BLOG",
        },
        create: {
          name: article.categoryName,
          slug: article.categorySlug,
          type: "BLOG",
        },
      });

      await prisma.post.upsert({
        where: { slug: article.slug },
        update: {
          title,
          content,
          published: true,
          featuredImage,
          categoryId: category.id,
          createdAt: article.createdAt,
          metaTitle: title,
          metaDescription: getMetaDescription(html, article.excerpt),
        },
        create: {
          title,
          slug: article.slug,
          content,
          published: true,
          featuredImage,
          categoryId: category.id,
          createdAt: article.createdAt,
          metaTitle: title,
          metaDescription: getMetaDescription(html, article.excerpt),
        },
      });

      postCount += 1;
      console.log(`Imported: ${article.slug}`);
    }

    console.log(`Done. Imported ${postCount} posts and downloaded ${imageCount} images.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
