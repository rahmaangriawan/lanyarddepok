import { prisma } from "@/lib/db";
import HomeClient from "./HomeClient";

type HomepagePost = {
  id: number;
  title: string;
  slug: string;
  featuredImage: string | null;
  category: { name: string } | null;
  createdAt: Date;
  metaDescription: string | null;
  content: string;
};

export const revalidate = 0; // Render homepage at request time so CI builds do not need database access

function getExcerpt(htmlContent: string, maxLength = 120): string {
  if (!htmlContent) return "";

  const clean = htmlContent
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\xa0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (clean.length <= maxLength) return clean;
  return clean.substring(0, maxLength).trim() + "...";
}

export default async function Home() {
  let posts: HomepagePost[] = [];

  try {
    posts = await prisma.post.findMany({
      where: { published: true },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    });
  } catch (err) {
    console.error("Failed to fetch homepage posts:", err);
  }

  const latestPosts = posts.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    featuredImage: post.featuredImage,
    categoryName: post.category?.name || null,
    createdAt: post.createdAt.toISOString(),
    excerpt: post.metaDescription || getExcerpt(post.content, 120),
  }));

  return <HomeClient latestPosts={latestPosts} />;
}
