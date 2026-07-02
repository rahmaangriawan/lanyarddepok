import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";
import { assertSameOrigin } from "@/lib/security";
import { normalizeCmsHtml } from "@/lib/sanitize-html";
import { POSTS_CACHE_TAG } from "@/lib/public-cache";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const postId = parseInt(resolvedParams.id, 10);
    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    console.error("Fetch Post Error:", error);
    return NextResponse.json({ error: "Failed to fetch post details" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const csrfError = assertSameOrigin(request);
    if (csrfError) return csrfError;

    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const postId = parseInt(resolvedParams.id, 10);
    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    const { title, slug, content, published, featuredImage, categoryId, createdAt, metaTitle, metaDescription } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const postSlug = slug
      ? slug.toLowerCase().replace(/[^a-z0-9-]/g, "-")
      : title.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");

    // Check if slug is taken by another post
    const existing = await prisma.post.findFirst({
      where: {
        slug: postSlug,
        NOT: { id: postId },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }

    const cleanContent = typeof content === "string" ? normalizeCmsHtml(content) : content;

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        slug: postSlug,
        content: cleanContent,
        published: !!published,
        featuredImage: featuredImage || null,
        categoryId: categoryId ? parseInt(categoryId, 10) : null,
        createdAt: createdAt ? new Date(createdAt) : undefined,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
      },
    });

    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath(`/blog/${updatedPost.slug}`);
    revalidateTag(POSTS_CACHE_TAG, "max");

    return NextResponse.json({ success: true, post: updatedPost });
  } catch (error: any) {
    console.error("Update Post Error:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const csrfError = assertSameOrigin(request);
    if (csrfError) return csrfError;

    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const postId = parseInt(resolvedParams.id, 10);
    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    const deletedPost = await prisma.post.delete({
      where: { id: postId },
    });

    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath(`/blog/${deletedPost.slug}`);
    revalidateTag(POSTS_CACHE_TAG, "max");

    return NextResponse.json({ success: true, message: "Post deleted successfully" });
  } catch (error: any) {
    console.error("Delete Post Error:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
