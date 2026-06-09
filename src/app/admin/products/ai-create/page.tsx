"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Send,
  X,
  Loader2,
  Sparkles,
  ImagePlus,
  Bot,
  User,
  CheckCircle2,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// ─────────────────────── Types ────────────────────────
type Message = { role: "user" | "assistant"; content: string };

type Spec = { key: string; value: string };

type ProductData = {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  sku: string;
  brand: string;
  model: string;
  price: number;
  upiPrice: number;
  creditCardPrice: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  isInStock: boolean;
  primaryCategoryId: string;
  tags: string[];
  badges: string[];
  specs: Spec[];
  warrantyTitle: string;
  warrantySubtitle: string;
  deliveryTitle: string;
  deliverySubtitle: string;
  returnsTitle: string;
  returnsSubtitle: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
};

type Category = {
  id: string;
  name: string;
  parent: { name: string } | null;
};

type ImageItem = { file: File; objectUrl: string };

// ─────────────────────── Helpers ──────────────────────
function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ─────────────────────── Page ─────────────────────────
export default function AICreateProductPage() {
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Namaste! Describe the product you want to add — brand, model, key specifications, and price in INR. I will generate a complete ready-to-publish listing for you.",
    },
  ]);
  const [input, setInput] = useState("");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch categories for the dropdown in the preview
  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // ── Send message to AI ──
  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = { role: "user", content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Error",
          description: data.error || "AI request failed",
          variant: "destructive",
        });
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Sorry, something went wrong. Please try again." },
        ]);
        return;
      }

      if (data.isProductGenerated && data.productData) {
        setProductData(data.productData as ProductData);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Done! I have generated a complete product listing on the right. Review and edit any fields, then click Accept & Create to add it to your store.",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.message },
        ]);
      }
    } catch {
      toast({
        title: "Error",
        description: "Could not reach AI service",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Image selection (client-side only, no upload yet) ──
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newItems: ImageItem[] = files.map((file) => ({
      file,
      objectUrl: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newItems]);
    e.target.value = "";
  };

  const removeImage = useCallback((index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].objectUrl);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  // ── Accept & Create ──
  const handleAccept = async () => {
    if (!productData) return;
    setIsCreating(true);

    try {
      // 1. Upload images to Cloudinary (only on accept)
      const uploadedImages: { url: string; alt: string; isPrimary: boolean; sortOrder: number }[] =
        [];

      for (let i = 0; i < images.length; i++) {
        const formData = new FormData();
        formData.append("file", images[i].file);
        formData.append("folder", "products");
        const uploadRes = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const { url } = await uploadRes.json();
          uploadedImages.push({
            url,
            alt: productData.name,
            isPrimary: i === 0,
            sortOrder: i,
          });
        } else {
          toast({
            title: "Image upload failed",
            description: `Could not upload image ${i + 1}. It will be skipped.`,
            variant: "destructive",
          });
        }
      }

      // 2. Create product via existing products API
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...productData,
          images: uploadedImages,
          status: "DRAFT",
          visibility: "PUBLIC",
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast({
          title: "Failed to create product",
          description: result.error ?? "Unknown error",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Product created!",
        description: `"${productData.name}" saved as a draft. Redirecting to edit page…`,
      });
      router.push(`/admin/products/edit/${result.product.id}`);
    } catch {
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // ── Product data field helpers ──
  const updateField = <K extends keyof ProductData>(key: K, value: ProductData[K]) => {
    setProductData((prev) => (prev ? { ...prev, [key]: value } : null));
  };

  const updateSpec = (index: number, field: "key" | "value", val: string) => {
    setProductData((prev) => {
      if (!prev) return null;
      const specs = prev.specs.map((s, i) => (i === index ? { ...s, [field]: val } : s));
      return { ...prev, specs };
    });
  };

  const removeSpec = (index: number) => {
    setProductData((prev) =>
      prev ? { ...prev, specs: prev.specs.filter((_, i) => i !== index) } : null
    );
  };

  const addSpec = () => {
    setProductData((prev) =>
      prev ? { ...prev, specs: [...prev.specs, { key: "", value: "" }] } : null
    );
  };

  // ─────────────────────── Render ───────────────────────
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top header */}
      <div className="px-6 pt-6 pb-4 border-b shrink-0">
        <PageHeader
          title="AI Product Creator"
          subtitle="Describe a product and let AI generate a complete listing — review, edit, then accept"
          backUrl="/admin/products"
        />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ───────── LEFT: Chat panel ───────── */}
        <div className="w-[420px] shrink-0 flex flex-col border-r">
          {/* Message history */}
          <ScrollArea className="flex-1 px-4 py-4">
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                      msg.role === "assistant"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {msg.role === "assistant" ? (
                      <Bot className="w-4 h-4" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2.5 text-sm leading-relaxed max-w-[78%]",
                      msg.role === "assistant"
                        ? "bg-muted text-foreground rounded-tl-sm"
                        : "bg-primary text-primary-foreground rounded-tr-sm"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm px-4 py-2.5 bg-muted text-muted-foreground flex items-center gap-2 text-sm">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Generating product…
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          </ScrollArea>

          {/* Selected images strip */}
          {images.length > 0 && (
            <div className="px-4 py-2 border-t flex gap-2 flex-wrap bg-muted/30">
              <p className="w-full text-xs text-muted-foreground mb-1">
                {images.length} image{images.length > 1 ? "s" : ""} selected (not uploaded yet)
              </p>
              {images.map((img, i) => (
                <div
                  key={i}
                  className="relative w-14 h-14 rounded-lg overflow-hidden border-2 border-border group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.objectUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input area */}
          <div className="p-4 border-t space-y-2 shrink-0">
            <div className="flex gap-2 items-end">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handleImageSelect}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-lg border hover:bg-muted transition-colors shrink-0"
                title="Add product images (uploaded only after you accept)"
              >
                <ImagePlus className="w-5 h-5 text-muted-foreground" />
              </button>

              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. Samsung 970 EVO Plus 1TB NVMe SSD, M.2, 3500MB/s read, ₹6999"
                className="resize-none min-h-[44px] max-h-32 flex-1"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={isLoading}
              />

              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Images are only stored in the database after you click Accept &amp; Create.
            </p>
          </div>
        </div>

        {/* ───────── RIGHT: Product Preview ───────── */}
        <div className="flex-1 overflow-auto">
          {!productData ? (
            // Empty state
            <div className="flex flex-col items-center justify-center h-full text-center p-8 gap-4">
              <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-muted-foreground/40" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-muted-foreground">
                  Product preview will appear here
                </p>
                <p className="text-sm text-muted-foreground/70">
                  Describe a product in the chat to get started
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 max-w-2xl mx-auto space-y-6 pb-16">
              {/* Preview header */}
              <div className="flex items-center justify-between sticky top-0 bg-background py-3 z-10 border-b -mx-6 px-6">
                <h2 className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Review &amp; Edit
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setProductData(null)}
                    disabled={isCreating}
                  >
                    Discard
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAccept}
                    disabled={isCreating}
                    className="gap-2"
                  >
                    {isCreating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Accept &amp; Create
                  </Button>
                </div>
              </div>

              {/* ── Basic Info ── */}
              <section className="space-y-3">
                <SectionTitle>Basic Info</SectionTitle>
                <Field label="Product Name">
                  <Input
                    value={productData.name}
                    onChange={(e) => {
                      updateField("name", e.target.value);
                      updateField("slug", slugify(e.target.value));
                    }}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Brand">
                    <Input
                      value={productData.brand}
                      onChange={(e) => updateField("brand", e.target.value)}
                    />
                  </Field>
                  <Field label="Model">
                    <Input
                      value={productData.model}
                      onChange={(e) => updateField("model", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="SKU">
                    <Input
                      value={productData.sku}
                      onChange={(e) => updateField("sku", e.target.value)}
                    />
                  </Field>
                  <Field label="URL Slug">
                    <Input
                      value={productData.slug}
                      onChange={(e) => updateField("slug", e.target.value)}
                    />
                  </Field>
                </div>
                <Field label="Category">
                  <Select
                    value={productData.primaryCategoryId}
                    onValueChange={(v) => updateField("primaryCategoryId", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.parent ? `${cat.parent.name} → ` : ""}
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </section>

              <Separator />

              {/* ── Pricing ── */}
              <section className="space-y-3">
                <SectionTitle>Pricing (₹ INR)</SectionTitle>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Base Price">
                    <Input
                      type="number"
                      value={productData.price}
                      onChange={(e) => {
                        const p = Math.round(parseFloat(e.target.value) || 0);
                        updateField("price", p);
                        updateField("upiPrice", Math.round(p * 0.98));
                        updateField("creditCardPrice", Math.round(p * 1.02));
                      }}
                    />
                  </Field>
                  <Field label="UPI Price (−2%)">
                    <Input
                      type="number"
                      value={productData.upiPrice}
                      onChange={(e) =>
                        updateField("upiPrice", Math.round(parseFloat(e.target.value) || 0))
                      }
                    />
                  </Field>
                  <Field label="Credit Card (+2%)">
                    <Input
                      type="number"
                      value={productData.creditCardPrice}
                      onChange={(e) =>
                        updateField(
                          "creditCardPrice",
                          Math.round(parseFloat(e.target.value) || 0)
                        )
                      }
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="MRP / Compare At (optional)">
                    <Input
                      type="number"
                      placeholder="Leave blank if no discount"
                      value={productData.compareAtPrice ?? ""}
                      onChange={(e) =>
                        updateField(
                          "compareAtPrice",
                          e.target.value ? Math.round(parseFloat(e.target.value)) : null
                        )
                      }
                    />
                  </Field>
                  <Field label="Stock Quantity">
                    <Input
                      type="number"
                      value={productData.stockQuantity}
                      onChange={(e) =>
                        updateField("stockQuantity", parseInt(e.target.value) || 0)
                      }
                    />
                  </Field>
                </div>
              </section>

              <Separator />

              {/* ── Description ── */}
              <section className="space-y-3">
                <SectionTitle>Description</SectionTitle>
                <Field label="Short Description">
                  <Textarea
                    rows={2}
                    value={productData.shortDescription}
                    onChange={(e) => updateField("shortDescription", e.target.value)}
                  />
                </Field>
                <Field label="Full Description">
                  <Textarea
                    rows={7}
                    value={productData.description}
                    onChange={(e) => updateField("description", e.target.value)}
                  />
                </Field>
              </section>

              <Separator />

              {/* ── Specifications ── */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <SectionTitle>Specifications</SectionTitle>
                  <Button variant="outline" size="sm" onClick={addSpec} className="gap-1 h-7">
                    <Plus className="w-3 h-3" />
                    Add Row
                  </Button>
                </div>
                <div className="space-y-2">
                  {productData.specs.map((spec, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Input
                        placeholder="Spec name"
                        value={spec.key}
                        onChange={(e) => updateSpec(i, "key", e.target.value)}
                        className="w-[35%]"
                      />
                      <Input
                        placeholder="Value"
                        value={spec.value}
                        onChange={(e) => updateSpec(i, "value", e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSpec(i)}
                        className="text-destructive hover:text-destructive shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {productData.specs.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      No specs yet — click Add Row
                    </p>
                  )}
                </div>
              </section>

              {/* ── Selected Images ── */}
              {images.length > 0 && (
                <>
                  <Separator />
                  <section className="space-y-3">
                    <SectionTitle>
                      Images — will be uploaded to Cloudinary on Accept
                    </SectionTitle>
                    <div className="flex gap-3 flex-wrap">
                      {images.map((img, i) => (
                        <div
                          key={i}
                          className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-border group"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.objectUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          {i === 0 && (
                            <span className="absolute bottom-0 left-0 right-0 text-center text-[10px] bg-primary text-primary-foreground py-0.5">
                              Primary
                            </span>
                          )}
                          <button
                            onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}

              <Separator />

              {/* ── SEO ── */}
              <section className="space-y-3">
                <SectionTitle>SEO</SectionTitle>
                <Field label={`SEO Title (${productData.seoTitle?.length ?? 0}/60)`}>
                  <Input
                    value={productData.seoTitle}
                    onChange={(e) => updateField("seoTitle", e.target.value)}
                    maxLength={70}
                  />
                </Field>
                <Field label={`SEO Description (${productData.seoDescription?.length ?? 0}/160)`}>
                  <Textarea
                    rows={2}
                    value={productData.seoDescription}
                    onChange={(e) => updateField("seoDescription", e.target.value)}
                    maxLength={180}
                  />
                </Field>
                <Field label="Keywords (comma-separated)">
                  <Input
                    value={productData.seoKeywords}
                    onChange={(e) => updateField("seoKeywords", e.target.value)}
                  />
                </Field>
              </section>

              <Separator />

              {/* ── Warranty / Delivery / Returns ── */}
              <section className="space-y-3">
                <SectionTitle>Trust Badges</SectionTitle>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Warranty Title">
                    <Input
                      value={productData.warrantyTitle}
                      onChange={(e) => updateField("warrantyTitle", e.target.value)}
                    />
                  </Field>
                  <Field label="Warranty Details">
                    <Input
                      value={productData.warrantySubtitle}
                      onChange={(e) => updateField("warrantySubtitle", e.target.value)}
                    />
                  </Field>
                  <Field label="Delivery Title">
                    <Input
                      value={productData.deliveryTitle}
                      onChange={(e) => updateField("deliveryTitle", e.target.value)}
                    />
                  </Field>
                  <Field label="Delivery Details">
                    <Input
                      value={productData.deliverySubtitle}
                      onChange={(e) => updateField("deliverySubtitle", e.target.value)}
                    />
                  </Field>
                  <Field label="Returns Title">
                    <Input
                      value={productData.returnsTitle}
                      onChange={(e) => updateField("returnsTitle", e.target.value)}
                    />
                  </Field>
                  <Field label="Returns Details">
                    <Input
                      value={productData.returnsSubtitle}
                      onChange={(e) => updateField("returnsSubtitle", e.target.value)}
                    />
                  </Field>
                </div>
              </section>

              {/* Bottom accept button */}
              <div className="flex gap-2 justify-end pt-4 pb-8">
                <Button
                  variant="outline"
                  onClick={() => setProductData(null)}
                  disabled={isCreating}
                >
                  Discard
                </Button>
                <Button onClick={handleAccept} disabled={isCreating} className="gap-2">
                  {isCreating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Accept &amp; Create Product
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────── Sub-components ───────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </h3>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  );
}
