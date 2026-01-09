import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET prebuilt PCs (public - for related PCs, listings, etc.)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pcTypeId = searchParams.get("pcTypeId");
    const limit = parseInt(searchParams.get("limit") || "10");
    const exclude = searchParams.get("exclude");
    const featured = searchParams.get("featured");

    const where: Record<string, unknown> = {
      status: "PUBLISHED",
      visibility: "PUBLIC",
      isComingSoon: false,
    };

    if (pcTypeId) {
      where.pcTypeId = pcTypeId;
    }

    if (exclude) {
      where.id = { not: exclude };
    }

    if (featured === "true") {
      where.isFeatured = true;
    }

    const prebuiltPCs = await prisma.prebuiltPC.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        shortDescription: true,
        sellingPrice: true,
        totalPrice: true,
        primaryImage: true,
        isFeatured: true,
        isInStock: true,
        pcType: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: [
        { isFeatured: "desc" },
        { createdAt: "desc" },
      ],
      take: limit,
    });

    return NextResponse.json({ prebuiltPCs });
  } catch (error) {
    console.error("Error fetching prebuilt PCs:", error);
    return NextResponse.json(
      { error: "Failed to fetch prebuilt PCs" },
      { status: 500 }
    );
  }
}
