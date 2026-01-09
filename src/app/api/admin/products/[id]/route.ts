import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// GET single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        primaryCategory: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { sortOrder: "asc" } },
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
        specs: { orderBy: { sortOrder: "asc" } },
        variations: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
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

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if slug is unique (if changed)
    if (slug && slug !== existingProduct.slug) {
      const slugExists = await prisma.product.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "A product with this slug already exists" },
          { status: 400 }
        );
      }
    }

    // Check if SKU is unique (if changed)
    if (sku && sku !== existingProduct.sku) {
      const skuExists = await prisma.product.findUnique({
        where: { sku },
      });

      if (skuExists) {
        return NextResponse.json(
          { error: "A product with this SKU already exists" },
          { status: 400 }
        );
      }
    }

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: {
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
        primaryCategoryId,
        brand,
        model,
        isComingSoon,
        launchDate: launchDate ? new Date(launchDate) : null,
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
      },
      include: {
        primaryCategory: { select: { id: true, name: true } },
        images: true,
        specs: true,
        tags: { include: { tag: true } },
        badges: { include: { badge: true } },
        variations: true,
      },
    });

    // Update images if provided
    if (images !== undefined) {
      // Delete existing images
      await prisma.productImage.deleteMany({ where: { productId: id } });

      // Create new images
      if (images?.length) {
        await prisma.productImage.createMany({
          data: images.map((img: { url: string; alt?: string; sortOrder?: number; isPrimary?: boolean }, index: number) => ({
            productId: id,
            url: img.url,
            alt: img.alt || "",
            sortOrder: img.sortOrder ?? index,
            isPrimary: img.isPrimary ?? index === 0,
          })),
        });
      }
    }

    // Update specs if provided
    if (specs !== undefined) {
      // Delete existing specs
      await prisma.productSpec.deleteMany({ where: { productId: id } });

      // Create new specs
      if (specs?.length) {
        await prisma.productSpec.createMany({
          data: specs.map((spec: { key: string; value: string; sortOrder?: number }, index: number) => ({
            productId: id,
            key: spec.key,
            value: spec.value,
            sortOrder: spec.sortOrder ?? index,
          })),
        });
      }
    }

    // Update tags if provided
    if (tags !== undefined) {
      // Delete existing tag connections
      await prisma.productTag.deleteMany({ where: { productId: id } });

      // Create new tag connections
      if (tags?.length) {
        for (const tagId of tags) {
          await prisma.productTag.create({
            data: { productId: id, tagId },
          }).catch(() => {});
        }
      }
    }

    // Update badges if provided
    if (badges !== undefined) {
      // Delete existing badge connections
      await prisma.productBadge.deleteMany({ where: { productId: id } });

      // Create new badge connections
      if (badges?.length) {
        for (const badgeId of badges) {
          await prisma.productBadge.create({
            data: { productId: id, badgeId },
          }).catch(() => {});
        }
      }
    }

    // Update variations if provided
    if (variations !== undefined) {
      // Delete existing variations
      await prisma.productVariation.deleteMany({ where: { productId: id } });

      // Create new variations
      if (variations?.length) {
        await prisma.productVariation.createMany({
          data: variations.map((v: { type: string; name: string; sku?: string; price?: number; stockQuantity?: number; imageUrl?: string; sortOrder?: number }, index: number) => ({
            productId: id,
            type: v.type,
            name: v.name,
            sku: v.sku || null,
            price: v.price || null,
            stockQuantity: v.stockQuantity || 0,
            isInStock: (v.stockQuantity || 0) > 0,
            imageUrl: v.imageUrl || null,
            sortOrder: v.sortOrder ?? index,
          })),
        });
      }
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Delete product (cascades to images, specs, tags)
    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}

// PATCH for quick updates (status, visibility, stock)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const product = await prisma.product.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}
