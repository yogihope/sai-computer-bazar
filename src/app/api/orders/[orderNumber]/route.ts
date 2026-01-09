import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { trackShipment } from "@/lib/shiprocket";

// GET - Get single order details
export async function GET(
  request: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const user = await getCurrentUser();
    const { orderNumber } = params;

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                slug: true,
                images: { take: 1, select: { url: true } },
              },
            },
            prebuiltPC: {
              select: {
                id: true,
                slug: true,
              },
            },
          },
        },
        timeline: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if user has access to this order
    if (order.userId && user?.id !== order.userId && user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get tracking info if AWB is available
    let trackingInfo = null;
    if (order.awbNumber) {
      const trackingResult = await trackShipment(order.awbNumber);
      if (trackingResult.success) {
        trackingInfo = trackingResult.trackingData;
      }
    }

    const transformedOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      subtotal: Number(order.subtotal),
      discount: Number(order.discount),
      shippingCharge: Number(order.shippingCharge),
      tax: Number(order.tax),
      total: Number(order.total),
      couponCode: order.couponCode,
      couponDiscount: Number(order.couponDiscount),
      shippingAddress: {
        name: order.shippingName,
        mobile: order.shippingMobile,
        addressLine1: order.shippingAddress1,
        addressLine2: order.shippingAddress2,
        landmark: order.shippingLandmark,
        city: order.shippingCity,
        state: order.shippingState,
        pincode: order.shippingPincode,
        country: order.shippingCountry,
      },
      billingAddress: order.billingAddress1
        ? {
            name: order.billingName,
            mobile: order.billingMobile,
            addressLine1: order.billingAddress1,
            addressLine2: order.billingAddress2,
            city: order.billingCity,
            state: order.billingState,
            pincode: order.billingPincode,
            country: order.billingCountry,
          }
        : null,
      items: order.items.map((item) => ({
        id: item.id,
        type: item.productId ? "product" : "prebuiltPC",
        productId: item.productId,
        prebuiltPCId: item.prebuiltPCId,
        slug: item.productId
          ? item.product?.slug
          : item.prebuiltPC?.slug,
        name: item.name,
        sku: item.sku,
        image: item.image || item.product?.images[0]?.url || "/placeholder-product.png",
        price: Number(item.price),
        quantity: item.quantity,
        total: Number(item.total),
        variationName: item.variationName,
      })),
      timeline: order.timeline.map((entry) => ({
        id: entry.id,
        status: entry.status,
        title: entry.title,
        description: entry.description,
        location: entry.location,
        createdAt: entry.createdAt,
      })),
      tracking: {
        awbNumber: order.awbNumber,
        courierName: order.courierName,
        trackingUrl: order.trackingUrl,
        trackingInfo,
      },
      customerNotes: order.customerNotes,
      paidAt: order.paidAt,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      cancelledAt: order.cancelledAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    return NextResponse.json({ order: transformedOrder });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

// PUT - Cancel order
export async function PUT(
  request: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const user = await getCurrentUser();
    const { orderNumber } = params;
    const body = await request.json();
    const { action } = body;

    const order = await prisma.order.findUnique({
      where: { orderNumber },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if user has access
    if (order.userId && user?.id !== order.userId && user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (action === "cancel") {
      // Only allow cancellation for pending/confirmed orders
      if (!["PENDING", "CONFIRMED", "PROCESSING"].includes(order.status)) {
        return NextResponse.json(
          { error: "Order cannot be cancelled at this stage" },
          { status: 400 }
        );
      }

      await prisma.order.update({
        where: { orderNumber },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
        },
      });

      await prisma.orderTimeline.create({
        data: {
          orderId: order.id,
          status: "CANCELLED",
          title: "Order Cancelled",
          description: user?.role === "ADMIN" ? "Cancelled by admin" : "Cancelled by customer",
        },
      });

      // Restore stock for products
      const items = await prisma.orderItem.findMany({
        where: { orderId: order.id },
      });

      for (const item of items) {
        if (item.productId) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: { increment: item.quantity },
            },
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: "Order cancelled successfully",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
