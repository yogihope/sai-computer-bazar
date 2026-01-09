"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";

interface OrderDetails {
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  tax: number;
  shippingCharge: number;
  discount: number;
  total: number;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  createdAt: string;
}

export default function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (orderNumber) {
      fetchOrderDetails();
    } else {
      setIsLoading(false);
    }
  }, [orderNumber]);

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch(`/api/orders/${orderNumber}`);
      const data = await res.json();
      if (res.ok) {
        setOrder(data.order);
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <main className="flex-1 container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  // Static fallback if order not found
  const orderInfo = order ? {
    orderId: order.orderNumber,
    date: new Date(order.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }),
    total: order.total,
    paymentMethod: order.paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment",
    estimatedDelivery: "5-7 Business Days",
    items: order.items.length
  } : {
    orderId: orderNumber || "SCB12345",
    date: new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }),
    total: 0,
    paymentMethod: "Online Payment",
    estimatedDelivery: "5-7 Business Days",
    items: 0
  };

  return (
    <main className="flex-1 container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse scale-110" />
            <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse scale-125" style={{ animationDelay: '150ms' }} />
            <CheckCircle className="relative h-32 w-32 text-primary" strokeWidth={1.5} />
          </div>

          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Order Placed Successfully!
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            Thank you for shopping at SCB - Sai Computer Bazar
          </p>
          <p className="text-sm text-muted-foreground">
            Your order has been confirmed and will be shipped soon
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 p-8 rounded-xl mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Order Details</h2>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Order Number</p>
              <p className="text-lg font-bold text-primary">#{orderInfo.orderId}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order Date</span>
              <span className="font-semibold">{orderInfo.date}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Items</span>
              <span className="font-semibold">{orderInfo.items}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="font-semibold">{orderInfo.paymentMethod}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estimated Delivery</span>
              <span className="font-semibold">{orderInfo.estimatedDelivery}</span>
            </div>

            <Separator />

            <div className="flex justify-between text-lg">
              <span className="font-bold">Total Paid</span>
              <span className="font-bold text-primary text-2xl">
                ₹{formatPrice(orderInfo.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Timeline Preview */}
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 p-6 rounded-xl mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Package className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-bold">What&apos;s Next?</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <div>
                <p className="font-semibold mb-1">Order Confirmation</p>
                <p className="text-muted-foreground">You&apos;ll receive an email confirmation shortly</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-muted mt-2 flex-shrink-0" />
              <div>
                <p className="font-semibold mb-1">Order Processing</p>
                <p className="text-muted-foreground">We&apos;ll prepare your items for shipment</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-muted mt-2 flex-shrink-0" />
              <div>
                <p className="font-semibold mb-1">Shipping Updates</p>
                <p className="text-muted-foreground">Track your package in real-time</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-muted mt-2 flex-shrink-0" />
              <div>
                <p className="font-semibold mb-1">Delivery</p>
                <p className="text-muted-foreground">Your order arrives at your doorstep</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Link href="/orders">
            <Button size="lg" className="w-full gap-2">
              <Package className="h-5 w-5" />
              View All Orders
            </Button>
          </Link>
          <Link href="/products">
            <Button size="lg" variant="outline" className="w-full gap-2">
              Continue Shopping
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Additional Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/orders">
            <Button variant="ghost" size="sm" className="gap-2">
              <Package className="h-4 w-4" />
              Track Your Order
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Download Invoice
          </Button>
        </div>

        {/* Trust Message */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-card/50 backdrop-blur-xl border border-border/50 px-6 py-3 rounded-full">
            <CheckCircle className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">
              100% Secure Payment - Free Returns - 1 Year Warranty
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
