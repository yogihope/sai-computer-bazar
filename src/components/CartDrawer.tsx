"use client";

import { useCart } from "@/contexts/CartContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

export default function CartDrawer() {
  const { cart, isLoading, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart } = useCart();

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart
            {cart && cart.totalItems > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({cart.totalItems} items)
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add some items to get started
              </p>
            </div>
            <Button onClick={() => setIsCartOpen(false)} asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b">
                  {/* Item Image */}
                  <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder-product.png";
                      }}
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={item.type === "product" ? `/product/${item.slug}` : `/prebuilt-pcs/${item.slug}`}
                      className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors"
                      onClick={() => setIsCartOpen(false)}
                    >
                      {item.name}
                    </Link>
                    {item.variationName && (
                      <p className="text-xs text-muted-foreground mt-1">{item.variationName}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-semibold text-primary">
                        ₹{formatPrice(item.price)}
                      </span>
                      {item.compareAtPrice && item.compareAtPrice > item.price && (
                        <span className="text-xs text-muted-foreground line-through">
                          ₹{formatPrice(item.compareAtPrice)}
                        </span>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            if (item.quantity > 1) {
                              updateQuantity(item.id, item.quantity - 1);
                            }
                          }}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stockQuantity}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {!item.isInStock && (
                      <p className="text-xs text-destructive mt-1">Out of stock</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Footer */}
            <div className="border-t pt-4 space-y-4">
              {/* Free Shipping Banner */}
              {cart.subtotal < 10000 && (
                <div className="bg-primary/10 rounded-lg p-3 text-center">
                  <p className="text-sm">
                    Add <span className="font-semibold">₹{formatPrice(10000 - cart.subtotal)}</span> more for{" "}
                    <span className="font-semibold text-primary">FREE Shipping!</span>
                  </p>
                </div>
              )}

              {/* Subtotal */}
              <div className="flex items-center justify-between">
                <span className="font-medium">Subtotal</span>
                <span className="text-xl font-bold">₹{formatPrice(cart.subtotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Shipping and taxes calculated at checkout
              </p>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button className="w-full" size="lg" asChild>
                  <Link href="/checkout" onClick={() => setIsCartOpen(false)}>
                    Proceed to Checkout
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsCartOpen(false)}
                  asChild
                >
                  <Link href="/cart">View Cart</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
