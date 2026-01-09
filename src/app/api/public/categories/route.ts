import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET public categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured") === "true";
    const limit = parseInt(searchParams.get("limit") || "20");
    const parentOnly = searchParams.get("parentOnly") === "true";

    const where = {
      isVisible: true,
      ...(featured && { isFeatured: true }),
      ...(parentOnly && { parentId: null }),
    };

    const categories = await prisma.category.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        displayOrder: true,
        parentId: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: { displayOrder: "asc" },
      take: limit,
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
