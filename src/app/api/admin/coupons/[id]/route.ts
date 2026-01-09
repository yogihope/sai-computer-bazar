import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET - Get single coupon by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                images: {
                  where: { isPrimary: true },
                  take: 1,
                  select: { url: true },
                },
              },
            },
          },
        },
        prebuiltPCs: {
          include: {
            prebuiltPC: {
              select: {
                id: true,
                name: true,
                slug: true,
                sellingPrice: true,
                primaryImage: true,
              },
            },
          },
        },
      },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({
      coupon: {
        ...coupon,
        discountValue: Number(coupon.discountValue),
        minOrderAmount: coupon.minOrderAmount ? Number(coupon.minOrderAmount) : null,
        maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
        products: coupon.products.map((p) => ({
          id: p.product.id,
          name: p.product.name,
          slug: p.product.slug,
          price: Number(p.product.price),
          image: p.product.images[0]?.url || null,
        })),
        prebuiltPCs: coupon.prebuiltPCs.map((p) => ({
          id: p.prebuiltPC.id,
          name: p.prebuiltPC.name,
          slug: p.prebuiltPC.slug,
          price: Number(p.prebuiltPC.sellingPrice),
          image: p.prebuiltPC.primaryImage,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching coupon:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupon" },
      { status: 500 }
    );
  }
}

// PUT - Update coupon
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const existingCoupon = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!existingCoupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    const {
      code,
      name,
      title,
      description,
      image,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      perUserLimit,
      applyOn,
      applyToAll,
      startDate,
      endDate,
      isActive,
      productIds,
      prebuiltPCIds,
    } = body;

    // Check if code is being changed to an existing one
    if (code && code.toUpperCase() !== existingCoupon.code) {
      const codeExists = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() },
      });
      if (codeExists) {
        return NextResponse.json(
          { error: "Coupon code already exists" },
          { status: 400 }
        );
      }
    }

    // Validate discount value
    if (discountType === "percentage" && discountValue !== undefined) {
      if (discountValue < 0 || discountValue > 100) {
        return NextResponse.json(
          { error: "Percentage discount must be between 0 and 100" },
          { status: 400 }
        );
      }
    }

    if (discountType === "fixed" && discountValue !== undefined && discountValue < 0) {
      return NextResponse.json(
        { error: "Fixed discount must be positive" },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: any = {};

    if (code !== undefined) updateData.code = code.toUpperCase();
    if (name !== undefined) updateData.name = name;
    if (title !== undefined) updateData.title = title || null;
    if (description !== undefined) updateData.description = description || null;
    if (image !== undefined) updateData.image = image || null;
    if (discountType !== undefined) updateData.discountType = discountType;
    if (discountValue !== undefined) updateData.discountValue = discountValue;
    if (minOrderAmount !== undefined) updateData.minOrderAmount = minOrderAmount || null;
    if (maxDiscount !== undefined) updateData.maxDiscount = maxDiscount || null;
    if (usageLimit !== undefined) updateData.usageLimit = usageLimit || null;
    if (perUserLimit !== undefined) updateData.perUserLimit = perUserLimit;
    if (applyOn !== undefined) updateData.applyOn = applyOn;
    if (applyToAll !== undefined) updateData.applyToAll = applyToAll;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update coupon with transaction if product/prebuilt relations need updating
    const coupon = await prisma.$transaction(async (tx) => {
      // If productIds are provided and applyToAll is false, update products
      if (productIds !== undefined && !applyToAll) {
        // Delete existing product relations
        await tx.couponProduct.deleteMany({
          where: { couponId: id },
        });

        // Create new product relations
        if (productIds.length > 0) {
          await tx.couponProduct.createMany({
            data: productIds.map((productId: string) => ({
              couponId: id,
              productId,
            })),
          });
        }
      }

      // If prebuiltPCIds are provided and applyToAll is false, update prebuilt PCs
      if (prebuiltPCIds !== undefined && !applyToAll) {
        // Delete existing prebuilt PC relations
        await tx.couponPrebuiltPC.deleteMany({
          where: { couponId: id },
        });

        // Create new prebuilt PC relations
        if (prebuiltPCIds.length > 0) {
          await tx.couponPrebuiltPC.createMany({
            data: prebuiltPCIds.map((prebuiltPCId: string) => ({
              couponId: id,
              prebuiltPCId,
            })),
          });
        }
      }

      // If applyToAll is true, clear specific relations
      if (applyToAll === true) {
        await tx.couponProduct.deleteMany({
          where: { couponId: id },
        });
        await tx.couponPrebuiltPC.deleteMany({
          where: { couponId: id },
        });
      }

      // Update the coupon
      return tx.coupon.update({
        where: { id },
        data: updateData,
        include: {
          products: {
            include: {
              product: {
                select: { id: true, name: true },
              },
            },
          },
          prebuiltPCs: {
            include: {
              prebuiltPC: {
                select: { id: true, name: true },
              },
            },
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      coupon: {
        ...coupon,
        discountValue: Number(coupon.discountValue),
        minOrderAmount: coupon.minOrderAmount ? Number(coupon.minOrderAmount) : null,
        maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
      },
      message: "Coupon updated successfully",
    });
  } catch (error) {
    console.error("Error updating coupon:", error);
    return NextResponse.json(
      { error: "Failed to update coupon" },
      { status: 500 }
    );
  }
}

// DELETE - Delete coupon
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const coupon = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    // Delete coupon (cascade will handle relations)
    await prisma.coupon.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json(
      { error: "Failed to delete coupon" },
      { status: 500 }
    );
  }
}
