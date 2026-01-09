import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET - List all customers with filters, search, pagination, and stats
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
    const status = searchParams.get("status") || ""; // active, blocked
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause - only CUSTOMER role
    const where: any = {
      role: "CUSTOMER",
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { mobile: { contains: search } },
      ];
    }

    if (status === "active") {
      where.status = "ACTIVE";
    } else if (status === "blocked") {
      where.status = "BLOCKED";
    }

    // Get total count
    const total = await prisma.user.count({ where });

    // Get customers with order stats
    const customers = await prisma.user.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        status: true,
        avatar: true,
        emailVerified: true,
        mobileVerified: true,
        lastLoginAt: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            reviews: true,
          },
        },
        orders: {
          where: {
            paymentStatus: { in: ["PAID", "COD_PENDING"] },
          },
          select: {
            total: true,
          },
        },
      },
    });

    // Transform customers
    const transformedCustomers = customers.map((customer) => {
      const totalSpent = customer.orders.reduce(
        (sum, order) => sum + Number(order.total),
        0
      );

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        mobile: customer.mobile,
        status: customer.status,
        avatar: customer.avatar,
        emailVerified: customer.emailVerified,
        mobileVerified: customer.mobileVerified,
        lastLoginAt: customer.lastLoginAt,
        createdAt: customer.createdAt,
        orderCount: customer._count.orders,
        reviewCount: customer._count.reviews,
        totalSpent,
      };
    });

    // Get stats
    const totalCustomers = await prisma.user.count({
      where: { role: "CUSTOMER" },
    });

    const activeCustomers = await prisma.user.count({
      where: { role: "CUSTOMER", status: "ACTIVE" },
    });

    const blockedCustomers = await prisma.user.count({
      where: { role: "CUSTOMER", status: "BLOCKED" },
    });

    // Get customers joined this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newThisMonth = await prisma.user.count({
      where: {
        role: "CUSTOMER",
        createdAt: { gte: startOfMonth },
      },
    });

    // Get total orders and revenue from customers
    const orderStats = await prisma.order.aggregate({
      where: {
        paymentStatus: { in: ["PAID", "COD_PENDING"] },
      },
      _count: { id: true },
      _sum: { total: true },
    });

    return NextResponse.json({
      customers: transformedCustomers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalCustomers,
        activeCustomers,
        blockedCustomers,
        newThisMonth,
        totalOrders: orderStats._count.id || 0,
        totalRevenue: Number(orderStats._sum.total) || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
