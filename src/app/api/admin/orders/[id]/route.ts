import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET - Get single order details
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

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            mobile: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: { take: 1, select: { url: true } },
              },
            },
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
        timeline: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Transform order for response
    const transformedOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      customer: {
        id: order.user?.id || null,
        name: order.user?.name || order.shippingName,
        email: order.user?.email || null,
        phone: order.user?.mobile || order.shippingMobile,
      },
      shippingAddress: {
        name: order.shippingName,
        phone: order.shippingMobile,
        address1: order.shippingAddress1,
        address2: order.shippingAddress2,
        landmark: order.shippingLandmark,
        city: order.shippingCity,
        state: order.shippingState,
        pincode: order.shippingPincode,
        country: order.shippingCountry,
      },
      billingAddress: order.billingName
        ? {
            name: order.billingName,
            phone: order.billingMobile,
            address1: order.billingAddress1,
            address2: order.billingAddress2,
            city: order.billingCity,
            state: order.billingState,
            pincode: order.billingPincode,
            country: order.billingCountry,
          }
        : null,
      items: order.items.map((item) => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        image: item.image || item.product?.images[0]?.url || item.prebuiltPC?.primaryImage,
        price: Number(item.price),
        quantity: item.quantity,
        total: Number(item.total),
        variationName: item.variationName,
        productId: item.productId,
        prebuiltPCId: item.prebuiltPCId,
        productSlug: item.product?.slug,
        prebuiltPCSlug: item.prebuiltPC?.slug,
      })),
      pricing: {
        subtotal: Number(order.subtotal),
        discount: Number(order.discount),
        couponCode: order.couponCode,
        couponDiscount: Number(order.couponDiscount),
        shippingCharge: Number(order.shippingCharge),
        tax: Number(order.tax),
        total: Number(order.total),
      },
      payment: {
        method: order.paymentMethod,
        status: order.paymentStatus,
        razorpayOrderId: order.razorpayOrderId,
        razorpayPaymentId: order.razorpayPaymentId,
        paidAt: order.paidAt,
      },
      shipping: {
        shiprocketOrderId: order.shiprocketOrderId,
        shiprocketShipmentId: order.shiprocketShipmentId,
        awbNumber: order.awbNumber,
        courierName: order.courierName,
        trackingUrl: order.trackingUrl,
        shippedAt: order.shippedAt,
        deliveredAt: order.deliveredAt,
      },
      timeline: order.timeline.map((t) => ({
        id: t.id,
        status: t.status,
        title: t.title,
        description: t.description,
        location: t.location,
        createdAt: t.createdAt,
      })),
      notes: {
        customer: order.customerNotes,
        admin: order.adminNotes,
      },
      dates: {
        created: order.createdAt,
        updated: order.updatedAt,
        paid: order.paidAt,
        shipped: order.shippedAt,
        delivered: order.deliveredAt,
        cancelled: order.cancelledAt,
      },
    };

    return NextResponse.json({ order: transformedOrder });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// PUT - Update order
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

    const {
      status,
      paymentStatus,
      awbNumber,
      courierName,
      trackingUrl,
      adminNotes,
      timelineUpdate,
    } = body;

    // Find the order
    const existingOrder = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Build update data
    const updateData: any = {};

    if (status) {
      updateData.status = status;

      // Set timestamps based on status
      if (status === "SHIPPED" && !existingOrder.shippedAt) {
        updateData.shippedAt = new Date();
      }
      if (status === "DELIVERED" && !existingOrder.deliveredAt) {
        updateData.deliveredAt = new Date();
      }
      if (status === "CANCELLED" && !existingOrder.cancelledAt) {
        updateData.cancelledAt = new Date();
      }
    }

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
      if (paymentStatus === "PAID" && !existingOrder.paidAt) {
        updateData.paidAt = new Date();
      }
    }

    if (awbNumber !== undefined) updateData.awbNumber = awbNumber;
    if (courierName !== undefined) updateData.courierName = courierName;
    if (trackingUrl !== undefined) updateData.trackingUrl = trackingUrl;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: existingOrder.id },
      data: updateData,
    });

    // Add timeline entry if status changed or timeline update provided
    if (status || timelineUpdate) {
      const timelineData = {
        orderId: existingOrder.id,
        status: status || existingOrder.status,
        title: timelineUpdate?.title || getStatusTitle(status || existingOrder.status),
        description: timelineUpdate?.description || null,
        location: timelineUpdate?.location || null,
      };

      await prisma.orderTimeline.create({
        data: timelineData,
      });
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: "Order updated successfully",
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

function getStatusTitle(status: string): string {
  const titles: Record<string, string> = {
    PENDING: "Order Placed",
    CONFIRMED: "Order Confirmed",
    PROCESSING: "Order Processing",
    SHIPPED: "Order Shipped",
    OUT_FOR_DELIVERY: "Out for Delivery",
    DELIVERED: "Order Delivered",
    CANCELLED: "Order Cancelled",
    RETURNED: "Order Returned",
    REFUNDED: "Order Refunded",
  };
  return titles[status] || status;
}
