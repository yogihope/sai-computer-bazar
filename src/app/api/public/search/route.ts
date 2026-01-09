import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    // Build where clauses
    const productWhere: any = {
      status: "PUBLISHED",
      visibility: "PUBLIC",
      OR: [
        { name: { contains: query } },
        { shortDescription: { contains: query } },
        { brand: { contains: query } },
      ],
    };

    const prebuiltWhere: any = {
      status: "PUBLISHED",
      visibility: "PUBLIC",
      OR: [
        { name: { contains: query } },
        { shortDescription: { contains: query } },
      ],
    };

    // Search in parallel
    const [products, prebuiltPCs, blogs] = await Promise.all([
      // Search Products
      prisma.product.findMany({
        where: productWhere,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          discountPrice: true,
          primaryCategory: {
            select: {
              name: true,
              slug: true,
            },
          },
          images: {
            where: { isPrimary: true },
            take: 1,
            select: { url: true },
          },
        },
      }),

      // Search Prebuilt PCs
      prisma.prebuiltPC.findMany({
        where: prebuiltWhere,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          primaryImage: true,
          sellingPrice: true,
          pcType: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      }),

      // Search Blogs
      prisma.blog.findMany({
        where: {
          status: "PUBLISHED",
          publishedAt: { lte: new Date() },
          OR: [
            { title: { contains: query } },
            { excerpt: { contains: query } },
          ],
        },
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          featuredImage: true,
          readingTime: true,
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      }),
    ]);

    // Format results
    const results = [
      ...products.map((p) => ({
        type: "product" as const,
        id: p.id,
        name: p.name,
        slug: p.slug,
        image: p.images[0]?.url || null,
        price: Number(p.discountPrice || p.price),
        category: p.primaryCategory?.name || "Product",
        link: `/product/${p.slug}`,
      })),
      ...prebuiltPCs.map((pc) => ({
        type: "prebuilt" as const,
        id: pc.id,
        name: pc.name,
        slug: pc.slug,
        image: pc.primaryImage,
        price: Number(pc.sellingPrice),
        category: pc.pcType?.name || "Prebuilt PC",
        link: `/prebuilt-pcs/${pc.slug}`,
      })),
      ...blogs.map((b) => ({
        type: "blog" as const,
        id: b.id,
        name: b.title,
        slug: b.slug,
        image: b.featuredImage,
        readingTime: b.readingTime,
        category: b.category?.name || "Blog",
        link: `/blog/${b.slug}`,
      })),
    ];

    return NextResponse.json({
      results,
      counts: {
        products: products.length,
        prebuiltPCs: prebuiltPCs.length,
        blogs: blogs.length,
        total: results.length,
      },
    });
  } catch (error) {
    console.error("Error searching:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
