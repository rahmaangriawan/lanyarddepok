import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { assertSameOrigin, checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/security";

// GET: Fetch order history (single user orders, or all orders if role is ADMIN)
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const whereQuery = user.role === "ADMIN" ? {} : { userId: user.id };
    const orders = await prisma.order.findMany({
      where: whereQuery,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("Fetch Orders Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST: Save a new custom lanyard order
export async function POST(request: Request) {
  try {
    const csrfError = assertSameOrigin(request);
    if (csrfError) return csrfError;

    const ip = getClientIp(request);
    if (!checkRateLimit(`order:${ip}`, 10, 10 * 60 * 1000)) {
      return rateLimitResponse("Terlalu banyak membuat pesanan. Silakan coba lagi dalam 10 menit.");
    }

    const user = await getSessionUser();
    
    // We allow orders only for logged-in users to track them in their dashboard
    if (!user) {
      return NextResponse.json(
        { error: "Please log in to place an order" },
        { status: 401 }
      );
    }

    const { lanyardWidth, printingType, attachment, quantity, totalPrice, notes } = await request.json();

    if (!lanyardWidth || !printingType || !attachment || !quantity || !totalPrice) {
      return NextResponse.json(
        { error: "Missing required order fields" },
        { status: 400 }
      );
    }

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        lanyardWidth,
        printingType,
        attachment,
        quantity: parseInt(quantity),
        totalPrice: parseInt(totalPrice),
        notes: notes || "",
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Create Order Error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
