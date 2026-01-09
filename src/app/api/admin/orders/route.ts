import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Prisma } from "@prisma/client";

// GET - List all orders with filters and pagination
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
    const status = searchParams.get("status") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.OrderWhereInput = {};

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { shippingName: { contains: search } },
        { shippingMobile: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }

    if (status) {
      where.status = status as any;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus as any;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Build orderBy
    const orderBy: Prisma.OrderOrderByWithRelationInput = {};
    orderBy[sortBy as keyof Prisma.OrderOrderByWithRelationInput] = sortOrder as Prisma.SortOrder;

    // Fetch orders
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            select: {
              id: true,
              name: true,
              quantity: true,
              price: true,
              image: true,
            },
          },
          _count: {
            select: { items: true },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    // Get stats
    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      todayOrders,
      todayRevenue,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "PROCESSING" } }),
      prisma.order.count({ where: { status: "SHIPPED" } }),
      prisma.order.count({ where: { status: "DELIVERED" } }),
      prisma.order.count({ where: { status: "CANCELLED" } }),
      prisma.order.aggregate({
        where: { paymentStatus: "PAID" },
        _sum: { total: true },
      }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.order.aggregate({
        where: {
          paymentStatus: "PAID",
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
        _sum: { total: true },
      }),
    ]);

    // Transform orders for response
    const transformedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customer: {
        id: order.user?.id || null,
        name: order.user?.name || order.shippingName,
        email: order.user?.email || null,
        phone: order.shippingMobile,
      },
      items: order._count.items,
      itemsList: order.items,
      total: Number(order.total),
      subtotal: Number(order.subtotal),
      discount: Number(order.discount),
      shippingCharge: Number(order.shippingCharge),
      tax: Number(order.tax),
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      status: order.status,
      shippingAddress: {
        name: order.shippingName,
        phone: order.shippingMobile,
        address1: order.shippingAddress1,
        address2: order.shippingAddress2,
        city: order.shippingCity,
        state: order.shippingState,
        pincode: order.shippingPincode,
      },
      trackingNumber: order.awbNumber,
      courierName: order.courierName,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));

    return NextResponse.json({
      orders: transformedOrders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      stats: {
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue: Number(totalRevenue._sum.total || 0),
        todayOrders,
        todayRevenue: Number(todayRevenue._sum.total || 0),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
