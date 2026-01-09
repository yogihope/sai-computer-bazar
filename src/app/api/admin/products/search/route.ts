import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// GET search products for prebuilt PC builder
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const categoryId = searchParams.get("categoryId");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!query && !categoryId) {
      // Return recent products if no search query
      const products = await prisma.product.findMany({
        where: {
          status: "PUBLISHED",
        },
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          price: true,
          brand: true,
          stockQuantity: true,
          isInStock: true,
          primaryCategory: {
            select: { id: true, name: true, slug: true },
          },
          images: {
            where: { isPrimary: true },
            take: 1,
            select: { url: true, alt: true },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: limit,
      });

      return NextResponse.json({ products });
    }

    const products = await prisma.product.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: query } },
              { slug: { contains: query } },
              { sku: { contains: query } },
              { brand: { contains: query } },
            ],
          },
          ...(categoryId ? [{ primaryCategoryId: categoryId }] : []),
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        price: true,
        brand: true,
        stockQuantity: true,
        isInStock: true,
        primaryCategory: {
          select: { id: true, name: true, slug: true },
        },
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { url: true, alt: true },
        },
      },
      orderBy: { name: "asc" },
      take: limit,
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error searching products:", error);
    return NextResponse.json(
      { error: "Failed to search products" },
      { status: 500 }
    );
  }
}
