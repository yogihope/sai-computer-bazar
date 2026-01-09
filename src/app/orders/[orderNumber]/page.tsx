"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { formatPrice } from "@/lib/utils";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
  productId?: string;
  prebuiltPCId?: string;
}

interface TimelineEntry {
  id: string;
  status: string;
  message: string;
  createdAt: string;
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  tax: number;
  shippingCharge: number;
  discount: number;
  couponCode?: string;
  total: number;
  notes?: string;
  trackingNumber?: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: OrderItem[];
  timeline: TimelineEntry[];
  createdAt: string;
  updatedAt: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
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

  const handleCancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    setIsCancelling(true);
    try {
      const res = await fetch(`/api/orders/${orderNumber}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchOrderDetails();
      }
    } catch (error) {
      console.error("Failed to cancel order:", error);
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "SHIPPED":
        return <Truck className="h-5 w-5 text-blue-500" />;
      case "PROCESSING":
      case "CONFIRMED":
        return <Package className="h-5 w-5 text-yellow-500" />;
      case "CANCELLED":
      case "REFUNDED":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      PENDING: "outline",
      CONFIRMED: "secondary",
      PROCESSING: "secondary",
      SHIPPED: "default",
      DELIVERED: "default",
      CANCELLED: "destructive",
      REFUNDED: "destructive",
    };

    return (
      <Badge variant={variants[status] || "outline"} className="capitalize">
        {status.replace("_", " ")}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
          <p className="text-muted-foreground mb-6">
            We couldn't find the order you're looking for.
          </p>
          <Button asChild>
            <Link href="/orders">View All Orders</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const canCancel = ["PENDING", "CONFIRMED"].includes(order.status);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6 gap-2" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Button>

        {/* Order Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold">Order #{order.orderNumber}</h1>
              {getStatusBadge(order.status)}
            </div>
            <p className="text-muted-foreground">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          {canCancel && (
            <Button
              variant="destructive"
              onClick={handleCancelOrder}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Cancel Order
            </Button>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Order Items & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-card border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium line-clamp-2">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="font-semibold text-primary">
                        ₹{formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Timeline */}
            {order.timeline.length > 0 && (
              <div className="bg-card border rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Order Timeline
                </h2>
                <div className="space-y-4">
                  {order.timeline.map((entry, index) => (
                    <div key={entry.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        {getStatusIcon(entry.status)}
                        {index < order.timeline.length - 1 && (
                          <div className="w-0.5 h-full bg-border flex-1 my-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium capitalize">{entry.status.replace("_", " ")}</p>
                        <p className="text-sm text-muted-foreground">{entry.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(entry.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary & Address */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-card border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (GST)</span>
                  <span>₹{formatPrice(order.tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {order.shippingCharge === 0 ? "FREE" : `₹${formatPrice(order.shippingCharge)}`}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                    <span>-₹{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">₹{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-card border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span className="font-medium">
                    {order.paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge
                    variant={order.paymentStatus === "PAID" ? "default" : "outline"}
                    className="capitalize"
                  >
                    {order.paymentStatus}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-card border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </h2>
              <div className="space-y-1">
                <p className="font-medium">{order.shippingAddress.fullName}</p>
                <p className="text-muted-foreground">{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && (
                  <p className="text-muted-foreground">{order.shippingAddress.addressLine2}</p>
                )}
                <p className="text-muted-foreground">
                  {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                  {order.shippingAddress.pincode}
                </p>
                <p className="text-muted-foreground">Phone: {order.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Tracking Info */}
            {order.trackingNumber && (
              <div className="bg-card border rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Tracking
                </h2>
                <p className="text-muted-foreground">Tracking Number:</p>
                <p className="font-mono font-medium">{order.trackingNumber}</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
