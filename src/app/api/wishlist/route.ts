import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Force dynamic to prevent caching
export const dynamic = "force-dynamic";

// Helper to get or create session ID for guest users
async function getSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get("wishlist_session_id")?.value;

  if (!sessionId) {
    sessionId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  return sessionId;
}

// Helper to get or create wishlist
async function getOrCreateWishlist(userId?: string, sessionId?: string) {
  let wishlist = null;

  if (userId) {
    wishlist = await prisma.wishlist.findUnique({
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
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  if (!wishlist && sessionId) {
    wishlist = await prisma.wishlist.findFirst({
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
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  if (!wishlist) {
    wishlist = await prisma.wishlist.create({
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
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  return wishlist;
}

// Transform wishlist items for response
function transformWishlistItems(items: any[]) {
  return items.map((item) => {
    const isProduct = !!item.product;
    const product = item.product;
    const prebuiltPC = item.prebuiltPC;

    let name, slug, price, compareAtPrice, image, isInStock;

    if (isProduct) {
      name = product.name;
      slug = product.slug;
      price = Number(product.price);
      compareAtPrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
      image = product.images[0]?.url || "/placeholder-product.png";
      isInStock = product.isInStock;
    } else {
      name = prebuiltPC.name;
      slug = prebuiltPC.slug;
      price = Number(prebuiltPC.sellingPrice);
      compareAtPrice = prebuiltPC.compareAtPrice ? Number(prebuiltPC.compareAtPrice) : null;
      image = prebuiltPC.primaryImage || "/placeholder-product.png";
      isInStock = prebuiltPC.isInStock;
    }

    const discount = compareAtPrice && compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : 0;

    return {
      id: item.id,
      type: isProduct ? "product" : "prebuiltPC",
      productId: item.productId,
      prebuiltPCId: item.prebuiltPCId,
      name,
      slug,
      price,
      compareAtPrice,
      discount,
      image,
      isInStock,
      addedAt: item.createdAt,
    };
  });
}

// GET wishlist
export async function GET() {
  try {
    const user = await getCurrentUser();
    const sessionId = await getSessionId();

    const wishlist = await getOrCreateWishlist(user?.id, sessionId);
    const items = transformWishlistItems(wishlist.items);

    const response = NextResponse.json({
      wishlist: {
        id: wishlist.id,
        items,
        totalItems: items.length,
      },
    });

    // Set session cookie for guest users
    if (!user) {
      response.cookies.set("wishlist_session_id", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
    }

    return response;
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

// POST - Add item to wishlist
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const sessionId = await getSessionId();
    const body = await request.json();

    const { productId, prebuiltPCId } = body;

    if (!productId && !prebuiltPCId) {
      return NextResponse.json(
        { error: "Product ID or Prebuilt PC ID is required" },
        { status: 400 }
      );
    }

    const wishlist = await getOrCreateWishlist(user?.id, sessionId);

    // Check if item already exists
    const existingItem = wishlist.items.find(
      (item) =>
        (productId && item.productId === productId) ||
        (prebuiltPCId && item.prebuiltPCId === prebuiltPCId)
    );

    if (existingItem) {
      return NextResponse.json(
        { error: "Item already in wishlist", alreadyExists: true },
        { status: 400 }
      );
    }

    // Add new item
    await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId: productId || null,
        prebuiltPCId: prebuiltPCId || null,
      },
    });

    // Fetch updated wishlist
    const updatedWishlist = await getOrCreateWishlist(user?.id, sessionId);
    const items = transformWishlistItems(updatedWishlist.items);

    const response = NextResponse.json({
      wishlist: {
        id: updatedWishlist.id,
        items,
        totalItems: items.length,
      },
      message: "Added to wishlist",
    });

    // Set session cookie for guest users
    if (!user) {
      response.cookies.set("wishlist_session_id", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json({ error: "Failed to add to wishlist" }, { status: 500 });
  }
}

// DELETE - Remove item from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const sessionId = await getSessionId();
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");
    const productId = searchParams.get("productId");
    const prebuiltPCId = searchParams.get("prebuiltPCId");

    const wishlist = await getOrCreateWishlist(user?.id, sessionId);

    let itemToDelete = null;

    if (itemId) {
      itemToDelete = wishlist.items.find((i) => i.id === itemId);
    } else if (productId) {
      itemToDelete = wishlist.items.find((i) => i.productId === productId);
    } else if (prebuiltPCId) {
      itemToDelete = wishlist.items.find((i) => i.prebuiltPCId === prebuiltPCId);
    }

    if (!itemToDelete) {
      return NextResponse.json({ error: "Item not found in wishlist" }, { status: 404 });
    }

    // Delete item
    await prisma.wishlistItem.delete({
      where: { id: itemToDelete.id },
    });

    // Fetch updated wishlist
    const updatedWishlist = await getOrCreateWishlist(user?.id, sessionId);
    const items = transformWishlistItems(updatedWishlist.items);

    return NextResponse.json({
      wishlist: {
        id: updatedWishlist.id,
        items,
        totalItems: items.length,
      },
      message: "Removed from wishlist",
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json({ error: "Failed to remove from wishlist" }, { status: 500 });
  }
}
