import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { createShiprocketOrder, type ShiprocketOrderData } from "@/lib/shiprocket";

// POST - Verify Razorpay payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify signature
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      // Update order status to failed
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: "FAILED" },
      });

      await prisma.orderTimeline.create({
        data: {
          orderId,
          status: "PENDING",
          title: "Payment Failed",
          description: "Payment verification failed",
        },
      });

      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    // Get the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update order with payment details
    await prisma.order.update({
      where: { id: orderId },
      data: {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paymentStatus: "PAID",
        status: "CONFIRMED",
        paidAt: new Date(),
      },
    });

    // Add timeline entry
    await prisma.orderTimeline.create({
      data: {
        orderId,
        status: "CONFIRMED",
        title: "Payment Successful",
        description: `Payment received via Razorpay (${razorpay_payment_id})`,
      },
    });

    // Reduce stock for products
    for (const item of order.items) {
      if (item.productId) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: { decrement: item.quantity },
          },
        });
      }
    }

    // Clear cart after successful payment
    const user = await getCurrentUser();
    if (user?.id) {
      // Clear logged-in user's cart
      const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
      if (cart) {
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      }
    } else {
      // Clear guest user's cart using session ID
      const cookieStore = await cookies();
      const sessionId = cookieStore.get("cart_session_id")?.value;
      if (sessionId) {
        const guestCart = await prisma.cart.findFirst({ where: { sessionId } });
        if (guestCart) {
          await prisma.cartItem.deleteMany({ where: { cartId: guestCart.id } });
        }
      }
    }

    // Create Shiprocket order
    try {
      const shiprocketOrderData: ShiprocketOrderData = {
        order_id: order.orderNumber,
        order_date: new Date().toISOString().split("T")[0],
        billing_customer_name: order.billingName || order.shippingName,
        billing_address: order.billingAddress1 || order.shippingAddress1,
        billing_address_2: order.billingAddress2 || order.shippingAddress2 || "",
        billing_city: order.billingCity || order.shippingCity,
        billing_pincode: order.billingPincode || order.shippingPincode,
        billing_state: order.billingState || order.shippingState,
        billing_country: order.billingCountry || order.shippingCountry,
        billing_phone: order.billingMobile || order.shippingMobile,
        shipping_is_billing: !order.billingAddress1,
        shipping_customer_name: order.shippingName,
        shipping_address: order.shippingAddress1,
        shipping_address_2: order.shippingAddress2 || "",
        shipping_city: order.shippingCity,
        shipping_pincode: order.shippingPincode,
        shipping_state: order.shippingState,
        shipping_country: order.shippingCountry,
        shipping_phone: order.shippingMobile,
        order_items: order.items.map((item) => ({
          name: item.name,
          sku: item.sku || item.id,
          units: item.quantity,
          selling_price: Number(item.price),
        })),
        payment_method: "Prepaid",
        sub_total: Number(order.subtotal),
        length: 30, // Default dimensions
        breadth: 20,
        height: 15,
        weight: 2, // Default weight in kg
      };

      const shiprocketResult = await createShiprocketOrder(shiprocketOrderData);

      if (shiprocketResult.success) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            shiprocketOrderId: shiprocketResult.orderId?.toString(),
            shiprocketShipmentId: shiprocketResult.shipmentId?.toString(),
          },
        });
      }
    } catch (shiprocketError) {
      console.error("Shiprocket order creation failed:", shiprocketError);
      // Don't fail the payment verification if Shiprocket fails
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: "CONFIRMED",
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
