import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET product by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        primaryCategory: {
          select: {
            id: true,
            name: true,
            slug: true,
            parent: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
        images: {
          orderBy: { sortOrder: "asc" },
        },
        tags: {
          include: { tag: true },
        },
        badges: {
          include: { badge: true },
        },
        specs: {
          orderBy: { sortOrder: "asc" },
        },
        variations: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if product is published and visible
    if (product.status !== "PUBLISHED" || product.visibility !== "PUBLIC") {
      return NextResponse.json(
        { error: "Product not available" },
        { status: 404 }
      );
    }

    // Get related products from same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        primaryCategoryId: product.primaryCategoryId,
        id: { not: product.id },
        status: "PUBLISHED",
        visibility: "PUBLIC",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        shortDescription: true,
        price: true,
        compareAtPrice: true,
        isInStock: true,
        isFeatured: true,
        brand: true,
        images: {
          where: { isPrimary: true },
          take: 1,
        },
      },
      take: 4,
    });

    return NextResponse.json({
      product: {
        ...product,
        price: product.price.toString(),
        compareAtPrice: product.compareAtPrice?.toString() || null,
        discountPrice: product.discountPrice?.toString() || null,
      },
      relatedProducts: relatedProducts.map((p) => ({
        ...p,
        price: p.price.toString(),
        compareAtPrice: p.compareAtPrice?.toString() || null,
        primaryImage: p.images[0]?.url || null,
      })),
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
