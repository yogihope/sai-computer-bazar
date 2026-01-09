import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// GET single prebuilt PC
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const prebuiltPC = await prisma.prebuiltPC.findUnique({
      where: { id },
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
                sku: true,
                price: true,
                brand: true,
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
                primaryCategory: {
                  select: { id: true, name: true },
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

// PUT update prebuilt PC
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

    // Check if slug exists (for another PC)
    if (slug) {
      const existingPC = await prisma.prebuiltPC.findFirst({
        where: { slug, NOT: { id } },
      });

      if (existingPC) {
        return NextResponse.json(
          { error: "A prebuilt PC with this slug already exists" },
          { status: 400 }
        );
      }
    }

    // Update prebuilt PC
    const prebuiltPC = await prisma.prebuiltPC.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(shortDescription !== undefined && { shortDescription }),
        ...(description !== undefined && { description }),
        ...(specifications !== undefined && { specifications }),
        ...(totalPrice !== undefined && { totalPrice }),
        ...(sellingPrice !== undefined && { sellingPrice }),
        ...(compareAtPrice !== undefined && { compareAtPrice }),
        ...(primaryImage !== undefined && { primaryImage }),
        ...(galleryImages !== undefined && { galleryImages }),
        ...(status !== undefined && { status }),
        ...(visibility !== undefined && { visibility }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(isInStock !== undefined && { isInStock }),
        ...(isComingSoon !== undefined && { isComingSoon }),
        ...(launchDate !== undefined && { launchDate }),
        ...(pcTypeId !== undefined && { pcTypeId: pcTypeId || null }),
        ...(targetUse !== undefined && { targetUse }),
        ...(seoTitle !== undefined && { seoTitle }),
        ...(seoDescription !== undefined && { seoDescription }),
        ...(seoKeywords !== undefined && { seoKeywords }),
        ...(seoScore !== undefined && { seoScore }),
        ...(canonicalUrl !== undefined && { canonicalUrl }),
        ...(robotsIndex !== undefined && { robotsIndex }),
        ...(robotsFollow !== undefined && { robotsFollow }),
        ...(ogTitle !== undefined && { ogTitle }),
        ...(ogDescription !== undefined && { ogDescription }),
        ...(ogImage !== undefined && { ogImage }),
        ...(twitterTitle !== undefined && { twitterTitle }),
        ...(twitterDescription !== undefined && { twitterDescription }),
        ...(twitterImage !== undefined && { twitterImage }),
        ...(jsonLd !== undefined && { jsonLd }),
      },
    });

    // Update components if provided
    if (components !== undefined) {
      // Delete existing components
      await prisma.prebuiltPCComponent.deleteMany({
        where: { prebuiltPCId: id },
      });

      // Create new components
      if (components.length > 0) {
        await prisma.prebuiltPCComponent.createMany({
          data: components.map((comp: {
            productId: string;
            quantity?: number;
            componentType: string;
            sortOrder?: number;
            priceOverride?: number;
          }, index: number) => ({
            prebuiltPCId: id,
            productId: comp.productId,
            quantity: comp.quantity || 1,
            componentType: comp.componentType,
            sortOrder: comp.sortOrder ?? index,
            priceOverride: comp.priceOverride || null,
          })),
        });
      }
    }

    // Update tags if provided
    if (tags !== undefined) {
      // Delete existing tags
      await prisma.prebuiltPCTag.deleteMany({
        where: { prebuiltPCId: id },
      });

      // Create new tags
      for (const tagId of tags) {
        await prisma.prebuiltPCTag.create({
          data: {
            prebuiltPCId: id,
            tagId,
          },
        }).catch(() => {
          // Ignore if tag doesn't exist
        });
      }
    }

    // Update badges if provided
    if (badges !== undefined) {
      // Delete existing badges
      await prisma.prebuiltPCBadge.deleteMany({
        where: { prebuiltPCId: id },
      });

      // Create new badges
      for (const badgeId of badges) {
        await prisma.prebuiltPCBadge.create({
          data: {
            prebuiltPCId: id,
            badgeId,
          },
        }).catch(() => {
          // Ignore if badge doesn't exist
        });
      }
    }

    // Fetch updated PC with relations
    const updatedPC = await prisma.prebuiltPC.findUnique({
      where: { id },
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

    return NextResponse.json({ prebuiltPC: updatedPC });
  } catch (error) {
    console.error("Error updating prebuilt PC:", error);
    return NextResponse.json(
      { error: "Failed to update prebuilt PC" },
      { status: 500 }
    );
  }
}

// PATCH partial update
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const prebuiltPC = await prisma.prebuiltPC.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ prebuiltPC });
  } catch (error) {
    console.error("Error updating prebuilt PC:", error);
    return NextResponse.json(
      { error: "Failed to update prebuilt PC" },
      { status: 500 }
    );
  }
}

// DELETE prebuilt PC
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await prisma.prebuiltPC.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting prebuilt PC:", error);
    return NextResponse.json(
      { error: "Failed to delete prebuilt PC" },
      { status: 500 }
    );
  }
}
