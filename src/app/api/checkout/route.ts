import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createRazorpayOrder } from "@/lib/razorpay";

// Generate unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SCB${timestamp}${random}`;
}

// POST - Create checkout session / order
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();

    const {
      items, // Array of cart items
      shippingAddress,
      billingAddress,
      paymentMethod, // COD, RAZORPAY
      couponCode,
      customerNotes,
    } = body;

    // Validate required fields
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!shippingAddress) {
      return NextResponse.json({ error: "Shipping address is required" }, { status: 400 });
    }

    if (!paymentMethod) {
      return NextResponse.json({ error: "Payment method is required" }, { status: 400 });
    }

    // Calculate order totals
    let subtotal = 0;
    const orderItems: any[] = [];

    for (const item of items) {
      let product = null;
      let prebuiltPC = null;
      let price = 0;
      let name = "";
      let sku = "";
      let image = "";

      if (item.productId) {
        product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: { images: { take: 1 } },
        });
        if (!product) {
          return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
        }
        if (!product.isInStock || product.stockQuantity < item.quantity) {
          return NextResponse.json({ error: `${product.name} is out of stock` }, { status: 400 });
        }
        price = Number(product.price);
        name = product.name;
        sku = product.sku || "";
        image = product.images[0]?.url || "";
      } else if (item.prebuiltPCId) {
        prebuiltPC = await prisma.prebuiltPC.findUnique({
          where: { id: item.prebuiltPCId },
        });
        if (!prebuiltPC) {
          return NextResponse.json({ error: `Prebuilt PC not found: ${item.prebuiltPCId}` }, { status: 400 });
        }
        if (!prebuiltPC.isInStock) {
          return NextResponse.json({ error: `${prebuiltPC.name} is out of stock` }, { status: 400 });
        }
        price = Number(prebuiltPC.sellingPrice);
        name = prebuiltPC.name;
        sku = prebuiltPC.slug;
        image = prebuiltPC.primaryImage || "";
      }

      const total = price * item.quantity;
      subtotal += total;

      orderItems.push({
        productId: item.productId || null,
        prebuiltPCId: item.prebuiltPCId || null,
        variationId: item.variationId || null,
        name,
        sku,
        image,
        price,
        quantity: item.quantity,
        total,
        variationName: item.variationName || null,
      });
    }

    // Apply coupon if provided
    let couponDiscount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      if (coupon && coupon.isActive) {
        const now = new Date();
        const isValid =
          (!coupon.startDate || coupon.startDate <= now) &&
          (!coupon.endDate || coupon.endDate >= now) &&
          (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit) &&
          (!coupon.minOrderAmount || subtotal >= Number(coupon.minOrderAmount));

        if (isValid) {
          if (coupon.discountType === "percentage") {
            couponDiscount = (subtotal * Number(coupon.discountValue)) / 100;
            if (coupon.maxDiscount) {
              couponDiscount = Math.min(couponDiscount, Number(coupon.maxDiscount));
            }
          } else {
            couponDiscount = Number(coupon.discountValue);
          }
        }
      }
    }

    // Calculate shipping (simplified - you can add more complex logic)
    const shippingCharge = subtotal >= 10000 ? 0 : 99; // Free shipping above 10000

    // Calculate tax (18% GST)
    const tax = Math.round((subtotal - couponDiscount) * 0.18 * 100) / 100;

    // Calculate total
    const total = subtotal - couponDiscount + shippingCharge + tax;

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user?.id || null,
        status: "PENDING",
        paymentStatus: paymentMethod === "COD" ? "COD_PENDING" : "PENDING",
        paymentMethod: paymentMethod as any,
        subtotal,
        discount: couponDiscount,
        shippingCharge,
        tax,
        total,
        couponCode: couponCode || null,
        couponDiscount,
        shippingName: shippingAddress.fullName,
        shippingMobile: shippingAddress.mobile,
        shippingAddress1: shippingAddress.addressLine1,
        shippingAddress2: shippingAddress.addressLine2 || null,
        shippingLandmark: shippingAddress.landmark || null,
        shippingCity: shippingAddress.city,
        shippingState: shippingAddress.state,
        shippingPincode: shippingAddress.pincode,
        shippingCountry: shippingAddress.country || "India",
        billingName: billingAddress?.fullName || null,
        billingMobile: billingAddress?.mobile || null,
        billingAddress1: billingAddress?.addressLine1 || null,
        billingAddress2: billingAddress?.addressLine2 || null,
        billingCity: billingAddress?.city || null,
        billingState: billingAddress?.state || null,
        billingPincode: billingAddress?.pincode || null,
        billingCountry: billingAddress?.country || null,
        customerNotes: customerNotes || null,
        items: {
          create: orderItems,
        },
        timeline: {
          create: {
            status: "PENDING",
            title: "Order Placed",
            description: "Your order has been placed successfully",
          },
        },
      },
      include: {
        items: true,
      },
    });

    // If payment method is Razorpay, create Razorpay order
    let razorpayOrder = null;
    if (paymentMethod === "RAZORPAY") {
      const razorpayResult = await createRazorpayOrder(
        total,
        "INR",
        order.orderNumber,
        {
          orderId: order.id,
          orderNumber: order.orderNumber,
        }
      );

      if (razorpayResult.success) {
        razorpayOrder = razorpayResult.order;

        // Update order with Razorpay order ID
        await prisma.order.update({
          where: { id: order.id },
          data: { razorpayOrderId: razorpayOrder.id },
        });
      } else {
        // Delete the order if Razorpay order creation fails
        await prisma.order.delete({ where: { id: order.id } });
        return NextResponse.json(
          { error: "Failed to create payment order" },
          { status: 500 }
        );
      }
    }

    // If COD, confirm the order immediately
    if (paymentMethod === "COD") {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "CONFIRMED" },
      });

      await prisma.orderTimeline.create({
        data: {
          orderId: order.id,
          status: "CONFIRMED",
          title: "Order Confirmed",
          description: "Your COD order has been confirmed",
        },
      });

      // Reduce stock for products
      for (const item of orderItems) {
        if (item.productId) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: { decrement: item.quantity },
            },
          });
        }
      }
    }

    // Clear cart after successful order
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

    // Update coupon usage count
    if (couponCode && couponDiscount > 0) {
      await prisma.coupon.update({
        where: { code: couponCode.toUpperCase() },
        data: { usageCount: { increment: 1 } },
      });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total,
        paymentMethod,
        status: order.status,
      },
      razorpay: razorpayOrder
        ? {
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_dummy_key_id",
          }
        : null,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
