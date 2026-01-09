"use client";

import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/utils";

const CartContent = () => {
  const { cart, isLoading, updateQuantity, removeFromCart } = useCart();

  const subtotal = cart?.subtotal || 0;
  const shipping = subtotal >= 10000 ? 0 : 99;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  if (isLoading) {
    return (
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Breadcrumb */}
      <div className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Shopping Cart</span>
      </div>

      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Your Cart
      </h1>

      {!cart || cart.items.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="h-24 w-24 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add some amazing products to get started!</p>
          <Link href="/products">
            <Button size="lg" className="gap-2">
              Start Shopping <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {cart.items.map((item) => {
              const discount = item.compareAtPrice && item.compareAtPrice > item.price
                ? Math.round(((item.compareAtPrice - item.price) / item.compareAtPrice) * 100)
                : 0;
              const linkHref = item.type === "prebuiltPC"
                ? `/prebuilt-pcs/${item.slug}`
                : `/product/${item.slug}`;

              return (
                <div
                  key={item.id}
                  className="glass-panel p-4 sm:p-6 rounded-xl hover-scale transition-all duration-300 group"
                >
                  <div className="flex gap-3 sm:gap-6">
                    {/* Product Image */}
                    <Link href={linkHref} className="w-20 h-20 sm:w-32 sm:h-32 bg-muted/20 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder-product.png";
                        }}
                      />
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1 sm:mb-2">
                        <div className="min-w-0 flex-1 pr-2">
                          {item.variationName && (
                            <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">
                              {item.variationName}
                            </p>
                          )}
                          <Link href={linkHref}>
                            <h3 className="font-semibold text-sm sm:text-lg mb-1 sm:mb-2 line-clamp-2 hover:text-primary transition-colors">
                              {item.name}
                            </h3>
                          </Link>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.id)}
                          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4 flex-wrap">
                        <span className="text-lg sm:text-2xl font-bold text-primary">
                          ₹{formatPrice(item.price)}
                        </span>
                        {item.compareAtPrice && item.compareAtPrice > item.price && (
                          <>
                            <span className="text-xs sm:text-sm text-muted-foreground line-through">
                              ₹{formatPrice(item.compareAtPrice)}
                            </span>
                            <span className="text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 bg-destructive/20 text-destructive rounded">
                              {discount}% OFF
                            </span>
                          </>
                        )}
                      </div>

                      {/* Stock Status */}
                      {!item.isInStock && (
                        <p className="text-xs text-destructive mb-2">Out of stock</p>
                      )}

                      {/* Quantity Controls */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-1.5 sm:gap-2 glass-panel rounded-lg p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateQuantity(item.id, item.quantity - 1);
                              }
                            }}
                            disabled={item.quantity <= 1}
                            className="h-7 w-7 sm:h-8 sm:w-8"
                          >
                            <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <span className="w-8 sm:w-12 text-center font-semibold text-sm sm:text-base">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stockQuantity}
                            className="h-7 w-7 sm:h-8 sm:w-8"
                          >
                            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          Subtotal: <span className="font-semibold text-foreground">₹{formatPrice(item.price * item.quantity)}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="glass-panel p-4 sm:p-6 rounded-xl lg:sticky lg:top-24">
              <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({cart.totalItems} items)</span>
                  <span className="font-semibold">₹{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-semibold">
                    {shipping === 0 ? (
                      <span className="text-primary">FREE</span>
                    ) : (
                      `₹${shipping}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (GST 18%)</span>
                  <span className="font-semibold">₹{formatPrice(Math.round(tax))}</span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-primary text-2xl">
                    ₹{formatPrice(Math.round(total))}
                  </span>
                </div>
              </div>

              {shipping !== 0 && subtotal < 10000 && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-6 text-sm">
                  <p className="text-primary font-medium">
                    Add ₹{formatPrice(10000 - subtotal)} more for FREE shipping!
                  </p>
                </div>
              )}

              <Link href="/checkout">
                <Button size="lg" className="w-full gap-2 glow-teal text-lg font-semibold">
                  Proceed to Checkout
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>

              <Link href="/products">
                <Button variant="outline" size="lg" className="w-full mt-3">
                  Continue Shopping
                </Button>
              </Link>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  Secure Checkout - Free Returns - 1 Year Warranty
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default CartContent;
