"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Plus,
  Search,
  Ticket,
  Percent,
  Users,
  Calendar,
  Loader2,
  X,
  Upload,
  IndianRupee,
  Package,
  Monitor,
  Check,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  name: string;
  image: string | null;
  price: number;
}

const DISCOUNT_TYPES = [
  { value: "percentage", label: "Percentage (%)" },
  { value: "fixed", label: "Fixed Amount (Rs.)" },
];

const APPLY_ON_OPTIONS = [
  { value: "BOTH", label: "Both Products & Prebuilt PCs" },
  { value: "PRODUCT", label: "Products Only" },
  { value: "PREBUILT_PC", label: "Prebuilt PCs Only" },
];

export default function EditCouponPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    title: "",
    description: "",
    image: "",
    discountType: "percentage",
    discountValue: "",
    minOrderAmount: "",
    maxDiscount: "",
    usageLimit: "",
    usageCount: 0,
    perUserLimit: "1",
    applyOn: "BOTH",
    applyToAll: true,
    startDate: "",
    endDate: "",
    isActive: true,
    productIds: [] as string[],
    prebuiltPCIds: [] as string[],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Product search states
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [productSearchResults, setProductSearchResults] = useState<SearchResult[]>([]);
  const [prebuiltSearchQuery, setPrebuiltSearchQuery] = useState("");
  const [prebuiltSearchResults, setPrebuiltSearchResults] = useState<SearchResult[]>([]);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);
  const [isSearchingPrebuilts, setIsSearchingPrebuilts] = useState(false);

  // Selected items for display
  const [selectedProducts, setSelectedProducts] = useState<SearchResult[]>([]);
  const [selectedPrebuilts, setSelectedPrebuilts] = useState<SearchResult[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch coupon data
  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        const res = await fetch(`/api/admin/coupons/${id}`);
        const data = await res.json();

        if (res.ok) {
          const c = data.coupon;
          setFormData({
            code: c.code,
            name: c.name,
            title: c.title || "",
            description: c.description || "",
            image: c.image || "",
            discountType: c.discountType,
            discountValue: c.discountValue.toString(),
            minOrderAmount: c.minOrderAmount?.toString() || "",
            maxDiscount: c.maxDiscount?.toString() || "",
            usageLimit: c.usageLimit?.toString() || "",
            usageCount: c.usageCount,
            perUserLimit: c.perUserLimit.toString(),
            applyOn: c.applyOn,
            applyToAll: c.applyToAll,
            startDate: c.startDate ? c.startDate.split("T")[0] : "",
            endDate: c.endDate ? c.endDate.split("T")[0] : "",
            isActive: c.isActive,
            productIds: c.products.map((p: any) => p.id),
            prebuiltPCIds: c.prebuiltPCs.map((p: any) => p.id),
          });
          setSelectedProducts(c.products);
          setSelectedPrebuilts(c.prebuiltPCs);
        } else {
          toast.error("Failed to load coupon");
          router.push("/admin/coupons");
        }
      } catch (error) {
        toast.error("Failed to load coupon");
        router.push("/admin/coupons");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoupon();
  }, [id, router]);

  // Debounced search for products
  useEffect(() => {
    if (!productSearchQuery.trim() || productSearchQuery.length < 2) {
      setProductSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingProducts(true);
      try {
        const res = await fetch(`/api/admin/products/search?q=${encodeURIComponent(productSearchQuery)}&limit=10`);
        const data = await res.json();
        if (res.ok) {
          setProductSearchResults(data.products.map((p: any) => ({
            id: p.id,
            name: p.name,
            image: p.images?.[0]?.url || null,
            price: Number(p.price),
          })));
        }
      } catch (error) {
        console.error("Error searching products:", error);
      } finally {
        setIsSearchingProducts(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [productSearchQuery]);

  // Debounced search for prebuilt PCs
  useEffect(() => {
    if (!prebuiltSearchQuery.trim() || prebuiltSearchQuery.length < 2) {
      setPrebuiltSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingPrebuilts(true);
      try {
        const res = await fetch(`/api/admin/prebuilt-pcs?search=${encodeURIComponent(prebuiltSearchQuery)}&limit=10`);
        const data = await res.json();
        if (res.ok) {
          setPrebuiltSearchResults((data.prebuiltPCs || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            image: p.primaryImage || null,
            price: Number(p.sellingPrice),
          })));
        }
      } catch (error) {
        console.error("Error searching prebuilt PCs:", error);
      } finally {
        setIsSearchingPrebuilts(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [prebuiltSearchQuery]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("folder", "coupons");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formDataUpload,
      });

      const data = await res.json();

      if (res.ok) {
        setFormData((prev) => ({ ...prev, image: data.url }));
        toast.success("Image uploaded successfully");
      } else {
        toast.error(data.error || "Failed to upload image");
      }
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.code || !formData.name || !formData.discountValue) {
      toast.error("Code, name, and discount value are required");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          discountValue: parseFloat(formData.discountValue),
          minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : null,
          maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
          usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
          perUserLimit: parseInt(formData.perUserLimit) || 1,
          productIds: formData.productIds,
          prebuiltPCIds: formData.prebuiltPCIds,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Coupon updated successfully");
        router.push("/admin/coupons");
      } else {
        toast.error(data.error || "Failed to update coupon");
      }
    } catch (error) {
      toast.error("Failed to update coupon");
    } finally {
      setIsSaving(false);
    }
  };

  const addProduct = (product: SearchResult) => {
    if (!formData.productIds.includes(product.id)) {
      setFormData((prev) => ({
        ...prev,
        productIds: [...prev.productIds, product.id],
      }));
      setSelectedProducts((prev) => [...prev, product]);
    }
    setProductSearchQuery("");
    setProductSearchResults([]);
  };

  const removeProduct = (productId: string) => {
    setFormData((prev) => ({
      ...prev,
      productIds: prev.productIds.filter((id) => id !== productId),
    }));
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const addPrebuilt = (prebuilt: SearchResult) => {
    if (!formData.prebuiltPCIds.includes(prebuilt.id)) {
      setFormData((prev) => ({
        ...prev,
        prebuiltPCIds: [...prev.prebuiltPCIds, prebuilt.id],
      }));
      setSelectedPrebuilts((prev) => [...prev, prebuilt]);
    }
    setPrebuiltSearchQuery("");
    setPrebuiltSearchResults([]);
  };

  const removePrebuilt = (prebuiltId: string) => {
    setFormData((prev) => ({
      ...prev,
      prebuiltPCIds: prev.prebuiltPCIds.filter((id) => id !== prebuiltId),
    }));
    setSelectedPrebuilts((prev) => prev.filter((p) => p.id !== prebuiltId));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Coupon"
        subtitle={`Editing coupon: ${formData.code}`}
        actions={
          <div className="flex items-center gap-3">
            <Link href="/admin/coupons">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Update Coupon
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Ticket className="w-5 h-5" />
              Basic Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Coupon Code *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., SAVE20"
                  className="font-mono uppercase"
                />
                <p className="text-xs text-muted-foreground">Unique code customers will enter</p>
              </div>
              <div className="space-y-2">
                <Label>Coupon Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., New Year Sale"
                />
                <p className="text-xs text-muted-foreground">Internal reference name</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Display Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Get 20% Off on All Products!"
              />
              <p className="text-xs text-muted-foreground">Title shown to customers</p>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the coupon offer..."
                rows={3}
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Coupon Banner Image</Label>
              <div className="flex items-start gap-4">
                {formData.image ? (
                  <div className="relative w-60 h-32 rounded-lg overflow-hidden bg-muted border border-border">
                    <Image
                      src={formData.image}
                      alt="Coupon banner"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: "" })}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full hover:bg-black/70"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-60 h-32 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer transition-colors bg-muted/30"
                  >
                    {isUploading ? (
                      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">Click to upload</span>
                        <span className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</span>
                      </>
                    )}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Discount Settings */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Percent className="w-5 h-5" />
              Discount Settings
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount Type *</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(v) => setFormData({ ...formData, discountType: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DISCOUNT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Discount Value *</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    placeholder={formData.discountType === "percentage" ? "e.g., 20" : "e.g., 500"}
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                    {formData.discountType === "percentage" ? "%" : "Rs."}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Minimum Order Amount</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    placeholder="e.g., 5000"
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Minimum cart value to apply coupon</p>
              </div>
              <div className="space-y-2">
                <Label>Maximum Discount {formData.discountType === "percentage" ? "(Cap)" : ""}</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    placeholder="e.g., 2000"
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Max discount cap (never exceeds product price)
                </p>
              </div>
            </div>
          </div>

          {/* Apply On Settings */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Package className="w-5 h-5" />
              Apply On
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Applicable On</Label>
                <Select
                  value={formData.applyOn}
                  onValueChange={(v) => setFormData({ ...formData, applyOn: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APPLY_ON_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Scope</Label>
                <div className="flex items-center justify-between h-10 px-3 rounded-md border border-input bg-background">
                  <span className="text-sm">Apply to All Items</span>
                  <Switch
                    checked={formData.applyToAll}
                    onCheckedChange={(checked) => setFormData({ ...formData, applyToAll: checked })}
                  />
                </div>
              </div>
            </div>

            {/* Specific Products/Prebuilts Selection */}
            {!formData.applyToAll && (
              <Tabs defaultValue="products" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="products" className="gap-2">
                    <Package className="w-4 h-4" />
                    Products ({selectedProducts.length})
                  </TabsTrigger>
                  <TabsTrigger value="prebuilts" className="gap-2">
                    <Monitor className="w-4 h-4" />
                    Prebuilt PCs ({selectedPrebuilts.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="products" className="space-y-3 mt-4">
                  {(formData.applyOn === "PRODUCT" || formData.applyOn === "BOTH") ? (
                    <>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          value={productSearchQuery}
                          onChange={(e) => setProductSearchQuery(e.target.value)}
                          placeholder="Search products to add..."
                          className="pl-9"
                        />
                        {isSearchingProducts && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin" />
                        )}
                      </div>

                      {productSearchResults.length > 0 && (
                        <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                          {productSearchResults.map((product) => (
                            <div
                              key={product.id}
                              onClick={() => addProduct(product)}
                              className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer"
                            >
                              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                                {product.image ? (
                                  <Image src={product.image} alt={product.name} width={48} height={48} className="object-cover" />
                                ) : (
                                  <Package className="w-6 h-6 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{product.name}</p>
                                <p className="text-sm text-muted-foreground">Rs.{product.price.toLocaleString("en-IN")}</p>
                              </div>
                              {formData.productIds.includes(product.id) ? (
                                <Check className="w-5 h-5 text-emerald-500" />
                              ) : (
                                <Plus className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {selectedProducts.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm">Selected Products ({selectedProducts.length})</Label>
                          <div className="flex flex-wrap gap-2">
                            {selectedProducts.map((product) => (
                              <Badge key={product.id} variant="secondary" className="gap-1 py-1.5 px-3">
                                {product.name}
                                <button
                                  type="button"
                                  onClick={() => removeProduct(product.id)}
                                  className="ml-1 hover:text-destructive"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedProducts.length === 0 && productSearchResults.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                          <p>Search and select products to apply this coupon</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>This coupon applies to Prebuilt PCs only</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="prebuilts" className="space-y-3 mt-4">
                  {(formData.applyOn === "PREBUILT_PC" || formData.applyOn === "BOTH") ? (
                    <>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          value={prebuiltSearchQuery}
                          onChange={(e) => setPrebuiltSearchQuery(e.target.value)}
                          placeholder="Search prebuilt PCs to add..."
                          className="pl-9"
                        />
                        {isSearchingPrebuilts && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin" />
                        )}
                      </div>

                      {prebuiltSearchResults.length > 0 && (
                        <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                          {prebuiltSearchResults.map((prebuilt) => (
                            <div
                              key={prebuilt.id}
                              onClick={() => addPrebuilt(prebuilt)}
                              className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer"
                            >
                              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                                {prebuilt.image ? (
                                  <Image src={prebuilt.image} alt={prebuilt.name} width={48} height={48} className="object-cover" />
                                ) : (
                                  <Monitor className="w-6 h-6 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{prebuilt.name}</p>
                                <p className="text-sm text-muted-foreground">Rs.{prebuilt.price.toLocaleString("en-IN")}</p>
                              </div>
                              {formData.prebuiltPCIds.includes(prebuilt.id) ? (
                                <Check className="w-5 h-5 text-emerald-500" />
                              ) : (
                                <Plus className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {selectedPrebuilts.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm">Selected Prebuilt PCs ({selectedPrebuilts.length})</Label>
                          <div className="flex flex-wrap gap-2">
                            {selectedPrebuilts.map((prebuilt) => (
                              <Badge key={prebuilt.id} variant="secondary" className="gap-1 py-1.5 px-3">
                                {prebuilt.name}
                                <button
                                  type="button"
                                  onClick={() => removePrebuilt(prebuilt.id)}
                                  className="ml-1 hover:text-destructive"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedPrebuilts.length === 0 && prebuiltSearchResults.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Monitor className="w-10 h-10 mx-auto mb-2 opacity-50" />
                          <p>Search and select prebuilt PCs to apply this coupon</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>This coupon applies to Products only</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Usage Stats */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold">Usage Stats</h3>
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-3xl font-bold text-primary">{formData.usageCount}</p>
              <p className="text-sm text-muted-foreground">Times Used</p>
            </div>
          </div>

          {/* Usage Limits */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Usage Limits
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Total Usage Limit</Label>
                <Input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  placeholder="Unlimited if empty"
                />
                <p className="text-xs text-muted-foreground">How many times this coupon can be used in total</p>
              </div>
              <div className="space-y-2">
                <Label>Per User Limit</Label>
                <Input
                  type="number"
                  value={formData.perUserLimit}
                  onChange={(e) => setFormData({ ...formData, perUserLimit: e.target.value })}
                  placeholder="1"
                />
                <p className="text-xs text-muted-foreground">How many times a single user can use this coupon</p>
              </div>
            </div>
          </div>

          {/* Validity Period */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Validity Period
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
              <p className="text-xs text-muted-foreground">Leave empty for no time restriction</p>
            </div>
          </div>

          {/* Status */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold">Status</h3>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">Active</p>
                <p className="text-xs text-muted-foreground">Coupon can be used by customers</p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>

          {/* Preview */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold">Preview</h3>

            <div className="p-4 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Ticket className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-mono font-bold text-lg text-primary">
                    {formData.code || "CODE"}
                  </p>
                  <p className="text-sm text-muted-foreground">{formData.name || "Coupon Name"}</p>
                </div>
              </div>
              {formData.discountValue && (
                <div className="text-2xl font-bold text-emerald-500">
                  {formData.discountType === "percentage" ? `${formData.discountValue}% OFF` : `Rs.${formData.discountValue} OFF`}
                </div>
              )}
              {formData.minOrderAmount && (
                <p className="text-sm text-muted-foreground mt-1">
                  Min order: Rs.{parseInt(formData.minOrderAmount).toLocaleString("en-IN")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border z-50 lg:left-[280px]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/admin/coupons">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </Link>
          <Button onClick={handleSubmit} disabled={isSaving} size="lg">
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Update Coupon
          </Button>
        </div>
      </div>

      {/* Spacer for bottom bar */}
      <div className="h-20" />
    </div>
  );
}
