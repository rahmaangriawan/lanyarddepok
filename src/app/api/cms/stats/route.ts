import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      totalProducts,
      totalPages,
      totalPosts,
      totalMedia,
      totalComments,
      recentPosts
    ] = await Promise.all([
      prisma.product.count(),
      prisma.page.count(),
      prisma.post.count(),
      prisma.media.count(),
      prisma.comment.count(),
      prisma.post.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          published: true,
          featuredImage: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        products: totalProducts,
        pages: totalPages,
        posts: totalPosts,
        media: totalMedia,
        comments: totalComments,
      },
      recentActivity: recentPosts,
    });
  } catch (error: any) {
    console.error("Fetch API CMS Stats Error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
