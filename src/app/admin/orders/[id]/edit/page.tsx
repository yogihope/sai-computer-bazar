"use client";

import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function OrderEditPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;

  const handleSave = () => {
    toast({
      title: "Order Updated",
      description: "Your changes have been saved successfully.",
    });
    router.push(`/admin/orders/${orderId}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit Order ${orderId}`}
        subtitle="Update order information and status"
        backUrl={`/admin/orders/${orderId}`}
        actions={
          <Button className="gap-2" onClick={handleSave}>
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Order Status</h2>
          <div className="space-y-4">
            <div>
              <Label>Order Status</Label>
              <Select defaultValue="shipped">
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="building">Building</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payment Status</Label>
              <Select defaultValue="paid">
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tracking">Tracking Number</Label>
              <Input id="tracking" defaultValue="SHIP123456789" className="mt-1.5 font-mono" />
            </div>
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="address">Street Address</Label>
              <Input id="address" defaultValue="123 Tech Street, Electronic City" className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" defaultValue="Bangalore" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input id="state" defaultValue="Karnataka" className="mt-1.5" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input id="pincode" defaultValue="560100" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input id="country" defaultValue="India" className="mt-1.5" />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Order Notes</h2>
          <Textarea placeholder="Add internal notes about this order..." className="h-32" />
        </div>
      </div>
    </div>
  );
}
