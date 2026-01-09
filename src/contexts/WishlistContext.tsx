"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { toast } from "sonner";

interface WishlistItem {
  id: string;
  type: "product" | "prebuiltPC";
  productId: string | null;
  prebuiltPCId: string | null;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  discount: number;
  image: string;
  isInStock: boolean;
  addedAt: string;
}

interface Wishlist {
  id: string;
  items: WishlistItem[];
  totalItems: number;
}

interface WishlistContextType {
  wishlist: Wishlist | null;
  isLoading: boolean;
  addToWishlist: (productId: string, type: "product" | "prebuilt") => Promise<boolean>;
  removeFromWishlist: (itemId: string) => Promise<void>;
  isInWishlist: (productId: string, type: "product" | "prebuilt") => boolean;
  toggleWishlist: (productId: string, type: "product" | "prebuilt") => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch wishlist on mount
  const fetchWishlist = useCallback(async () => {
    try {
      const res = await fetch("/api/wishlist");
      if (res.ok) {
        const data = await res.json();
        if (data.wishlist) {
          setWishlist(data.wishlist);
        }
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Add item to wishlist
  const addToWishlist = useCallback(async (productId: string, type: "product" | "prebuilt"): Promise<boolean> => {
    try {
      const body = type === "product"
        ? { productId }
        : { prebuiltPCId: productId };

      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (res.ok && data.wishlist) {
        setWishlist(data.wishlist);
        return true;
      } else if (data.alreadyExists) {
        return false;
      } else {
        throw new Error(data.error || "Failed to add to wishlist");
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      throw error;
    }
  }, []);

  // Remove item from wishlist
  const removeFromWishlist = useCallback(async (itemId: string) => {
    try {
      const res = await fetch(`/api/wishlist?itemId=${itemId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok && data.wishlist) {
        setWishlist(data.wishlist);
      } else {
        throw new Error(data.error || "Failed to remove from wishlist");
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      throw error;
    }
  }, []);

  // Check if item is in wishlist
  const isInWishlist = useCallback((productId: string, type: "product" | "prebuilt"): boolean => {
    if (!wishlist) return false;
    return wishlist.items.some(
      (item) =>
        (type === "product" && item.productId === productId) ||
        (type === "prebuilt" && item.prebuiltPCId === productId)
    );
  }, [wishlist]);

  // Toggle wishlist (add/remove)
  const toggleWishlist = useCallback(async (productId: string, type: "product" | "prebuilt") => {
    const inWishlist = isInWishlist(productId, type);
    if (inWishlist) {
      // Find the item to remove
      const item = wishlist?.items.find(
        (i) =>
          (type === "product" && i.productId === productId) ||
          (type === "prebuilt" && i.prebuiltPCId === productId)
      );
      if (item) {
        await removeFromWishlist(item.id);
      }
    } else {
      await addToWishlist(productId, type);
    }
  }, [wishlist, isInWishlist, addToWishlist, removeFromWishlist]);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isLoading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
