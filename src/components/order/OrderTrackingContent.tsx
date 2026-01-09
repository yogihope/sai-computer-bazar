"use client";

import Link from "next/link";
import { ArrowLeft, Package, MapPin, Phone, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface OrderTrackingContentProps {
  trackingId: string;
}

export default function OrderTrackingContent({ trackingId }: OrderTrackingContentProps) {
  const trackingInfo = {
    orderId: trackingId || "SCB12345",
    status: "Out for Delivery",
    eta: "Today, 6:00 PM - 8:00 PM",
    currentLocation: "Mumbai Central Hub",
    trackingSteps: [
      { title: "Order Placed", date: "Nov 10, 10:30 AM", location: "Mumbai", completed: true },
      { title: "Order Confirmed", date: "Nov 10, 11:00 AM", location: "Mumbai", completed: true },
      { title: "Packed", date: "Nov 11, 02:15 PM", location: "Warehouse - Andheri", completed: true },
      { title: "Shipped", date: "Nov 12, 09:00 AM", location: "In Transit", completed: true },
      { title: "Out for Delivery", date: "Nov 14, 08:30 AM", location: "Mumbai Central Hub", completed: true },
      { title: "Delivered", date: "Arriving Today", location: "Your Doorstep", completed: false }
    ],
    deliveryAgent: {
      name: "Rajesh Kumar",
      phone: "+91 98765 12345",
      vehicle: "Bike - MH02AB1234"
    }
  };

  return (
    <main className="flex-1 container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/orders" className="hover:text-primary transition-colors">Orders</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Track Order</span>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <Link href="/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Track Your Order
        </h1>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Status Card */}
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 p-8 rounded-xl text-center">
          <div className="w-24 h-24 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse" />
            <div className="absolute inset-2 bg-primary/40 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
            <div className="absolute inset-4 bg-card/50 backdrop-blur-xl border border-border/50 rounded-full flex items-center justify-center">
              <Package className="h-10 w-10 text-primary" />
            </div>
          </div>

          <Badge className="mb-4 text-base px-4 py-2">
            {trackingInfo.status}
          </Badge>

          <h2 className="text-2xl font-bold mb-2">Order #{trackingInfo.orderId}</h2>
          <p className="text-muted-foreground mb-6">Current Location: {trackingInfo.currentLocation}</p>

          <div className="inline-flex items-center gap-2 bg-card/50 backdrop-blur-xl border border-border/50 px-6 py-3 rounded-full">
            <Clock className="h-5 w-5 text-primary" />
            <span className="font-semibold">ETA: {trackingInfo.eta}</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 p-8 rounded-xl">
          <h2 className="text-xl font-bold mb-6">Tracking Timeline</h2>
          <div className="relative">
            {trackingInfo.trackingSteps.map((step, index) => (
              <div key={index} className="flex gap-6 pb-8 last:pb-0">
                <div className="relative flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${
                      step.completed
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.completed ? (
                      <Package className="h-6 w-6" />
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-current" />
                    )}
                  </div>
                  {index < trackingInfo.trackingSteps.length - 1 && (
                    <div
                      className={`w-1 h-full absolute top-12 transition-colors duration-300 ${
                        step.completed ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
                <div className="flex-1 pt-2">
                  <h3 className={`font-bold text-lg mb-1 ${step.completed ? "text-foreground" : "text-muted-foreground"}`}>
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-1">{step.date}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{step.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Agent Card */}
        {trackingInfo.status === "Out for Delivery" && (
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-4">Delivery Agent Information</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-lg mb-1">{trackingInfo.deliveryAgent.name}</p>
                <p className="text-sm text-muted-foreground mb-2">{trackingInfo.deliveryAgent.vehicle}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{trackingInfo.deliveryAgent.phone}</span>
                </div>
              </div>
              <Button variant="outline" className="gap-2">
                <Phone className="h-4 w-4" />
                Call Agent
              </Button>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-4">Need Help?</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Button variant="outline" className="gap-2 h-auto py-4">
              <Phone className="h-5 w-5" />
              <div className="text-left">
                <p className="font-semibold">Call Support</p>
                <p className="text-xs text-muted-foreground">+91-XXXXXXXXXX</p>
              </div>
            </Button>
            <Button variant="outline" className="gap-2 h-auto py-4">
              <Mail className="h-5 w-5" />
              <div className="text-left">
                <p className="font-semibold">Email Support</p>
                <p className="text-xs text-muted-foreground">support@scbazar.in</p>
              </div>
            </Button>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 p-8 rounded-xl">
          <h2 className="text-xl font-bold mb-4">Live Tracking Map</h2>
          <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Map tracking coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
