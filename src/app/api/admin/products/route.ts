import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ProductStatus, ProductVisibility } from "@prisma/client";

// GET all products
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId");
    const status = searchParams.get("status") as ProductStatus | null;
    const visibility = searchParams.get("visibility") as ProductVisibility | null;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search } },
          { slug: { contains: search } },
          { sku: { contains: search } },
          { brand: { contains: search } },
        ],
      }),
      ...(categoryId && { primaryCategoryId: categoryId }),
      ...(status && { status }),
      ...(visibility && { visibility }),
    };

    const [products, total, stats] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          price: true,
          stockQuantity: true,
          isInStock: true,
          status: true,
          visibility: true,
          isFeatured: true,
          brand: true,
          updatedAt: true,
          seoScore: true,
          seoTitle: true,
          seoDescription: true,
          seoKeywords: true,
          ogTitle: true,
          ogDescription: true,
          primaryCategory: {
            select: { id: true, name: true, slug: true },
          },
          images: {
            where: { isPrimary: true },
            take: 1,
          },
          _count: {
            select: { images: true, tags: true, specs: true },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
      // Get stats for all products (not filtered)
      Promise.all([
        prisma.product.count(),
        prisma.product.count({ where: { status: "PUBLISHED" } }),
        prisma.product.count({ where: { status: "DRAFT" } }),
        prisma.product.count({ where: { isInStock: false } }),
        prisma.product.count({ where: { isFeatured: true } }),
        prisma.product.count({ where: { AND: [{ stockQuantity: { lte: 5 } }, { stockQuantity: { gt: 0 } }] } }),
        prisma.product.aggregate({ _sum: { stockQuantity: true } }),
        prisma.category.count({ where: { products: { some: {} } } }),
      ]),
    ]);

    const [
      totalProducts,
      published,
      draft,
      outOfStock,
      featured,
      lowStock,
      stockAggregate,
      categoriesWithProducts,
    ] = stats;

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total: totalProducts,
        published,
        draft,
        outOfStock,
        featured,
        lowStock,
        totalStock: stockAggregate._sum.stockQuantity || 0,
        categoriesWithProducts,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST create product
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const {
      name,
      slug,
      shortDescription,
      description,
      sku,
      price,
      compareAtPrice,
      discountPrice,
      stockQuantity,
      isInStock,
      status,
      visibility,
      isFeatured,
      badges,
      primaryCategoryId,
      brand,
      model,
      isComingSoon,
      launchDate,
      hasVariations,
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
      images,
      tags,
      specs,
      variations,
    } = body;

    // Validate required fields
    if (!name || !slug || !primaryCategoryId || price === undefined) {
      return NextResponse.json(
        { error: "Name, slug, category, and price are required" },
        { status: 400 }
      );
    }

    // Check if slug exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: "A product with this slug already exists" },
        { status: 400 }
      );
    }

    // Check if SKU exists (if provided)
    if (sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku },
      });

      if (existingSku) {
        return NextResponse.json(
          { error: "A product with this SKU already exists" },
          { status: 400 }
        );
      }
    }

    // Create product with relations
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        shortDescription,
        description,
        sku,
        price,
        compareAtPrice,
        discountPrice,
        stockQuantity: stockQuantity || 0,
        isInStock: isInStock ?? (stockQuantity > 0),
        status: status || "DRAFT",
        visibility: visibility || "PUBLIC",
        isFeatured: isFeatured ?? false,
        primaryCategoryId,
        brand,
        model,
        isComingSoon: isComingSoon ?? false,
        launchDate: launchDate ? new Date(launchDate) : null,
        hasVariations: hasVariations ?? false,
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
        // Create images
        ...(images?.length && {
          images: {
            create: images.map((img: { url: string; alt?: string; sortOrder?: number; isPrimary?: boolean }, index: number) => ({
              url: img.url,
              alt: img.alt || "",
              sortOrder: img.sortOrder ?? index,
              isPrimary: img.isPrimary ?? index === 0,
            })),
          },
        }),
        // Create specs
        ...(specs?.length && {
          specs: {
            create: specs.map((spec: { key: string; value: string; sortOrder?: number }, index: number) => ({
              key: spec.key,
              value: spec.value,
              sortOrder: spec.sortOrder ?? index,
            })),
          },
        }),
        // Create variations
        ...(variations?.length && {
          variations: {
            create: variations.map((v: { type: string; name: string; sku?: string; price?: number; stockQuantity?: number; imageUrl?: string; sortOrder?: number }, index: number) => ({
              type: v.type,
              name: v.name,
              sku: v.sku || null,
              price: v.price || null,
              stockQuantity: v.stockQuantity || 0,
              isInStock: (v.stockQuantity || 0) > 0,
              imageUrl: v.imageUrl || null,
              sortOrder: v.sortOrder ?? index,
            })),
          },
        }),
      },
      include: {
        primaryCategory: { select: { id: true, name: true } },
        images: true,
        specs: true,
        variations: true,
      },
    });

    // Handle tags (create connections to existing tags)
    if (tags?.length) {
      for (const tagId of tags) {
        await prisma.productTag.create({
          data: {
            productId: product.id,
            tagId,
          },
        }).catch(() => {
          // Ignore if tag doesn't exist
        });
      }
    }

    // Handle badges (create connections to existing badges)
    if (badges?.length) {
      for (const badgeId of badges) {
        await prisma.productBadge.create({
          data: {
            productId: product.id,
            badgeId,
          },
        }).catch(() => {
          // Ignore if badge doesn't exist
        });
      }
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
