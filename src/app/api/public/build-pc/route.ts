import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PC Build component category mapping to database slugs
const BUILD_CATEGORIES = [
  { key: "cpu", type: "Processor (CPU)", slug: "processors", required: true, wattageKey: "TDP" },
  { key: "cooler", type: "CPU Cooler", slug: "cpu-coolers", required: true },
  { key: "motherboard", type: "Motherboard", slug: "motherboards", required: true },
  { key: "ram", type: "RAM", slug: "ram", required: true, wattageKey: "Power" },
  { key: "gpu", type: "Graphics Card (GPU)", slug: "graphics-cards", required: true, wattageKey: "TDP" },
  { key: "ssd", type: "Storage (SSD)", slug: "nvme-ssd", required: true },
  { key: "psu", type: "Power Supply (PSU)", slug: "power-supplies", required: true },
  { key: "cabinet", type: "Cabinet / Case", slug: "pc-cases", required: true },
  { key: "monitor", type: "Monitor", slug: "monitors", required: false },
  { key: "keyboard", type: "Keyboard", slug: "keyboards", required: false },
  { key: "mouse", type: "Mouse", slug: "mice", required: false },
];

// GET PC build categories with products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryKey = searchParams.get("category");
    const search = searchParams.get("search") || "";

    // If specific category requested, return products for that category
    if (categoryKey) {
      const categoryConfig = BUILD_CATEGORIES.find(c => c.key === categoryKey);
      if (!categoryConfig) {
        return NextResponse.json({ error: "Invalid category" }, { status: 400 });
      }

      // Find the category
      const category = await prisma.category.findUnique({
        where: { slug: categoryConfig.slug },
      });

      if (!category) {
        return NextResponse.json({ products: [], category: categoryConfig });
      }

      // Build where clause
      const where: any = {
        primaryCategoryId: category.id,
        status: "PUBLISHED",
        visibility: "PUBLIC",
        isInStock: true,
      };

      if (search) {
        where.OR = [
          { name: { contains: search } },
          { brand: { contains: search } },
          { model: { contains: search } },
        ];
      }

      // Fetch products with specs
      const products = await prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          brand: true,
          model: true,
          price: true,
          compareAtPrice: true,
          isInStock: true,
          stockQuantity: true,
          images: {
            where: { isPrimary: true },
            select: { url: true, alt: true },
            take: 1,
          },
          specs: {
            select: { key: true, value: true },
            orderBy: { sortOrder: "asc" },
          },
          badges: {
            select: {
              badge: { select: { name: true, color: true } },
            },
          },
        },
        orderBy: [{ isFeatured: "desc" }, { price: "asc" }],
        take: 50,
      });

      // Transform products
      const transformedProducts = products.map(product => {
        // Extract wattage from specs if available
        let wattage = 0;
        if (categoryConfig.wattageKey) {
          const wattageSpec = product.specs.find(s =>
            s.key.toLowerCase().includes("tdp") ||
            s.key.toLowerCase().includes("power") ||
            s.key.toLowerCase().includes("watt")
          );
          if (wattageSpec) {
            const match = wattageSpec.value.match(/(\d+)/);
            if (match) wattage = parseInt(match[1]);
          }
        }

        // Get top 3 specs for display
        const displaySpecs = product.specs.slice(0, 3).map(s => s.value);

        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          brand: product.brand,
          model: product.model || product.brand || "",
          price: Number(product.price),
          compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
          image: product.images[0]?.url || "/placeholder.svg",
          specs: displaySpecs,
          wattage,
          compatible: true, // TODO: Implement compatibility check
          badges: product.badges.map(b => b.badge),
        };
      });

      return NextResponse.json({
        products: transformedProducts,
        category: categoryConfig,
      });
    }

    // Return all build categories with product counts
    const categoriesWithCounts = await Promise.all(
      BUILD_CATEGORIES.map(async (config) => {
        const category = await prisma.category.findUnique({
          where: { slug: config.slug },
        });

        let productCount = 0;
        if (category) {
          productCount = await prisma.product.count({
            where: {
              primaryCategoryId: category.id,
              status: "PUBLISHED",
              visibility: "PUBLIC",
              isInStock: true,
            },
          });
        }

        return {
          ...config,
          productCount,
          categoryId: category?.id || null,
        };
      })
    );

    return NextResponse.json({
      categories: categoriesWithCounts,
    });
  } catch (error) {
    console.error("Error fetching build categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch build categories" },
      { status: 500 }
    );
  }
}
