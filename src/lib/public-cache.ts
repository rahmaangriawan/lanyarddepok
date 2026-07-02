import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { shouldSkipDbDuringBuild } from "@/lib/build-env";
import { getPublicAuthorName } from "@/lib/public-author";

export const POSTS_CACHE_TAG = "posts";
export const PAGES_CACHE_TAG = "pages";
export const CATEGORIES_CACHE_TAG = "categories";
export const CITY_PAGES_CACHE_TAG = "city-pages";

const publicPostListSelect = {
  id: true,
  title: true,
  slug: true,
  featuredImage: true,
  metaDescription: true,
  createdAt: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
} as const;

const relatedPostSelect = {
  id: true,
  title: true,
  slug: true,
  featuredImage: true,
  createdAt: true,
} as const;

const publicPostDetailSelect = {
  id: true,
  title: true,
  slug: true,
  content: true,
  published: true,
  featuredImage: true,
  categoryId: true,
  createdAt: true,
  updatedAt: true,
  metaTitle: true,
  metaDescription: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
} as const;

const publicPageSelect = {
  id: true,
  title: true,
  slug: true,
  content: true,
  published: true,
  createdAt: true,
  updatedAt: true,
  metaTitle: true,
  metaDescription: true,
} as const;

const publicCityPageSelect = {
  id: true,
  title: true,
  slug: true,
  content: true,
  published: true,
  featuredImage: true,
  parentId: true,
  createdAt: true,
  updatedAt: true,
  metaTitle: true,
  metaDescription: true,
} as const;

export const getCachedHomepagePosts = unstable_cache(
  async () => {
    if (shouldSkipDbDuringBuild()) return [];

    return prisma.post.findMany({
      where: { published: true },
      select: {
        id: true,
        title: true,
        slug: true,
        featuredImage: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
  },
  ["homepage-posts"],
  { revalidate: 600, tags: [POSTS_CACHE_TAG] },
);

export const getCachedBlogListing = unstable_cache(
  async (currentPage: number, limit: number, categorySlug = "", query = "") => {
    if (shouldSkipDbDuringBuild()) {
      return { posts: [], totalPosts: 0 };
    }

    const skip = (currentPage - 1) * limit;
    const trimmedQuery = query.trim();
    const where = {
      published: true,
      ...(categorySlug
        ? {
            category: {
              slug: categorySlug,
              type: "BLOG",
            },
          }
        : {}),
      ...(trimmedQuery
        ? {
            OR: [
              { title: { contains: trimmedQuery } },
              { metaDescription: { contains: trimmedQuery } },
            ],
          }
        : {}),
    };

    const [posts, totalPosts] = await Promise.all([
      prisma.post.findMany({
        where,
        select: publicPostListSelect,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.post.count({
        where,
      }),
    ]);

    return { posts, totalPosts };
  },
  ["blog-listing"],
  { revalidate: 600, tags: [POSTS_CACHE_TAG] },
);

export const getCachedPostBySlug = unstable_cache(
  async (slug: string) => {
    if (shouldSkipDbDuringBuild()) return null;

    return prisma.post.findFirst({
      where: { slug, published: true },
      select: publicPostDetailSelect,
    });
  },
  ["post-by-slug"],
  { revalidate: 600, tags: [POSTS_CACHE_TAG] },
);

export const getCachedRelatedPosts = unstable_cache(
  async (postId: number, categoryId: number | null) => {
    if (shouldSkipDbDuringBuild()) return [];

    let relatedPosts: { id: number; title: string; slug: string }[] = [];

    if (categoryId) {
      relatedPosts = await prisma.post.findMany({
        where: {
          categoryId,
          id: { not: postId },
          published: true,
        },
        select: { id: true, title: true, slug: true },
        take: 3,
        orderBy: { createdAt: "desc" },
      });
    }

    if (relatedPosts.length < 3) {
      const excludeIds = [postId, ...relatedPosts.map((post) => post.id)];
      const extraPosts = await prisma.post.findMany({
        where: {
          id: { notIn: excludeIds },
          published: true,
        },
        select: { id: true, title: true, slug: true },
        take: 3 - relatedPosts.length,
        orderBy: { createdAt: "desc" },
      });
      relatedPosts = [...relatedPosts, ...extraPosts];
    }

    return relatedPosts;
  },
  ["related-posts"],
  { revalidate: 600, tags: [POSTS_CACHE_TAG] },
);

export const getCachedRecentPosts = unstable_cache(
  async (excludedPostId: number, take = 3) => {
    if (shouldSkipDbDuringBuild()) return [];

    return prisma.post.findMany({
      where: {
        published: true,
        id: { not: excludedPostId },
      },
      select: relatedPostSelect,
      take,
      orderBy: { createdAt: "desc" },
    });
  },
  ["recent-posts"],
  { revalidate: 600, tags: [POSTS_CACHE_TAG] },
);

export const getCachedBlogCategories = unstable_cache(
  async () => {
    if (shouldSkipDbDuringBuild()) return [];

    return prisma.category.findMany({
      where: { type: "BLOG" },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      take: 8,
      orderBy: { name: "asc" },
    });
  },
  ["blog-categories"],
  { revalidate: 600, tags: [CATEGORIES_CACHE_TAG] },
);

export const getCachedCategoriesByType = unstable_cache(
  async (type: string, take = 5) => {
    if (shouldSkipDbDuringBuild()) return [];

    return prisma.category.findMany({
      where: { type },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        type: true,
      },
      orderBy: { name: "asc" },
      take,
    });
  },
  ["categories-by-type"],
  { revalidate: 600, tags: [CATEGORIES_CACHE_TAG] },
);

export const getCachedCategoryBySlugAndType = unstable_cache(
  async (slug: string, type: string) => {
    if (shouldSkipDbDuringBuild()) return null;

    return prisma.category.findFirst({
      where: { slug, type },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        type: true,
      },
    });
  },
  ["category-by-slug-and-type"],
  { revalidate: 600, tags: [CATEGORIES_CACHE_TAG] },
);

export const getCachedBlogPostsByCategoryId = unstable_cache(
  async (categoryId: number) => {
    if (shouldSkipDbDuringBuild()) return [];

    return prisma.post.findMany({
      where: {
        categoryId,
        published: true,
      },
      select: publicPostListSelect,
      orderBy: { createdAt: "desc" },
    });
  },
  ["blog-posts-by-category-id"],
  { revalidate: 600, tags: [POSTS_CACHE_TAG, CATEGORIES_CACHE_TAG] },
);

export const getCachedBlogCategorySummaries = unstable_cache(
  async () => {
    if (shouldSkipDbDuringBuild()) return [];

    return prisma.category.findMany({
      where: { type: "BLOG" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        _count: {
          select: { posts: { where: { published: true } } },
        },
      },
      orderBy: { name: "asc" },
    });
  },
  ["blog-category-summaries"],
  { revalidate: 600, tags: [POSTS_CACHE_TAG, CATEGORIES_CACHE_TAG] },
);

export const getCachedPublicAuthorName = unstable_cache(
  async () => {
    if (shouldSkipDbDuringBuild()) return getPublicAuthorName(undefined);

    const adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { name: true },
    });

    return getPublicAuthorName(adminUser?.name);
  },
  ["public-author-name"],
  { revalidate: 3600, tags: [POSTS_CACHE_TAG] },
);

export const getCachedApprovedComments = unstable_cache(
  async (postId: number) => {
    if (shouldSkipDbDuringBuild()) return [];

    return prisma.comment.findMany({
      where: {
        postId,
        approved: true,
      },
      select: {
        id: true,
        postId: true,
        name: true,
        email: true,
        content: true,
        approved: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },
  ["approved-comments"],
  { revalidate: 300, tags: [POSTS_CACHE_TAG] },
);

export const getCachedPageBySlug = unstable_cache(
  async (slug: string) => {
    if (shouldSkipDbDuringBuild()) return null;

    return prisma.page.findFirst({
      where: { slug, published: true },
      select: publicPageSelect,
    });
  },
  ["page-by-slug"],
  { revalidate: 600, tags: [PAGES_CACHE_TAG] },
);

export const getCachedRootCityPageBySlug = unstable_cache(
  async (slug: string) => {
    if (shouldSkipDbDuringBuild()) return null;

    return prisma.cityPage.findFirst({
      where: { slug, parentId: null, published: true },
      select: publicCityPageSelect,
    });
  },
  ["root-city-page-by-slug"],
  { revalidate: 600, tags: [CITY_PAGES_CACHE_TAG] },
);

export const getCachedCityPageChain = unstable_cache(
  async (leafSlug: string) => {
    if (shouldSkipDbDuringBuild()) return null;

    const leaf = await prisma.cityPage.findUnique({
      where: { slug: leafSlug, published: true },
      select: publicCityPageSelect,
    });

    if (!leaf) return null;

    const chain = [leaf];
    let current = leaf;
    const maxDepth = 10;
    let depth = 0;

    while (current.parentId && depth < maxDepth) {
      const parent = await prisma.cityPage.findUnique({
        where: { id: current.parentId, published: true },
        select: publicCityPageSelect,
      });

      if (!parent) return null;

      chain.unshift(parent);
      current = parent;
      depth++;
    }

    return chain;
  },
  ["city-page-chain"],
  { revalidate: 600, tags: [CITY_PAGES_CACHE_TAG] },
);
