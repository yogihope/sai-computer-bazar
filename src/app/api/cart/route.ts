import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Force dynamic to prevent caching
export const dynamic = "force-dynamic";

// Helper to get or create session ID for guest users
async function getSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get("cart_session_id")?.value;

  if (!sessionId) {
    sessionId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  return sessionId;
}

// Helper to get or create cart
async function getOrCreateCart(userId?: string, sessionId?: string) {
  let cart = null;

  if (userId) {
    cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                compareAtPrice: true,
                isInStock: true,
                stockQuantity: true,
                images: { take: 1, select: { url: true } },
              },
            },
            prebuiltPC: {
              select: {
                id: true,
                name: true,
                slug: true,
                sellingPrice: true,
                compareAtPrice: true,
                isInStock: true,
                primaryImage: true,
              },
            },
            variation: {
              select: {
                id: true,
                name: true,
                type: true,
                price: true,
                isInStock: true,
                stockQuantity: true,
              },
            },
          },
        },
      },
    });
  }

  if (!cart && sessionId) {
    cart = await prisma.cart.findFirst({
      where: { sessionId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                compareAtPrice: true,
                isInStock: true,
                stockQuantity: true,
                images: { take: 1, select: { url: true } },
              },
            },
            prebuiltPC: {
              select: {
                id: true,
                name: true,
                slug: true,
                sellingPrice: true,
                compareAtPrice: true,
                isInStock: true,
                primaryImage: true,
              },
            },
            variation: {
              select: {
                id: true,
                name: true,
                type: true,
                price: true,
                isInStock: true,
                stockQuantity: true,
              },
            },
          },
        },
      },
    });
  }

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId: userId || null,
        sessionId: userId ? null : sessionId,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                compareAtPrice: true,
                isInStock: true,
                stockQuantity: true,
                images: { take: 1, select: { url: true } },
              },
            },
            prebuiltPC: {
              select: {
                id: true,
                name: true,
                slug: true,
                sellingPrice: true,
                compareAtPrice: true,
                isInStock: true,
                primaryImage: true,
              },
            },
            variation: {
              select: {
                id: true,
                name: true,
                type: true,
                price: true,
                isInStock: true,
                stockQuantity: true,
              },
            },
          },
        },
      },
    });
  }

  return cart;
}

// Transform cart items for response
function transformCartItems(items: any[]) {
  return items.map((item) => {
    const isProduct = !!item.product;
    const product = item.product;
    const prebuiltPC = item.prebuiltPC;
    const variation = item.variation;

    let name, slug, price, compareAtPrice, image, isInStock, stockQuantity;

    if (isProduct) {
      name = product.name;
      slug = product.slug;
      price = variation?.price ? Number(variation.price) : Number(product.price);
      compareAtPrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
      image = product.images[0]?.url || "/placeholder-product.png";
      isInStock = variation ? variation.isInStock : product.isInStock;
      stockQuantity = variation ? variation.stockQuantity : product.stockQuantity;
    } else {
      name = prebuiltPC.name;
      slug = prebuiltPC.slug;
      price = Number(prebuiltPC.sellingPrice);
      compareAtPrice = prebuiltPC.compareAtPrice ? Number(prebuiltPC.compareAtPrice) : null;
      image = prebuiltPC.primaryImage || "/placeholder-product.png";
      isInStock = prebuiltPC.isInStock;
      stockQuantity = 999; // Prebuilt PCs are made to order
    }

    return {
      id: item.id,
      type: isProduct ? "product" : "prebuiltPC",
      productId: item.productId,
      prebuiltPCId: item.prebuiltPCId,
      variationId: item.variationId,
      variationName: variation?.name || null,
      name,
      slug,
      price,
      compareAtPrice,
      image,
      quantity: item.quantity,
      total: price * item.quantity,
      isInStock,
      stockQuantity,
    };
  });
}

// GET cart
export async function GET() {
  try {
    const user = await getCurrentUser();
    const sessionId = await getSessionId();

    const cart = await getOrCreateCart(user?.id, sessionId);
    const items = transformCartItems(cart.items);

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    const response = NextResponse.json({
      cart: {
        id: cart.id,
        items,
        subtotal,
        totalItems,
      },
    });

    // Prevent caching
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    // Set session cookie for guest users
    if (!user) {
      response.cookies.set("cart_session_id", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
    }

    return response;
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const sessionId = await getSessionId();
    const body = await request.json();

    const { productId, prebuiltPCId, variationId, quantity = 1 } = body;

    if (!productId && !prebuiltPCId) {
      return NextResponse.json(
        { error: "Product ID or Prebuilt PC ID is required" },
        { status: 400 }
      );
    }

    const cart = await getOrCreateCart(user?.id, sessionId);

    // Check if item already exists in cart
    let existingItem = null;
    if (productId) {
      existingItem = cart.items.find(
        (item) =>
          item.productId === productId &&
          item.variationId === (variationId || null)
      );
    } else if (prebuiltPCId) {
      existingItem = cart.items.find((item) => item.prebuiltPCId === prebuiltPCId);
    }

    if (existingItem) {
      // Update quantity
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      // Add new item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: productId || null,
          prebuiltPCId: prebuiltPCId || null,
          variationId: variationId || null,
          quantity,
        },
      });
    }

    // Fetch updated cart
    const updatedCart = await getOrCreateCart(user?.id, sessionId);
    const items = transformCartItems(updatedCart.items);
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    const response = NextResponse.json({
      cart: {
        id: updatedCart.id,
        items,
        subtotal,
        totalItems,
      },
      message: "Item added to cart",
    });

    // Set session cookie for guest users
    if (!user) {
      response.cookies.set("cart_session_id", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json({ error: "Failed to add item to cart" }, { status: 500 });
  }
}

// PUT - Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const sessionId = await getSessionId();
    const body = await request.json();

    const { itemId, quantity } = body;

    if (!itemId) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    if (quantity < 1) {
      return NextResponse.json({ error: "Quantity must be at least 1" }, { status: 400 });
    }

    const cart = await getOrCreateCart(user?.id, sessionId);

    // Verify item belongs to this cart
    const item = cart.items.find((i) => i.id === itemId);
    if (!item) {
      return NextResponse.json({ error: "Item not found in cart" }, { status: 404 });
    }

    // Update quantity
    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    // Fetch updated cart
    const updatedCart = await getOrCreateCart(user?.id, sessionId);
    const items = transformCartItems(updatedCart.items);
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return NextResponse.json({
      cart: {
        id: updatedCart.id,
        items,
        subtotal,
        totalItems,
      },
      message: "Cart updated",
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}

// DELETE - Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const sessionId = await getSessionId();
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    const cart = await getOrCreateCart(user?.id, sessionId);

    // Verify item belongs to this cart
    const item = cart.items.find((i) => i.id === itemId);
    if (!item) {
      return NextResponse.json({ error: "Item not found in cart" }, { status: 404 });
    }

    // Delete item
    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    // Fetch updated cart
    const updatedCart = await getOrCreateCart(user?.id, sessionId);
    const items = transformCartItems(updatedCart.items);
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return NextResponse.json({
      cart: {
        id: updatedCart.id,
        items,
        subtotal,
        totalItems,
      },
      message: "Item removed from cart",
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return NextResponse.json({ error: "Failed to remove item from cart" }, { status: 500 });
  }
}
