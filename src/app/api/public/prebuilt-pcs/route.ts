import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET public prebuilt PCs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured") === "true";
    const comingSoon = searchParams.get("comingSoon") === "true";
    const includeComingSoon = searchParams.get("includeComingSoon") === "true";
    const pcType = searchParams.get("pcType");
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");
    const sortBy = searchParams.get("sortBy") || "newest";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      status: "PUBLISHED",
      visibility: "PUBLIC",
    };

    // Handle coming soon filtering
    if (comingSoon) {
      where.isComingSoon = true;
    } else if (!includeComingSoon) {
      // By default, exclude coming soon from regular list
      where.isComingSoon = false;
    }

    if (featured) {
      where.isFeatured = true;
    }

    if (pcType) {
      const pcTypeRecord = await prisma.pCType.findUnique({
        where: { slug: pcType },
      });
      if (pcTypeRecord) {
        where.pcTypeId = pcTypeRecord.id;
      }
    }

    if (minPrice || maxPrice) {
      where.sellingPrice = {};
      if (minPrice) where.sellingPrice.gte = parseFloat(minPrice);
      if (maxPrice) where.sellingPrice.lte = parseFloat(maxPrice);
    }

    // Build orderBy
    let orderBy: any = { createdAt: "desc" };
    switch (sortBy) {
      case "price-low":
        orderBy = { sellingPrice: "asc" };
        break;
      case "price-high":
        orderBy = { sellingPrice: "desc" };
        break;
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "popularity":
        orderBy = { isFeatured: "desc" };
        break;
    }

    const [prebuiltPCs, total] = await Promise.all([
      prisma.prebuiltPC.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          shortDescription: true,
          totalPrice: true,
          sellingPrice: true,
          compareAtPrice: true,
          primaryImage: true,
          galleryImages: true,
          isFeatured: true,
          isInStock: true,
          isComingSoon: true,
          launchDate: true,
          targetUse: true,
          pcType: {
            select: { id: true, name: true, slug: true },
          },
          components: {
            select: {
              componentType: true,
              quantity: true,
              product: {
                select: {
                  name: true,
                  brand: true,
                  images: { take: 1, select: { url: true } },
                },
              },
            },
            orderBy: { sortOrder: "asc" },
          },
          badges: {
            select: {
              badge: { select: { name: true, slug: true, color: true } },
            },
          },
          _count: {
            select: { reviews: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.prebuiltPC.count({ where }),
    ]);

    // Transform prebuilt PCs
    const transformedPCs = prebuiltPCs.map((pc) => {
      const sellingPrice = Number(pc.sellingPrice);
      const compareAtPrice = pc.compareAtPrice
        ? Number(pc.compareAtPrice)
        : null;
      const totalPrice = Number(pc.totalPrice);
      const discount =
        compareAtPrice && compareAtPrice > sellingPrice
          ? Math.round(
              ((compareAtPrice - sellingPrice) / compareAtPrice) * 100
            )
          : 0;

      // Extract key specs from components
      const specs: Record<string, string> = {};
      pc.components.forEach((comp) => {
        if (comp.componentType === "CPU") {
          specs.cpu = comp.product.name;
        } else if (comp.componentType === "GPU") {
          specs.gpu = comp.product.name;
        } else if (comp.componentType === "RAM") {
          specs.ram = comp.product.name;
        } else if (
          comp.componentType === "Storage" ||
          comp.componentType === "SSD"
        ) {
          specs.storage = comp.product.name;
        }
      });

      return {
        ...pc,
        sellingPrice,
        compareAtPrice,
        totalPrice,
        discount,
        specs,
        badges: pc.badges.map((b) => b.badge),
        reviewCount: pc._count.reviews,
      };
    });

    // Get PC types for filters
    const pcTypes = await prisma.pCType.findMany({
      select: { id: true, name: true, slug: true },
    });

    return NextResponse.json({
      prebuiltPCs: transformedPCs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        pcTypes,
      },
    });
  } catch (error) {
    console.error("Error fetching prebuilt PCs:", error);
    return NextResponse.json(
      { error: "Failed to fetch prebuilt PCs" },
      { status: 500 }
    );
  }
}
