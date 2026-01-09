import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET - List user's orders
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Please login to view orders" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

    const skip = (page - 1) * limit;

    const where: any = { userId: user.id };
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            select: {
              id: true,
              name: true,
              image: true,
              price: true,
              quantity: true,
              total: true,
            },
          },
          timeline: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    const transformedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      total: Number(order.total),
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      items: order.items.map((item) => ({
        ...item,
        price: Number(item.price),
        total: Number(item.total),
      })),
      latestUpdate: order.timeline[0]?.title || "Order Placed",
      shippingCity: order.shippingCity,
      createdAt: order.createdAt,
      deliveredAt: order.deliveredAt,
      awbNumber: order.awbNumber,
      trackingUrl: order.trackingUrl,
    }));

    return NextResponse.json({
      orders: transformedOrders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
