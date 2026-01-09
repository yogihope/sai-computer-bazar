import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET - List all coupons with filters, search, pagination, and stats
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || ""; // active, inactive, expired
    const discountType = searchParams.get("discountType") || "";
    const applyOn = searchParams.get("applyOn") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { code: { contains: search } },
        { name: { contains: search } },
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (status === "active") {
      const now = new Date();
      where.isActive = true;
      where.OR = [
        { startDate: null },
        { startDate: { lte: now } },
      ];
      where.AND = [
        {
          OR: [
            { endDate: null },
            { endDate: { gte: now } },
          ],
        },
      ];
    } else if (status === "inactive") {
      where.isActive = false;
    } else if (status === "expired") {
      where.endDate = { lt: new Date() };
    }

    if (discountType) {
      where.discountType = discountType;
    }

    if (applyOn) {
      where.applyOn = applyOn;
    }

    // Get total count
    const total = await prisma.coupon.count({ where });

    // Get coupons with relations
    const coupons = await prisma.coupon.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
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
                primaryImage: true,
              },
            },
          },
        },
      },
    });

    // Get stats
    const now = new Date();

    const totalCoupons = await prisma.coupon.count();

    const activeCoupons = await prisma.coupon.count({
      where: {
        isActive: true,
        OR: [
          { startDate: null },
          { startDate: { lte: now } },
        ],
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } },
            ],
          },
        ],
      },
    });

    const expiredCoupons = await prisma.coupon.count({
      where: {
        endDate: { lt: now },
      },
    });

    // Get coupons expiring in next 7 days
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const expiringCoupons = await prisma.coupon.count({
      where: {
        isActive: true,
        endDate: {
          gte: now,
          lte: nextWeek,
        },
      },
    });

    // Total usage count
    const usageStats = await prisma.coupon.aggregate({
      _sum: { usageCount: true },
    });

    return NextResponse.json({
      coupons: coupons.map((coupon) => ({
        ...coupon,
        discountValue: Number(coupon.discountValue),
        minOrderAmount: coupon.minOrderAmount ? Number(coupon.minOrderAmount) : null,
        maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
        products: coupon.products.map((p) => ({
          id: p.product.id,
          name: p.product.name,
          slug: p.product.slug,
          image: p.product.images[0]?.url || null,
        })),
        prebuiltPCs: coupon.prebuiltPCs.map((p) => ({
          id: p.prebuiltPC.id,
          name: p.prebuiltPC.name,
          slug: p.prebuiltPC.slug,
          image: p.prebuiltPC.primaryImage,
        })),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total: totalCoupons,
        active: activeCoupons,
        expired: expiredCoupons,
        expiringSoon: expiringCoupons,
        totalUsage: usageStats._sum.usageCount || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

// POST - Create new coupon
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const {
      code,
      name,
      title,
      description,
      image,
      discountType = "percentage",
      discountValue,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      perUserLimit = 1,
      applyOn = "BOTH",
      applyToAll = true,
      startDate,
      endDate,
      isActive = true,
      productIds = [],
      prebuiltPCIds = [],
    } = body;

    // Validate required fields
    if (!code || !name || discountValue === undefined) {
      return NextResponse.json(
        { error: "Code, name, and discount value are required" },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existingCoupon) {
      return NextResponse.json(
        { error: "Coupon code already exists" },
        { status: 400 }
      );
    }

    // Validate discount value
    if (discountType === "percentage" && (discountValue < 0 || discountValue > 100)) {
      return NextResponse.json(
        { error: "Percentage discount must be between 0 and 100" },
        { status: 400 }
      );
    }

    if (discountType === "fixed" && discountValue < 0) {
      return NextResponse.json(
        { error: "Fixed discount must be positive" },
        { status: 400 }
      );
    }

    // Create coupon
    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        name,
        title: title || null,
        description: description || null,
        image: image || null,
        discountType,
        discountValue,
        minOrderAmount: minOrderAmount || null,
        maxDiscount: maxDiscount || null,
        usageLimit: usageLimit || null,
        perUserLimit,
        applyOn,
        applyToAll,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive,
        products: !applyToAll && productIds.length > 0 ? {
          create: productIds.map((productId: string) => ({
            productId,
          })),
        } : undefined,
        prebuiltPCs: !applyToAll && prebuiltPCIds.length > 0 ? {
          create: prebuiltPCIds.map((prebuiltPCId: string) => ({
            prebuiltPCId,
          })),
        } : undefined,
      },
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

    return NextResponse.json({
      success: true,
      coupon: {
        ...coupon,
        discountValue: Number(coupon.discountValue),
        minOrderAmount: coupon.minOrderAmount ? Number(coupon.minOrderAmount) : null,
        maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
      },
      message: "Coupon created successfully",
    });
  } catch (error) {
    console.error("Error creating coupon:", error);
    return NextResponse.json(
      { error: "Failed to create coupon" },
      { status: 500 }
    );
  }
}
