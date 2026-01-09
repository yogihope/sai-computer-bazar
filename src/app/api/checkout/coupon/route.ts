import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// POST - Validate and apply coupon
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, cartTotal } = body;

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ error: "This coupon is no longer active" }, { status: 400 });
    }

    const now = new Date();

    // Check validity dates
    if (coupon.startDate && coupon.startDate > now) {
      return NextResponse.json({ error: "This coupon is not yet active" }, { status: 400 });
    }

    if (coupon.endDate && coupon.endDate < now) {
      return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 });
    }

    // Check minimum order amount
    if (coupon.minOrderAmount && cartTotal < Number(coupon.minOrderAmount)) {
      return NextResponse.json(
        {
          error: `Minimum order amount of ₹${Number(coupon.minOrderAmount).toLocaleString()} required`,
          minAmount: Number(coupon.minOrderAmount),
        },
        { status: 400 }
      );
    }

    // Check per-user limit
    const user = await getCurrentUser();
    if (user && coupon.perUserLimit > 0) {
      const userUsageCount = await prisma.order.count({
        where: {
          userId: user.id,
          couponCode: code.toUpperCase(),
          status: { notIn: ["CANCELLED", "REFUNDED"] },
        },
      });

      if (userUsageCount >= coupon.perUserLimit) {
        return NextResponse.json(
          { error: "You have already used this coupon" },
          { status: 400 }
        );
      }
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = (cartTotal * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, Number(coupon.maxDiscount));
      }
    } else {
      discount = Number(coupon.discountValue);
    }

    // Make sure discount doesn't exceed cart total
    discount = Math.min(discount, cartTotal);

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue),
        maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
        minOrderAmount: coupon.minOrderAmount ? Number(coupon.minOrderAmount) : null,
      },
      discount,
      message: `Coupon applied! You save ₹${discount.toLocaleString()}`,
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}
