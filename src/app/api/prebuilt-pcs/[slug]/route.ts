import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET single prebuilt PC by slug (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const prebuiltPC = await prisma.prebuiltPC.findUnique({
      where: {
        slug,
        status: "PUBLISHED",
        visibility: "PUBLIC",
      },
      include: {
        pcType: {
          select: { id: true, name: true, slug: true },
        },
        components: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                brand: true,
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
              },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
        tags: {
          include: {
            tag: { select: { id: true, name: true, slug: true } },
          },
        },
        badges: {
          include: {
            badge: { select: { id: true, name: true, slug: true, color: true } },
          },
        },
      },
    });

    if (!prebuiltPC) {
      return NextResponse.json(
        { error: "Prebuilt PC not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ prebuiltPC });
  } catch (error) {
    console.error("Error fetching prebuilt PC:", error);
    return NextResponse.json(
      { error: "Failed to fetch prebuilt PC" },
      { status: 500 }
    );
  }
}
