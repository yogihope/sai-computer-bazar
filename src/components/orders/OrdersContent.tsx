"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, User, Heart, MapPin, LogOut, Eye, Download, Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPrice } from "@/lib/utils";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  paymentMethod: "RAZORPAY" | "COD";
  items: OrderItem[];
  total: number;
}

export default function OrdersContent() {
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (res.ok && data.orders) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: Order["status"]) => {
    const variants: Record<Order["status"], { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      PENDING: { variant: "outline", label: "Pending" },
      CONFIRMED: { variant: "secondary", label: "Confirmed" },
      PROCESSING: { variant: "secondary", label: "Processing" },
      SHIPPED: { variant: "default", label: "Shipped" },
      DELIVERED: { variant: "default", label: "Delivered" },
      CANCELLED: { variant: "destructive", label: "Cancelled" },
      REFUNDED: { variant: "destructive", label: "Refunded" }
    };

    const config = variants[status];
    return (
      <Badge variant={config.variant} className="font-semibold">
        {config.label}
      </Badge>
    );
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === "all") return true;
    if (activeTab === "ongoing") return ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"].includes(order.status);
    if (activeTab === "completed") return order.status === "DELIVERED";
    if (activeTab === "cancelled") return ["CANCELLED", "REFUNDED"].includes(order.status);
    return true;
  });

  return (
    <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Breadcrumb */}
      <div className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">My Orders</span>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 sm:gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 p-4 sm:p-6 rounded-xl space-y-1.5 sm:space-y-2 hidden lg:block">
            <Link href="/orders">
              <Button variant="ghost" className="w-full justify-start gap-3 bg-primary/10 text-primary">
                <Package className="h-5 w-5" />
                My Orders
              </Button>
            </Link>
            <Link href="/account">
              <Button variant="ghost" className="w-full justify-start gap-3">
                <User className="h-5 w-5" />
                Profile
              </Button>
            </Link>
            <Link href="/wishlist">
              <Button variant="ghost" className="w-full justify-start gap-3">
                <Heart className="h-5 w-5" />
                Wishlist
              </Button>
            </Link>
            <Link href="/account/addresses">
              <Button variant="ghost" className="w-full justify-start gap-3">
                <MapPin className="h-5 w-5" />
                Addresses
              </Button>
            </Link>
            <div className="pt-4 border-t border-border">
              <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10">
                <LogOut className="h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="lg:col-span-3">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            My Orders
          </h1>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4 sm:mb-6">
            <TabsList className="grid w-full grid-cols-4 h-auto">
              <TabsTrigger value="all" className="text-xs sm:text-sm py-2 sm:py-2.5">All</TabsTrigger>
              <TabsTrigger value="ongoing" className="text-xs sm:text-sm py-2 sm:py-2.5">Ongoing</TabsTrigger>
              <TabsTrigger value="completed" className="text-xs sm:text-sm py-2 sm:py-2.5">Completed</TabsTrigger>
              <TabsTrigger value="cancelled" className="text-xs sm:text-sm py-2 sm:py-2.5">Cancelled</TabsTrigger>
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="bg-card/50 backdrop-blur-xl border border-border/50 p-8 sm:p-12 rounded-xl text-center">
                  <Package className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">No orders found</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-6">
                    {activeTab === "all" ? "You haven't placed any orders yet." : "No orders match this filter."}
                  </p>
                  <Link href="/products">
                    <Button className="gap-2">
                      <ShoppingBag className="h-4 w-4" />
                      Start Shopping
                    </Button>
                  </Link>
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-card/50 backdrop-blur-xl border border-border/50 p-4 sm:p-6 rounded-xl hover:scale-[1.01] transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4">
                      <div>
                        <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2 flex-wrap">
                          <h3 className="text-base sm:text-lg font-bold">Order #{order.orderNumber}</h3>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-3 sm:mt-0">
                        <Link href={`/orders/${order.orderNumber}`}>
                          <Button variant="outline" size="sm" className="gap-1.5 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9">
                            <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            View
                          </Button>
                        </Link>
                        {order.status === "DELIVERED" && (
                          <Button variant="ghost" size="sm" className="gap-1.5 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9">
                            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Invoice</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Product Items */}
                    <div className="flex gap-2 sm:gap-4 mb-3 sm:mb-4 overflow-x-auto pb-1">
                      {order.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="w-14 h-14 sm:w-20 sm:h-20 bg-muted/20 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] sm:text-xs text-muted-foreground text-center px-1 line-clamp-2">
                              {item.name.slice(0, 15)}...
                            </span>
                          )}
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-14 h-14 sm:w-20 sm:h-20 bg-muted/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-xs sm:text-sm font-semibold">+{order.items.length - 3}</span>
                        </div>
                      )}
                    </div>

                    {/* Total */}
                    <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-border">
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} item(s)
                      </span>
                      <div className="text-right">
                        <p className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">Total Amount</p>
                        <p className="text-lg sm:text-xl font-bold text-primary">₹{formatPrice(order.total)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
