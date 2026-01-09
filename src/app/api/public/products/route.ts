import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET public products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured") === "true";
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");
    const sortBy = searchParams.get("sortBy") || "newest";
    const search = searchParams.get("search") || "";
    const brand = searchParams.get("brand");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const inStock = searchParams.get("inStock");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      status: "PUBLISHED",
      visibility: "PUBLIC",
    };

    if (featured) {
      where.isFeatured = true;
    }

    if (category) {
      // Find category and all its subcategories
      const categoryRecord = await prisma.category.findUnique({
        where: { slug: category },
        include: { children: { select: { id: true } } },
      });

      if (categoryRecord) {
        const categoryIds = [
          categoryRecord.id,
          ...categoryRecord.children.map((c) => c.id),
        ];
        where.primaryCategoryId = { in: categoryIds };
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { brand: { contains: search } },
        { shortDescription: { contains: search } },
      ];
    }

    if (brand) {
      where.brand = brand;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (inStock === "true") {
      where.isInStock = true;
      where.stockQuantity = { gt: 0 };
    }

    // Build orderBy
    let orderBy: any = { createdAt: "desc" };
    switch (sortBy) {
      case "price-low":
        orderBy = { price: "asc" };
        break;
      case "price-high":
        orderBy = { price: "desc" };
        break;
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "popularity":
        orderBy = { ratingCount: "desc" };
        break;
      case "discount":
        // Products with higher discount (compareAtPrice - price)
        orderBy = { compareAtPrice: "desc" };
        break;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          shortDescription: true,
          price: true,
          compareAtPrice: true,
          discountPrice: true,
          stockQuantity: true,
          isInStock: true,
          isFeatured: true,
          brand: true,
          ratingAvg: true,
          ratingCount: true,
          primaryCategory: {
            select: { id: true, name: true, slug: true },
          },
          images: {
            select: { url: true, alt: true, isPrimary: true },
            orderBy: { sortOrder: "asc" },
            take: 2,
          },
          badges: {
            select: {
              badge: { select: { name: true, slug: true, color: true } },
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    // Transform products to include discount percentage
    const transformedProducts = products.map((product) => {
      const price = Number(product.price);
      const compareAtPrice = product.compareAtPrice
        ? Number(product.compareAtPrice)
        : null;
      const discount =
        compareAtPrice && compareAtPrice > price
          ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
          : 0;

      return {
        ...product,
        price,
        compareAtPrice,
        discount,
        badges: product.badges.map((b) => b.badge),
      };
    });

    // Get unique brands for filters
    const brands = await prisma.product.findMany({
      where: { status: "PUBLISHED", visibility: "PUBLIC" },
      select: { brand: true },
      distinct: ["brand"],
    });

    return NextResponse.json({
      products: transformedProducts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        brands: brands.map((b) => b.brand).filter(Boolean),
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
