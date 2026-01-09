"use client";

import Link from "next/link";
import { ArrowLeft, Download, Package, MapPin, CreditCard, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface OrderDetailContentProps {
  orderId: string;
}

export default function OrderDetailContent({ orderId }: OrderDetailContentProps) {
  const orderDetails = {
    id: orderId || "SCB12345",
    date: "2025-11-10",
    status: "delivered",
    deliveredDate: "2025-11-14",
    items: [
      {
        name: "ASUS ROG Strix GeForce RTX 4090 24GB",
        brand: "ASUS",
        price: 159999,
        quantity: 1,
        image: "gpu1"
      },
      {
        name: "AMD Ryzen 9 7950X Desktop Processor",
        brand: "AMD",
        price: 54999,
        quantity: 1,
        image: "cpu1"
      }
    ],
    shipping: {
      name: "John Doe",
      address: "123 Main Street, Apartment 4B",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      phone: "+91 98765 43210"
    },
    payment: {
      method: "Credit Card",
      last4: "4242"
    },
    subtotal: 214998,
    shipping_cost: 0,
    tax: 38700,
    total: 253698
  };

  const timeline = [
    { status: "Ordered", date: "Nov 10, 2025 10:30 AM", completed: true },
    { status: "Confirmed", date: "Nov 10, 2025 11:00 AM", completed: true },
    { status: "Packed", date: "Nov 11, 2025 02:15 PM", completed: true },
    { status: "Shipped", date: "Nov 12, 2025 09:00 AM", completed: true },
    { status: "Out for Delivery", date: "Nov 14, 2025 08:30 AM", completed: true },
    { status: "Delivered", date: "Nov 14, 2025 04:45 PM", completed: true }
  ];

  return (
    <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Breadcrumb */}
      <div className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/orders" className="hover:text-primary transition-colors">Orders</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">#{orderDetails.id}</span>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Link href="/orders">
          <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </Link>
        <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Order #{orderDetails.id}
        </h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Order Timeline */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 p-4 sm:p-6 rounded-xl">
            <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Order Status Timeline
            </h2>
            <div className="relative">
              {timeline.map((step, index) => (
                <div key={index} className="flex gap-3 sm:gap-4 pb-6 sm:pb-8 last:pb-0">
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${
                        step.completed
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step.completed ? <Check className="h-4 w-4 sm:h-5 sm:w-5" /> : <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-current" />}
                    </div>
                    {index < timeline.length - 1 && (
                      <div
                        className={`w-0.5 h-full absolute top-8 sm:top-10 transition-colors duration-300 ${
                          step.completed ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 pt-0.5 sm:pt-1">
                    <h3 className={`font-semibold text-sm sm:text-base mb-0.5 sm:mb-1 ${step.completed ? "text-foreground" : "text-muted-foreground"}`}>
                      {step.status}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{step.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Products */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 p-4 sm:p-6 rounded-xl">
            <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Order Items</h2>
            <div className="space-y-3 sm:space-y-4">
              {orderDetails.items.map((item, index) => (
                <div key={index} className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-card/50 backdrop-blur-xl border border-border/50 rounded-lg">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-muted/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] sm:text-xs text-muted-foreground">{item.brand}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">{item.brand}</p>
                    <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2 line-clamp-2">{item.name}</h3>
                    <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                      <span className="text-base sm:text-lg font-bold text-primary">&#8377;{item.price.toLocaleString("en-IN")}</span>
                      <span className="text-xs sm:text-sm text-muted-foreground">Qty: {item.quantity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Shipping Address
            </h2>
            <div className="text-sm">
              <p className="font-semibold mb-2">{orderDetails.shipping.name}</p>
              <p className="text-muted-foreground">{orderDetails.shipping.address}</p>
              <p className="text-muted-foreground">
                {orderDetails.shipping.city}, {orderDetails.shipping.state} {orderDetails.shipping.pincode}
              </p>
              <p className="text-muted-foreground mt-2">Phone: {orderDetails.shipping.phone}</p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Method
            </h2>
            <p className="text-sm text-muted-foreground">
              {orderDetails.payment.method} ending in {orderDetails.payment.last4}
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 p-4 sm:p-6 rounded-xl lg:sticky lg:top-24 space-y-4 sm:space-y-6">
            <h2 className="text-lg sm:text-xl font-bold">Order Summary</h2>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal ({orderDetails.items.length} items)</span>
                <span className="font-semibold">&#8377;{orderDetails.subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-semibold text-primary">
                  {orderDetails.shipping_cost === 0 ? "FREE" : `₹${orderDetails.shipping_cost}`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (GST 18%)</span>
                <span className="font-semibold">&#8377;{orderDetails.tax.toLocaleString("en-IN")}</span>
              </div>

              <Separator />

              <div className="flex justify-between text-lg">
                <span className="font-bold">Total Paid</span>
                <span className="font-bold text-primary text-2xl">
                  &#8377;{orderDetails.total.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Button variant="outline" className="w-full gap-2">
                <Download className="h-4 w-4" />
                Download Invoice
              </Button>
              <Link href={`/order-tracking/${orderId}`}>
                <Button variant="outline" className="w-full gap-2">
                  <Package className="h-4 w-4" />
                  Track Order
                </Button>
              </Link>
              <Button className="w-full">
                Reorder Items
              </Button>
            </div>

            <div className="pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Need help? Contact our support team
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
