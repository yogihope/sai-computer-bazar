"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Edit,
  FileText,
  Truck,
  Package,
  User,
  MapPin,
  CreditCard,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCcw,
  ExternalLink,
  Phone,
  Mail,
  Copy,
  Save,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  name: string;
  sku: string | null;
  image: string | null;
  price: number;
  quantity: number;
  total: number;
  variationName: string | null;
  productId: string | null;
  prebuiltPCId: string | null;
  productSlug: string | null;
  prebuiltPCSlug: string | null;
}

interface TimelineEntry {
  id: string;
  status: string;
  title: string;
  description: string | null;
  location: string | null;
  createdAt: string;
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  customer: {
    id: string | null;
    name: string;
    email: string | null;
    phone: string | null;
  };
  shippingAddress: {
    name: string;
    phone: string;
    address1: string;
    address2: string | null;
    landmark: string | null;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  billingAddress: {
    name: string;
    phone: string | null;
    address1: string | null;
    address2: string | null;
    city: string | null;
    state: string | null;
    pincode: string | null;
    country: string | null;
  } | null;
  items: OrderItem[];
  pricing: {
    subtotal: number;
    discount: number;
    couponCode: string | null;
    couponDiscount: number;
    shippingCharge: number;
    tax: number;
    total: number;
  };
  payment: {
    method: string;
    status: string;
    razorpayOrderId: string | null;
    razorpayPaymentId: string | null;
    paidAt: string | null;
  };
  shipping: {
    shiprocketOrderId: string | null;
    shiprocketShipmentId: string | null;
    awbNumber: string | null;
    courierName: string | null;
    trackingUrl: string | null;
    shippedAt: string | null;
    deliveredAt: string | null;
  };
  timeline: TimelineEntry[];
  notes: {
    customer: string | null;
    admin: string | null;
  };
  dates: {
    created: string;
    updated: string;
    paid: string | null;
    shipped: string | null;
    delivered: string | null;
    cancelled: string | null;
  };
}

const getStatusBadge = (status: string) => {
  const config: Record<string, { style: string; icon: any }> = {
    PENDING: { style: "bg-gray-500/20 text-gray-500 border-gray-500/30", icon: Clock },
    CONFIRMED: { style: "bg-blue-500/20 text-blue-500 border-blue-500/30", icon: CheckCircle2 },
    PROCESSING: { style: "bg-violet-500/20 text-violet-500 border-violet-500/30", icon: Package },
    SHIPPED: { style: "bg-cyan-500/20 text-cyan-500 border-cyan-500/30", icon: Truck },
    OUT_FOR_DELIVERY: { style: "bg-indigo-500/20 text-indigo-500 border-indigo-500/30", icon: Truck },
    DELIVERED: { style: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30", icon: CheckCircle2 },
    CANCELLED: { style: "bg-red-500/20 text-red-500 border-red-500/30", icon: XCircle },
    RETURNED: { style: "bg-orange-500/20 text-orange-500 border-orange-500/30", icon: RefreshCcw },
    REFUNDED: { style: "bg-purple-500/20 text-purple-500 border-purple-500/30", icon: RefreshCcw },
  };
  return config[status] || config.PENDING;
};

const getPaymentBadge = (status: string) => {
  const styles: Record<string, string> = {
    PAID: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
    PENDING: "bg-amber-500/20 text-amber-500 border-amber-500/30",
    FAILED: "bg-red-500/20 text-red-500 border-red-500/30",
    REFUNDED: "bg-purple-500/20 text-purple-500 border-purple-500/30",
    COD_PENDING: "bg-orange-500/20 text-orange-500 border-orange-500/30",
  };
  return styles[status] || styles.PENDING;
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [awbNumber, setAwbNumber] = useState("");
  const [courierName, setCourierName] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      const data = await res.json();

      if (res.ok) {
        setOrder(data.order);
        setNewStatus(data.order.status);
        setAwbNumber(data.order.shipping.awbNumber || "");
        setCourierName(data.order.shipping.courierName || "");
        setAdminNotes(data.order.notes.admin || "");
      } else {
        toast.error(data.error || "Failed to fetch order");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Failed to fetch order");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateOrder = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus !== order?.status ? newStatus : undefined,
          awbNumber,
          courierName,
          adminNotes,
        }),
      });

      if (res.ok) {
        toast.success("Order updated successfully");
        fetchOrder();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update order");
      }
    } catch (error) {
      toast.error("Failed to update order");
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Order Not Found</h3>
        <p className="text-muted-foreground mb-4">The order you're looking for doesn't exist.</p>
        <Button onClick={() => router.push("/admin/orders")}>Back to Orders</Button>
      </div>
    );
  }

  const statusConfig = getStatusBadge(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Order ${order.orderNumber}`}
        subtitle={`Placed on ${new Date(order.dates.created).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}`}
        backUrl="/admin/orders"
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <FileText className="w-4 h-4" />
              Invoice
            </Button>
            <Button onClick={handleUpdateOrder} disabled={isSaving} className="gap-2">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Items ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      {item.variationName && (
                        <p className="text-sm text-muted-foreground">{item.variationName}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">{formatPrice(item.total)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-border space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(order.pricing.subtotal)}</span>
                </div>
                {order.pricing.discount > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span>Discount {order.pricing.couponCode && `(${order.pricing.couponCode})`}</span>
                    <span>-{formatPrice(order.pricing.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{order.pricing.shippingCharge === 0 ? "Free" : formatPrice(order.pricing.shippingCharge)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (GST)</span>
                  <span>{formatPrice(order.pricing.tax)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(order.pricing.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.timeline.length > 0 ? (
                <div className="space-y-4">
                  {order.timeline.map((entry, i) => {
                    const entryConfig = getStatusBadge(entry.status);
                    return (
                      <div key={entry.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${entryConfig.style.includes("emerald") ? "bg-emerald-500" : entryConfig.style.includes("cyan") ? "bg-cyan-500" : entryConfig.style.includes("violet") ? "bg-violet-500" : entryConfig.style.includes("blue") ? "bg-blue-500" : entryConfig.style.includes("red") ? "bg-red-500" : "bg-gray-500"}`}></div>
                          {i < order.timeline.length - 1 && (
                            <div className="w-0.5 h-full bg-border flex-1 my-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium">{entry.title}</p>
                          {entry.description && (
                            <p className="text-sm text-muted-foreground">{entry.description}</p>
                          )}
                          {entry.location && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {entry.location}
                            </p>
                          )}
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
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No timeline entries yet</p>
              )}
            </CardContent>
          </Card>

          {/* Admin Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add internal notes about this order..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Current Status</span>
                <Badge className={`${statusConfig.style} border flex items-center gap-1`}>
                  <StatusIcon className="h-3 w-3" />
                  {order.status.replace("_", " ")}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Payment</span>
                <Badge className={`${getPaymentBadge(order.paymentStatus)} border`}>
                  {order.paymentStatus.replace("_", " ")}
                </Badge>
              </div>

              <div className="pt-4 border-t border-border">
                <label className="text-sm font-medium mb-2 block">Update Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="PROCESSING">Processing</SelectItem>
                    <SelectItem value="SHIPPED">Shipped</SelectItem>
                    <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="RETURNED">Returned</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Shipping Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Courier Name</label>
                <Input
                  placeholder="e.g., BlueDart, Delhivery"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">AWB / Tracking Number</label>
                <Input
                  placeholder="Enter tracking number"
                  value={awbNumber}
                  onChange={(e) => setAwbNumber(e.target.value)}
                />
              </div>
              {order.shipping.trackingUrl && (
                <a
                  href={order.shipping.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary text-sm hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  Track Shipment
                </a>
              )}
            </CardContent>
          </Card>

          {/* Customer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-medium">{order.customer.name}</p>
              {order.customer.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{order.customer.email}</span>
                  <button onClick={() => copyToClipboard(order.customer.email!)}>
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              )}
              {order.customer.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{order.customer.phone}</span>
                  <button onClick={() => copyToClipboard(order.customer.phone!)}>
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p className="font-medium">{order.shippingAddress.name}</p>
                <p className="text-muted-foreground">{order.shippingAddress.address1}</p>
                {order.shippingAddress.address2 && (
                  <p className="text-muted-foreground">{order.shippingAddress.address2}</p>
                )}
                {order.shippingAddress.landmark && (
                  <p className="text-muted-foreground">Landmark: {order.shippingAddress.landmark}</p>
                )}
                <p className="text-muted-foreground">
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </p>
                <p className="text-muted-foreground">{order.shippingAddress.country}</p>
                <p className="text-muted-foreground flex items-center gap-1 mt-2">
                  <Phone className="w-3 h-3" />
                  {order.shippingAddress.phone}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span>{order.payment.method}</span>
              </div>
              {order.payment.razorpayPaymentId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono text-sm">{order.payment.razorpayPaymentId}</span>
                </div>
              )}
              {order.payment.paidAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid At</span>
                  <span className="text-sm">
                    {new Date(order.payment.paidAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Notes */}
          {order.notes.customer && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{order.notes.customer}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
