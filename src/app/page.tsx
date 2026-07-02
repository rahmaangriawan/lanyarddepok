import { getProducts } from "@/lib/products-server";
import type { UnifiedProduct } from "@/lib/products-service";
import { getCachedHomepagePosts } from "@/lib/public-cache";
import HomeClient from "./HomeClient";

type HomepagePost = {
  id: number;
  title: string;
  slug: string;
  featuredImage: string | null;
};

export const revalidate = 600;

export default async function Home() {
  let posts: HomepagePost[] = [];
  let homepageProducts: UnifiedProduct[] = [];

  try {
    posts = await getCachedHomepagePosts();
  } catch (err) {
    console.error("Failed to fetch homepage posts:", err);
  }

  try {
    homepageProducts = (await getProducts()).slice(0, 4);
  } catch (err) {
    console.error("Failed to fetch homepage products:", err);
  }

  const latestPosts = posts.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    featuredImage: post.featuredImage,
  }));

  return <HomeClient latestPosts={latestPosts} homepageProducts={homepageProducts} />;
}
