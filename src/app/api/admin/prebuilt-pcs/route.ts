import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ProductStatus, ProductVisibility } from "@prisma/client";

// GET all prebuilt PCs
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") as ProductStatus | null;
    const pcTypeId = searchParams.get("pcTypeId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search } },
          { slug: { contains: search } },
          { shortDescription: { contains: search } },
        ],
      }),
      ...(status && { status }),
      ...(pcTypeId && { pcTypeId }),
    };

    const [prebuiltPCs, total] = await Promise.all([
      prisma.prebuiltPC.findMany({
        where,
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
                  price: true,
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
          _count: {
            select: { components: true },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.prebuiltPC.count({ where }),
    ]);

    // Get stats
    const stats = {
      total: await prisma.prebuiltPC.count(),
      published: await prisma.prebuiltPC.count({ where: { status: "PUBLISHED" } }),
      draft: await prisma.prebuiltPC.count({ where: { status: "DRAFT" } }),
      featured: await prisma.prebuiltPC.count({ where: { isFeatured: true } }),
    };

    return NextResponse.json({
      prebuiltPCs,
      stats,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
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

// POST create prebuilt PC
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const {
      name,
      slug,
      shortDescription,
      description,
      specifications,
      totalPrice,
      sellingPrice,
      compareAtPrice,
      primaryImage,
      galleryImages,
      status,
      visibility,
      isFeatured,
      isInStock,
      isComingSoon,
      launchDate,
      pcTypeId,
      targetUse,
      seoTitle,
      seoDescription,
      seoKeywords,
      seoScore,
      canonicalUrl,
      robotsIndex,
      robotsFollow,
      ogTitle,
      ogDescription,
      ogImage,
      twitterTitle,
      twitterDescription,
      twitterImage,
      jsonLd,
      components,
      tags,
      badges,
    } = body;

    // Validate required fields
    if (!name || !slug || totalPrice === undefined || sellingPrice === undefined) {
      return NextResponse.json(
        { error: "Name, slug, total price, and selling price are required" },
        { status: 400 }
      );
    }

    // Check if slug exists
    const existingPC = await prisma.prebuiltPC.findUnique({
      where: { slug },
    });

    if (existingPC) {
      return NextResponse.json(
        { error: "A prebuilt PC with this slug already exists" },
        { status: 400 }
      );
    }

    // Create prebuilt PC with relations
    const prebuiltPC = await prisma.prebuiltPC.create({
      data: {
        name,
        slug,
        shortDescription,
        description,
        specifications,
        totalPrice,
        sellingPrice,
        compareAtPrice,
        primaryImage,
        galleryImages,
        status: status || "DRAFT",
        visibility: visibility || "PUBLIC",
        isFeatured: isFeatured ?? false,
        isInStock: isInStock ?? true,
        isComingSoon: isComingSoon ?? false,
        launchDate: launchDate || null,
        pcTypeId: pcTypeId || null,
        targetUse,
        seoTitle,
        seoDescription,
        seoKeywords,
        seoScore: seoScore || 0,
        canonicalUrl,
        robotsIndex: robotsIndex ?? true,
        robotsFollow: robotsFollow ?? true,
        ogTitle,
        ogDescription,
        ogImage,
        twitterTitle,
        twitterDescription,
        twitterImage,
        jsonLd,
        // Create components
        ...(components?.length && {
          components: {
            create: components.map((comp: {
              productId: string;
              quantity?: number;
              componentType: string;
              sortOrder?: number;
              priceOverride?: number;
            }, index: number) => ({
              productId: comp.productId,
              quantity: comp.quantity || 1,
              componentType: comp.componentType,
              sortOrder: comp.sortOrder ?? index,
              priceOverride: comp.priceOverride || null,
            })),
          },
        }),
      },
      include: {
        pcType: {
          select: { id: true, name: true, slug: true },
        },
        components: {
          include: {
            product: {
              select: { id: true, name: true, price: true },
            },
          },
        },
      },
    });

    // Handle tags
    if (tags?.length) {
      for (const tagId of tags) {
        await prisma.prebuiltPCTag.create({
          data: {
            prebuiltPCId: prebuiltPC.id,
            tagId,
          },
        }).catch(() => {
          // Ignore if tag doesn't exist
        });
      }
    }

    // Handle badges
    if (badges?.length) {
      for (const badgeId of badges) {
        await prisma.prebuiltPCBadge.create({
          data: {
            prebuiltPCId: prebuiltPC.id,
            badgeId,
          },
        }).catch(() => {
          // Ignore if badge doesn't exist
        });
      }
    }

    return NextResponse.json({ prebuiltPC }, { status: 201 });
  } catch (error) {
    console.error("Error creating prebuilt PC:", error);
    return NextResponse.json(
      { error: "Failed to create prebuilt PC" },
      { status: 500 }
    );
  }
}
