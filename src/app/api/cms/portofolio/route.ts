import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const portfolios = await prisma.portfolio.findMany({
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ success: true, portfolios });
  } catch (error: any) {
    console.error("Fetch Portfolios Error:", error);
    return NextResponse.json({ error: "Failed to fetch portfolio items" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, imageUrl, logoUrl, logoText, link } = await request.json();

    if (!title || !description || !imageUrl) {
      return NextResponse.json({ error: "Title, description, and image URL are required" }, { status: 400 });
    }

    const portfolio = await prisma.portfolio.create({
      data: {
        title,
        description,
        imageUrl,
        logoUrl: logoUrl || null,
        logoText: logoText || null,
        link: link || null,
      },
    });

    return NextResponse.json({ success: true, portfolio });
  } catch (error: any) {
    console.error("Create Portfolio Error:", error);
    return NextResponse.json({ error: "Failed to create portfolio item" }, { status: 500 });
  }
}
