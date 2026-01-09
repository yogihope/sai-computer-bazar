"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  CreditCard,
  Truck,
  Tag,
  ChevronRight,
  Loader2,
  Check,
  Plus,
  Shield,
  Banknote,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

interface Address {
  id: string;
  label: string;
  fullName: string;
  mobile: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutContent() {
  const router = useRouter();
  const { cart, isLoading: cartLoading, refreshCart, resetCart } = useCart();

  // Form states
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("RAZORPAY");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [customerNotes, setCustomerNotes] = useState("");

  // New address form
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "Home",
    fullName: "",
    mobile: "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  // Shipping
  const [shippingCharge, setShippingCharge] = useState(99);
  const [shippingLoading, setShippingLoading] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(true);
  const [couponLoading, setCouponLoading] = useState(false);

  // Fetch user addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await fetch("/api/account/addresses");
        if (res.ok) {
          const data = await res.json();
          setAddresses(data.addresses || []);
          const defaultAddress = data.addresses?.find((a: Address) => a.isDefault);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
          } else if (data.addresses?.length > 0) {
            setSelectedAddressId(data.addresses[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
      } finally {
        setAddressLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  // Calculate shipping when address changes
  useEffect(() => {
    const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
    if (selectedAddress && cart) {
      calculateShipping(selectedAddress.pincode);
    }
  }, [selectedAddressId, cart, addresses]);

  const calculateShipping = async (pincode: string) => {
    setShippingLoading(true);
    try {
      const res = await fetch("/api/checkout/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pincode,
          weight: 2,
          cod: paymentMethod === "COD",
          cartTotal: cart?.subtotal || 0,
        }),
      });
      const data = await res.json();
      if (data.shipping) {
        setShippingCharge(data.shipping.charge);
      }
    } catch (error) {
      console.error("Error calculating shipping:", error);
    } finally {
      setShippingLoading(false);
    }
  };

  // Apply coupon
  const applyCoupon = async () => {
    if (!couponCode) return;

    setCouponLoading(true);
    try {
      const res = await fetch("/api/checkout/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          cartTotal: cart?.subtotal || 0,
        }),
      });
      const data = await res.json();

      if (res.ok && data.valid) {
        setCouponDiscount(data.discount);
        setCouponApplied(true);
        toast.success(data.message);
      } else {
        toast.error(data.error || "Invalid coupon");
        setCouponDiscount(0);
        setCouponApplied(false);
      }
    } catch (error) {
      toast.error("Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  // Remove coupon
  const removeCoupon = () => {
    setCouponCode("");
    setCouponDiscount(0);
    setCouponApplied(false);
  };

  // Add new address
  const handleAddAddress = async () => {
    if (!newAddress.fullName || !newAddress.mobile || !newAddress.addressLine1 ||
        !newAddress.city || !newAddress.state || !newAddress.pincode) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const res = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddress),
      });
      const data = await res.json();

      if (res.ok && data.address) {
        setAddresses([...addresses, data.address]);
        setSelectedAddressId(data.address.id);
        setShowNewAddress(false);
        setNewAddress({
          label: "Home",
          fullName: "",
          mobile: "",
          addressLine1: "",
          addressLine2: "",
          landmark: "",
          city: "",
          state: "",
          pincode: "",
          country: "India",
        });
        toast.success("Address added successfully");
      } else {
        toast.error(data.error || "Failed to add address");
      }
    } catch (error) {
      toast.error("Failed to add address");
    }
  };

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Handle checkout
  const handleCheckout = async () => {
    if (!selectedAddressId && !showNewAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    if (!cart || cart.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setLoading(true);

    try {
      const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
      if (!selectedAddress) {
        toast.error("Please select a valid address");
        setLoading(false);
        return;
      }

      // Create checkout
      const checkoutRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.items.map((item) => ({
            productId: item.productId,
            prebuiltPCId: item.prebuiltPCId,
            variationId: item.variationId,
            variationName: item.variationName,
            quantity: item.quantity,
          })),
          shippingAddress: selectedAddress,
          paymentMethod,
          couponCode: couponApplied ? couponCode : null,
          customerNotes,
        }),
      });

      const checkoutData = await checkoutRes.json();

      if (!checkoutRes.ok) {
        toast.error(checkoutData.error || "Checkout failed");
        setLoading(false);
        return;
      }

      // Handle COD
      if (paymentMethod === "COD") {
        // Immediately clear local cart state
        resetCart();
        router.push(`/order-success?orderNumber=${checkoutData.order.orderNumber}`);
        return;
      }

      // Handle Razorpay
      if (paymentMethod === "RAZORPAY" && checkoutData.razorpay) {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          toast.error("Failed to load payment gateway");
          setLoading(false);
          return;
        }

        const options = {
          key: checkoutData.razorpay.keyId,
          amount: checkoutData.razorpay.amount,
          currency: checkoutData.razorpay.currency,
          name: "SCB - Sai Computer Bazar",
          description: `Order ${checkoutData.order.orderNumber}`,
          order_id: checkoutData.razorpay.orderId,
          handler: async function (response: any) {
            // Verify payment
            const verifyRes = await fetch("/api/checkout/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: checkoutData.order.id,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              // Immediately clear local cart state
              resetCart();
              router.push(`/order-success?orderNumber=${checkoutData.order.orderNumber}`);
            } else {
              toast.error("Payment verification failed");
              setLoading(false);
            }
          },
          prefill: {
            name: selectedAddress.fullName,
            contact: selectedAddress.mobile,
          },
          theme: {
            color: "#6366f1",
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Checkout failed. Please try again.");
      setLoading(false);
    }
  };

  // Calculations
  const subtotal = cart?.subtotal || 0;
  const tax = Math.round((subtotal - couponDiscount) * 0.18 * 100) / 100;
  const total = subtotal - couponDiscount + shippingCharge + tax;

  if (cartLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Add some items to proceed with checkout</p>
        <Button asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/cart" className="hover:text-primary">Cart</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Checkout</span>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold mb-8">Secure Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {addressLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : addresses.length > 0 ? (
                <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
                  <div className="grid gap-3">
                    {addresses.map((address) => (
                      <label
                        key={address.id}
                        className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedAddressId === address.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem value={address.id} className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{address.fullName}</span>
                            <span className="text-xs bg-muted px-2 py-0.5 rounded">
                              {address.label}
                            </span>
                            {address.isDefault && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {address.addressLine1}
                            {address.addressLine2 && `, ${address.addressLine2}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                          <p className="text-sm mt-1">Mobile: {address.mobile}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              ) : (
                <p className="text-muted-foreground">No saved addresses. Please add one below.</p>
              )}

              {!showNewAddress ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowNewAddress(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Address
                </Button>
              ) : (
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-medium">New Address</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name *</Label>
                      <Input
                        value={newAddress.fullName}
                        onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                        placeholder="John Doe"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Mobile *</Label>
                      <Input
                        value={newAddress.mobile}
                        onChange={(e) => setNewAddress({ ...newAddress, mobile: e.target.value })}
                        placeholder="9876543210"
                        className="mt-1"
                      />
                    </div>
                    <div className="col-span-full">
                      <Label>Address Line 1 *</Label>
                      <Input
                        value={newAddress.addressLine1}
                        onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                        placeholder="House/Flat No., Building Name"
                        className="mt-1"
                      />
                    </div>
                    <div className="col-span-full">
                      <Label>Address Line 2</Label>
                      <Input
                        value={newAddress.addressLine2}
                        onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                        placeholder="Street, Area"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>City *</Label>
                      <Input
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        placeholder="City"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>State *</Label>
                      <Input
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        placeholder="State"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Pincode *</Label>
                      <Input
                        value={newAddress.pincode}
                        onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                        placeholder="400001"
                        maxLength={6}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Landmark</Label>
                      <Input
                        value={newAddress.landmark}
                        onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                        placeholder="Near..."
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddAddress}>Save Address</Button>
                    <Button variant="outline" onClick={() => setShowNewAddress(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="grid gap-3">
                  <label
                    className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === "RAZORPAY"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="RAZORPAY" />
                    <div className="flex-1">
                      <span className="font-medium">Pay Online</span>
                      <p className="text-sm text-muted-foreground">
                        Credit/Debit Card, UPI, Net Banking, Wallets
                      </p>
                    </div>
                    <Shield className="h-5 w-5 text-green-600" />
                  </label>

                  <label
                    className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === "COD"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="COD" />
                    <div className="flex-1">
                      <span className="font-medium">Cash on Delivery</span>
                      <p className="text-sm text-muted-foreground">
                        Pay when you receive your order
                      </p>
                    </div>
                    <Banknote className="h-5 w-5 text-muted-foreground" />
                  </label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Order Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Order Notes (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Any special instructions for your order..."
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cart Items */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-14 h-14 rounded bg-muted overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder-product.png";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold">₹{formatPrice(item.total)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Coupon */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Apply Coupon
                </Label>
                {couponApplied ? (
                  <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-600">{couponCode}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={removeCoupon}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    />
                    <Button
                      variant="outline"
                      onClick={applyCoupon}
                      disabled={couponLoading || !couponCode}
                    >
                      {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({cart.totalItems} items)</span>
                  <span>₹{formatPrice(subtotal)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount</span>
                    <span>-₹{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Truck className="h-3 w-3" />
                    Shipping
                  </span>
                  <span>
                    {shippingLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : shippingCharge === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `₹${formatPrice(shippingCharge)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GST (18%)</span>
                  <span>₹{formatPrice(tax)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">₹{formatPrice(total)}</span>
              </div>

              {/* Free Shipping Banner */}
              {subtotal < 10000 && (
                <div className="bg-primary/10 rounded-lg p-3 text-center text-sm">
                  Add <span className="font-semibold">₹{formatPrice(10000 - subtotal)}</span> more for{" "}
                  <span className="font-semibold text-primary">FREE Shipping!</span>
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={loading || !selectedAddressId}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {paymentMethod === "COD" ? "Place Order" : "Proceed to Pay"}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By placing this order, you agree to our{" "}
                <Link href="/terms" className="underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline">
                  Privacy Policy
                </Link>
              </p>

              <div className="pt-4 border-t text-center">
                <p className="text-xs text-muted-foreground">
                  100% Secure Payment | Protected by 256-bit SSL Encryption
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
