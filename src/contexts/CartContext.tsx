"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { toast } from "sonner";

interface CartItem {
  id: string;
  type: "product" | "prebuiltPC";
  productId: string | null;
  prebuiltPCId: string | null;
  variationId: string | null;
  variationName: string | null;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  image: string;
  quantity: number;
  total: number;
  isInStock: boolean;
  stockQuantity: number;
}

interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  totalItems: number;
}

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (productId: string, type: "product" | "prebuilt", quantity?: number, variationId?: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  resetCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Fetch cart on mount
  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
      const data = await res.json();
      if (data.cart) {
        setCart(data.cart);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add item to cart
  const addToCart = useCallback(async (productId: string, type: "product" | "prebuilt", quantity: number = 1, variationId?: string) => {
    try {
      const body = type === "product"
        ? { productId, quantity, variationId }
        : { prebuiltPCId: productId, quantity };

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (res.ok && data.cart) {
        setCart(data.cart);
        setIsCartOpen(true);
      } else {
        throw new Error(data.error || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  }, []);

  // Update item quantity
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    try {
      const res = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity }),
      });
      const data = await res.json();

      if (res.ok && data.cart) {
        setCart(data.cart);
      } else {
        toast.error(data.error || "Failed to update cart");
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      toast.error("Failed to update cart");
    }
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback(async (itemId: string) => {
    try {
      const res = await fetch(`/api/cart?itemId=${itemId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok && data.cart) {
        setCart(data.cart);
        toast.success("Item removed from cart");
      } else {
        toast.error(data.error || "Failed to remove item");
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error("Failed to remove item");
    }
  }, []);

  // Clear entire cart
  const clearCart = useCallback(async () => {
    if (!cart) return;

    try {
      // Remove all items one by one
      for (const item of cart.items) {
        await fetch(`/api/cart?itemId=${item.id}`, { method: "DELETE" });
      }
      await fetchCart();
      toast.success("Cart cleared");
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error("Failed to clear cart");
    }
  }, [cart, fetchCart]);

  // Reset cart state immediately (used after checkout)
  const resetCart = useCallback(() => {
    setCart((prevCart) => prevCart ? { ...prevCart, items: [], subtotal: 0, totalItems: 0 } : null);
    setIsCartOpen(false);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart,
        resetCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
