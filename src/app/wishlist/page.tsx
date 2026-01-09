"use client";

import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Trash2, Loader2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function WishlistPage() {
  const { wishlist, isLoading, removeFromWishlist, refreshWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleRemove = async (itemId: string) => {
    setActionLoading(itemId);
    try {
      await removeFromWishlist(itemId);
      toast.success("Removed from wishlist");
    } catch {
      toast.error("Failed to remove from wishlist");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddToCart = async (item: any) => {
    setActionLoading(`cart-${item.id}`);
    try {
      const productId = item.productId || item.prebuiltPCId;
      const type = item.productId ? "product" : "prebuilt";
      await addToCart(productId, type, 1);
      toast.success("Added to cart!");
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-8 w-8 text-red-500 fill-red-500" />
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          {wishlist && wishlist.items.length > 0 && (
            <span className="text-muted-foreground">
              ({wishlist.items.length} {wishlist.items.length === 1 ? "item" : "items"})
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !wishlist || wishlist.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
              <Heart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Save your favorite products to your wishlist and shop them later.
            </p>
            <Button asChild size="lg">
              <Link href="/products">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Start Shopping
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.items.map((item) => {
              const linkHref = item.productId
                ? `/product/${item.slug}`
                : `/prebuilt-pcs/${item.slug}`;

              return (
                <div
                  key={item.id}
                  className="bg-card border rounded-xl overflow-hidden group hover:shadow-lg transition-shadow"
                >
                  <Link href={linkHref}>
                    <div className="relative aspect-square bg-muted/30 p-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder-product.png";
                        }}
                      />
                      {!item.isInStock && (
                        <div className="absolute top-2 right-2 px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                          Out of Stock
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="p-4 space-y-3">
                    <Link href={linkHref}>
                      <h3 className="font-medium line-clamp-2 hover:text-primary transition-colors">
                        {item.name}
                      </h3>
                    </Link>

                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-primary">
                        ₹{formatPrice(item.price)}
                      </span>
                      {item.compareAtPrice && item.compareAtPrice > item.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          ₹{formatPrice(item.compareAtPrice)}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => handleAddToCart(item)}
                        disabled={!item.isInStock || actionLoading === `cart-${item.id}`}
                      >
                        {actionLoading === `cart-${item.id}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Cart
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRemove(item.id)}
                        disabled={actionLoading === item.id}
                      >
                        {actionLoading === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
