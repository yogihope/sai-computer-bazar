"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Save,
  Loader2,
  Plus,
  X,
  Trash2,
  ImagePlus,
  Search,
  Check,
  Sparkles,
  Calendar,
  Package,
  Layers,
  Upload,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  parent: { name: string } | null;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface BadgeItem {
  id: string;
  name: string;
  slug: string;
  color: string;
}

const DEFAULT_BADGE_COLORS = [
  "#f59e0b", "#22c55e", "#6366f1", "#ef4444",
  "#f97316", "#8b5cf6", "#ec4899", "#06b6d4",
];

const VARIATION_TYPES = ["RAM", "Storage", "Color", "Size", "Processor", "Graphics"];

// Circular Progress Component
function CircularProgress({ value, size = 120, strokeWidth = 10 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const getColor = () => {
    if (value >= 80) return "#22c55e";
    if (value >= 50) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-muted/20" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={getColor()} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-500" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color: getColor() }}>{value}%</span>
        <span className="text-xs text-muted-foreground">SEO Score</span>
      </div>
    </div>
  );
}

export default function ProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [allBadges, setAllBadges] = useState<BadgeItem[]>([]);
  const primaryImageRef = useRef<HTMLInputElement>(null);
  const galleryImageRef = useRef<HTMLInputElement>(null);

  // Basic Info
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [sku, setSku] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");

  // Pricing & Stock
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState(0);
  const [isInStock, setIsInStock] = useState(true);

  // Status & Organization
  const [status, setStatus] = useState("DRAFT");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [isFeatured, setIsFeatured] = useState(false);
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [primaryCategoryId, setPrimaryCategoryId] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Coming Soon
  const [isComingSoon, setIsComingSoon] = useState(false);
  const [launchDate, setLaunchDate] = useState("");

  // Images
  const [primaryImage, setPrimaryImage] = useState({ url: "", alt: "" });
  const [galleryImages, setGalleryImages] = useState<{ url: string; alt: string }[]>([]);
  const [uploadingPrimary, setUploadingPrimary] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Specs
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);

  // Variations
  const [hasVariations, setHasVariations] = useState(false);
  const [variations, setVariations] = useState<{
    id?: string;
    type: string;
    name: string;
    sku: string;
    price: string;
    stock: number;
  }[]>([]);

  // Tags & Badges search
  const [tagSearchOpen, setTagSearchOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const [badgeSearchOpen, setBadgeSearchOpen] = useState(false);
  const [badgeSearch, setBadgeSearch] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [newBadgeName, setNewBadgeName] = useState("");
  const [newBadgeColor, setNewBadgeColor] = useState(DEFAULT_BADGE_COLORS[0]);

  // SEO Fields
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");

  // Fetch product and related data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productRes, catRes, tagRes, badgeRes] = await Promise.all([
          fetch(`/api/admin/products/${id}`),
          fetch("/api/admin/categories"),
          fetch("/api/admin/tags"),
          fetch("/api/admin/badges"),
        ]);

        const productData = await productRes.json();
        const catData = await catRes.json();
        const tagData = await tagRes.json();
        const badgeData = await badgeRes.json();

        if (catRes.ok) setCategories(catData.categories);
        if (tagRes.ok) setAllTags(tagData.tags);
        if (badgeRes.ok) setAllBadges(badgeData.badges);

        if (productRes.ok && productData.product) {
          const p = productData.product;
          setName(p.name);
          setSlug(p.slug);
          setShortDescription(p.shortDescription || "");
          setDescription(p.description || "");
          setSku(p.sku || "");
          setBrand(p.brand || "");
          setModel(p.model || "");
          setPrice(p.price?.toString() || "");
          setCompareAtPrice(p.compareAtPrice?.toString() || "");
          setStockQuantity(p.stockQuantity || 0);
          setIsInStock(p.isInStock);
          setStatus(p.status);
          setVisibility(p.visibility);
          setIsFeatured(p.isFeatured);
          setSelectedBadges(p.badges?.map((b: { badgeId: string }) => b.badgeId) || []);
          setPrimaryCategoryId(p.primaryCategoryId);
          setSelectedTags(p.tags?.map((t: { tagId: string }) => t.tagId) || []);
          setIsComingSoon(p.isComingSoon || false);
          setLaunchDate(p.launchDate ? new Date(p.launchDate).toISOString().split("T")[0] : "");
          setHasVariations(p.hasVariations || false);

          const allImages = p.images || [];
          const primary = allImages.find((img: { isPrimary: boolean }) => img.isPrimary);
          const gallery = allImages.filter((img: { isPrimary: boolean }) => !img.isPrimary);
          setPrimaryImage(primary ? { url: primary.url, alt: primary.alt || "" } : { url: "", alt: "" });
          setGalleryImages(gallery.map((img: { url: string; alt: string | null }) => ({ url: img.url, alt: img.alt || "" })));

          setSpecs(p.specs?.map((s: { key: string; value: string }) => ({ key: s.key, value: s.value })) || []);

          if (p.variations) {
            setVariations(p.variations.map((v: { id: string; type: string; name: string; sku: string | null; price: string | null; stockQuantity: number }) => ({
              id: v.id,
              type: v.type,
              name: v.name,
              sku: v.sku || "",
              price: v.price?.toString() || "",
              stock: v.stockQuantity || 0,
            })));
          }

          setSeoTitle(p.seoTitle || "");
          setSeoDescription(p.seoDescription || "");
          setSeoKeywords(p.seoKeywords || "");
        } else {
          toast({ title: "Error", description: "Product not found", variant: "destructive" });
          router.push("/admin/products");
        }
      } catch {
        toast({ title: "Error", description: "Failed to load product", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  // Upload image handler
  const uploadImage = async (file: File): Promise<string | null> => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/svg+xml", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Error", description: "Only JPG, PNG, SVG, WebP allowed", variant: "destructive" });
      return null;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Error", description: "Max file size is 2MB", variant: "destructive" });
      return null;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "products");

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) return data.url;
      toast({ title: "Error", description: data.error, variant: "destructive" });
      return null;
    } catch {
      toast({ title: "Error", description: "Upload failed", variant: "destructive" });
      return null;
    }
  };

  const handlePrimaryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPrimary(true);
    const url = await uploadImage(file);
    if (url) setPrimaryImage({ url, alt: file.name.split(".")[0] });
    setUploadingPrimary(false);
    if (primaryImageRef.current) primaryImageRef.current.value = "";
  };

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingGallery(true);
    const remainingSlots = 10 - galleryImages.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    for (const file of filesToUpload) {
      const url = await uploadImage(file);
      if (url) setGalleryImages(prev => [...prev, { url, alt: file.name.split(".")[0] }]);
    }
    setUploadingGallery(false);
    if (galleryImageRef.current) galleryImageRef.current.value = "";
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  // Auto-generate SEO
  const generateSEO = () => {
    const categoryName = categories.find(c => c.id === primaryCategoryId)?.name || "";
    const tagNames = allTags.filter(t => selectedTags.includes(t.id)).map(t => t.name);
    const title = `${name}${brand ? ` - ${brand}` : ""}${categoryName ? ` | ${categoryName}` : ""} | SCB`;
    setSeoTitle(title.slice(0, 60));
    const desc = shortDescription || description?.slice(0, 120) || "";
    const priceText = price ? ` Buy at Rs.${parseFloat(price).toLocaleString("en-IN")}.` : "";
    setSeoDescription(`${desc}${priceText} Shop ${categoryName} at Sai Computer Bazar.`.slice(0, 160));
    const keywords = [brand, model, categoryName, ...tagNames.slice(0, 2)].filter(Boolean).join(", ");
    setSeoKeywords(keywords);
    toast({ title: "SEO Generated", description: "SEO fields auto-filled" });
  };

  // SEO Checklist
  const seoChecklist = useMemo(() => [
    { label: "SEO Title (30-60 chars)", done: seoTitle.length >= 30 && seoTitle.length <= 60, points: 20 },
    { label: "Meta Description (120-160 chars)", done: seoDescription.length >= 120 && seoDescription.length <= 160, points: 20 },
    { label: "Focus Keywords (3-5)", done: seoKeywords.split(",").filter(k => k.trim()).length >= 3, points: 15 },
    { label: "Primary Image with Alt", done: !!primaryImage.url && !!primaryImage.alt, points: 15 },
    { label: "Short Description (50+ chars)", done: shortDescription.length >= 50, points: 10 },
    { label: "Category Selected", done: !!primaryCategoryId, points: 10 },
    { label: "Tags Added (2+)", done: selectedTags.length >= 2, points: 10 },
  ], [seoTitle, seoDescription, seoKeywords, primaryImage, shortDescription, primaryCategoryId, selectedTags]);

  const seoScore = useMemo(() => seoChecklist.reduce((score, item) => score + (item.done ? item.points : 0), 0), [seoChecklist]);

  const generateJsonLd = () => ({
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: shortDescription || description?.slice(0, 200),
    image: primaryImage.url,
    brand: brand ? { "@type": "Brand", name: brand } : undefined,
    sku,
    offers: { "@type": "Offer", price, priceCurrency: "INR", availability: isInStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" },
  });

  const addVariation = () => setVariations([...variations, { type: "RAM", name: "", sku: "", price: "", stock: 0 }]);
  const removeVariation = (index: number) => setVariations(variations.filter((_, i) => i !== index));
  const addSpec = () => setSpecs([...specs, { key: "", value: "" }]);
  const removeSpec = (index: number) => setSpecs(specs.filter((_, i) => i !== index));
  const toggleTag = (tagId: string) => setSelectedTags(prev => prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]);
  const toggleBadge = (badgeId: string) => setSelectedBadges(prev => prev.includes(badgeId) ? prev.filter(b => b !== badgeId) : [...prev, badgeId]);

  const addNewTag = async () => {
    const tagName = newTagName.trim() || tagSearch.trim();
    if (!tagName) return;
    try {
      const res = await fetch("/api/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: tagName, slug: tagName.toLowerCase().replace(/\s+/g, "-") }),
      });
      const data = await res.json();
      if (res.ok) {
        setAllTags([...allTags, data.tag]);
        setSelectedTags([...selectedTags, data.tag.id]);
        setTagSearch("");
        setNewTagName("");
        toast({ title: "Tag Created", description: `"${tagName}" added` });
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to create tag", variant: "destructive" });
    }
  };

  const addNewBadge = async () => {
    const badgeName = newBadgeName.trim() || badgeSearch.trim();
    if (!badgeName) return;
    try {
      const res = await fetch("/api/admin/badges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: badgeName,
          slug: badgeName.toLowerCase().replace(/\s+/g, "-"),
          color: newBadgeColor,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAllBadges([...allBadges, data.badge]);
        setSelectedBadges([...selectedBadges, data.badge.id]);
        setBadgeSearch("");
        setNewBadgeName("");
        setNewBadgeColor(DEFAULT_BADGE_COLORS[Math.floor(Math.random() * DEFAULT_BADGE_COLORS.length)]);
        toast({ title: "Badge Created", description: `"${badgeName}" added` });
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to create badge", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    if (!name || !slug || !primaryCategoryId || !price) {
      toast({ title: "Error", description: "Name, slug, category, and price are required", variant: "destructive" });
      return;
    }
    if (!primaryImage.url) {
      toast({ title: "Error", description: "Primary image is required", variant: "destructive" });
      return;
    }

    try {
      setSaving(true);
      const allImages = [
        { url: primaryImage.url, alt: primaryImage.alt, isPrimary: true, sortOrder: 0 },
        ...galleryImages.map((img, i) => ({ url: img.url, alt: img.alt, isPrimary: false, sortOrder: i + 1 })),
      ];

      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, slug, shortDescription: shortDescription || null, description: description || null,
          sku: sku || null, price: parseFloat(price), compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
          stockQuantity, isInStock, status, visibility, isFeatured,
          badges: selectedBadges.length > 0 ? selectedBadges : null, primaryCategoryId,
          brand: brand || null, model: model || null, isComingSoon,
          launchDate: launchDate ? new Date(launchDate).toISOString() : null, hasVariations,
          seoTitle: seoTitle || null, seoDescription: seoDescription || null, seoKeywords: seoKeywords || null, seoScore,
          robotsIndex: true, robotsFollow: true,
          ogTitle: seoTitle || null, ogDescription: seoDescription || null, ogImage: primaryImage.url,
          twitterTitle: seoTitle || null, twitterDescription: seoDescription || null, twitterImage: primaryImage.url,
          jsonLd: generateJsonLd(), images: allImages, tags: selectedTags,
          specs: specs.filter(s => s.key && s.value).map((s, i) => ({ ...s, sortOrder: i })),
          variations: hasVariations ? variations.filter(v => v.name).map((v, i) => ({
            ...v, price: v.price ? parseFloat(v.price) : null, stockQuantity: v.stock, sortOrder: i,
          })) : [],
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast({ title: "Success", description: "Product updated" });
        router.push("/admin/products");
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to update product", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Deleted", description: "Product deleted" });
        router.push("/admin/products");
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const filteredTags = allTags.filter(t => t.name.toLowerCase().includes(tagSearch.toLowerCase()));
  const filteredBadges = allBadges.filter(b => b.name.toLowerCase().includes(badgeSearch.toLowerCase()));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Product"
        subtitle={name}
        backUrl="/admin/products"
        actions={
          <div className="flex items-center gap-3">
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" /> Basic Information
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input id="name" className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input id="slug" className="mt-1.5 font-mono text-sm" value={slug} onChange={(e) => setSlug(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" className="mt-1.5 font-mono" value={sku} onChange={(e) => setSku(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input id="brand" className="mt-1.5" value={brand} onChange={(e) => setBrand(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input id="model" className="mt-1.5" value={model} onChange={(e) => setModel(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Short Description</Label>
                <Textarea className="mt-1.5 h-20" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} maxLength={200} />
                <p className="text-xs text-muted-foreground mt-1">{shortDescription.length}/200</p>
              </div>
              <div>
                <Label>Full Description</Label>
                <Textarea className="mt-1.5 h-32" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Pricing & Stock</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label>Price (Rs.) *</Label>
                <Input type="number" className="mt-1.5" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
              <div>
                <Label>Compare Price</Label>
                <Input type="number" className="mt-1.5" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} />
              </div>
              <div>
                <Label>Stock</Label>
                <Input type="number" className="mt-1.5" value={stockQuantity} onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)} />
              </div>
              <div className="flex items-end pb-2">
                <div className="flex items-center gap-2">
                  <Switch checked={isInStock} onCheckedChange={setIsInStock} />
                  <Label>In Stock</Label>
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ImagePlus className="w-5 h-5" /> Product Images
              <span className="text-xs text-muted-foreground font-normal ml-2">Max 2MB | JPG, PNG, SVG, WebP</span>
            </h2>
            <div className="space-y-4">
              <div>
                <Label className="text-primary">Primary Image *</Label>
                <div className="mt-2 flex gap-4 items-start">
                  <div className="flex-1">
                    <input ref={primaryImageRef} type="file" accept="image/jpeg,image/jpg,image/png,image/svg+xml,image/webp" onChange={handlePrimaryImageUpload} className="hidden" />
                    <div onClick={() => primaryImageRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                      {uploadingPrimary ? (
                        <div className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /><span>Uploading...</span></div>
                      ) : (
                        <><Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" /><p className="text-sm text-muted-foreground">Click to upload</p></>
                      )}
                    </div>
                    <Input placeholder="Alt text" className="mt-2" value={primaryImage.alt} onChange={(e) => setPrimaryImage({ ...primaryImage, alt: e.target.value })} />
                  </div>
                  {primaryImage.url && (
                    <div className="relative">
                      <img src={primaryImage.url} alt={primaryImage.alt} className="w-28 h-28 object-cover rounded-lg border-2 border-primary" />
                      <button onClick={() => setPrimaryImage({ url: "", alt: "" })} className="absolute -top-2 -right-2 p-1 bg-destructive text-white rounded-full"><X className="w-3 h-3" /></button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label>Gallery Images (up to 10)</Label>
                <input ref={galleryImageRef} type="file" accept="image/jpeg,image/jpg,image/png,image/svg+xml,image/webp" multiple onChange={handleGalleryImageUpload} className="hidden" />
                <div onClick={() => galleryImageRef.current?.click()} className="mt-2 border-2 border-dashed border-border/50 rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
                  {uploadingGallery ? (
                    <div className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /><span>Uploading...</span></div>
                  ) : (
                    <p className="text-sm text-muted-foreground"><Plus className="w-4 h-4 inline mr-1" />Add gallery images ({galleryImages.length}/10)</p>
                  )}
                </div>
                {galleryImages.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mt-3">
                    {galleryImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <img src={img.url} alt={img.alt} className="w-full aspect-square object-cover rounded-lg border" />
                        <button onClick={() => removeGalleryImage(index)} className="absolute -top-2 -right-2 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Specifications</h2>
              <Button variant="outline" size="sm" onClick={addSpec}><Plus className="w-4 h-4 mr-1" /> Add</Button>
            </div>
            <div className="space-y-2">
              {specs.map((spec, index) => (
                <div key={index} className="flex gap-2">
                  <Input placeholder="Key" value={spec.key} onChange={(e) => { const updated = [...specs]; updated[index].key = e.target.value; setSpecs(updated); }} className="flex-1" />
                  <Input placeholder="Value" value={spec.value} onChange={(e) => { const updated = [...specs]; updated[index].value = e.target.value; setSpecs(updated); }} className="flex-1" />
                  <Button variant="ghost" size="icon" onClick={() => removeSpec(index)}><X className="w-4 h-4" /></Button>
                </div>
              ))}
              {specs.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No specifications</p>}
            </div>
          </div>

          {/* Variations */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2"><Layers className="w-5 h-5" /> Variations</h2>
              <Switch checked={hasVariations} onCheckedChange={setHasVariations} />
            </div>
            {hasVariations && (
              <div className="space-y-3">
                <Button variant="outline" size="sm" onClick={addVariation}><Plus className="w-4 h-4 mr-1" /> Add</Button>
                {variations.map((v, index) => (
                  <div key={index} className="grid grid-cols-5 gap-2 items-center p-3 bg-muted/50 rounded-lg">
                    <Select value={v.type} onValueChange={(val) => { const updated = [...variations]; updated[index].type = val; setVariations(updated); }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{VARIATION_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input placeholder="Name" value={v.name} onChange={(e) => { const updated = [...variations]; updated[index].name = e.target.value; setVariations(updated); }} />
                    <Input placeholder="SKU" value={v.sku} onChange={(e) => { const updated = [...variations]; updated[index].sku = e.target.value; setVariations(updated); }} />
                    <Input type="number" placeholder="Price" value={v.price} onChange={(e) => { const updated = [...variations]; updated[index].price = e.target.value; setVariations(updated); }} />
                    <div className="flex gap-2">
                      <Input type="number" placeholder="Stock" value={v.stock} onChange={(e) => { const updated = [...variations]; updated[index].stock = parseInt(e.target.value) || 0; setVariations(updated); }} className="w-20" />
                      <Button variant="ghost" size="icon" onClick={() => removeVariation(index)}><X className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Status</h2>
            <div className="space-y-4">
              <div>
                <Label>Category *</Label>
                <Select value={primaryCategoryId} onValueChange={setPrimaryCategoryId}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{categories.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.parent ? `${cat.parent.name} > ` : ""}{cat.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Visibility</Label>
                <Select value={visibility} onValueChange={setVisibility}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">Public</SelectItem>
                    <SelectItem value="HIDDEN">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label>Featured</Label>
                <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
              </div>
            </div>
          </div>

          {/* Coming Soon */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2"><Calendar className="w-5 h-5" /> Coming Soon</h2>
              <Switch checked={isComingSoon} onCheckedChange={setIsComingSoon} />
            </div>
            {isComingSoon && (
              <div>
                <Label>Launch Date</Label>
                <Input type="date" className="mt-1.5" value={launchDate} onChange={(e) => setLaunchDate(e.target.value)} />
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Tags</h2>
            <Popover open={tagSearchOpen} onOpenChange={setTagSearchOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start"><Search className="w-4 h-4 mr-2" />Search tags...</Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-64">
                <Command>
                  <CommandInput placeholder="Search..." value={tagSearch} onValueChange={setTagSearch} />
                  <CommandList>
                    <CommandEmpty><p className="text-sm text-muted-foreground p-2">No tags</p></CommandEmpty>
                    <CommandGroup>
                      {filteredTags.map(tag => (
                        <CommandItem key={tag.id} onSelect={() => toggleTag(tag.id)}>
                          <Check className={cn("mr-2 h-4 w-4", selectedTags.includes(tag.id) ? "opacity-100" : "opacity-0")} />{tag.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <div className="flex gap-2 mt-3">
              <Input placeholder="New tag" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addNewTag()} />
              <Button size="icon" variant="outline" onClick={addNewTag} disabled={!newTagName.trim()}><Plus className="w-4 h-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedTags.map(tagId => {
                const tag = allTags.find(t => t.id === tagId);
                return tag ? <Badge key={tagId} variant="secondary" className="cursor-pointer" onClick={() => toggleTag(tagId)}>{tag.name} <X className="w-3 h-3 ml-1" /></Badge> : null;
              })}
            </div>
          </div>

          {/* Badges */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Badges</h2>
            <Popover open={badgeSearchOpen} onOpenChange={setBadgeSearchOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start"><Search className="w-4 h-4 mr-2" />Search badges...</Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-64">
                <Command>
                  <CommandInput placeholder="Search..." value={badgeSearch} onValueChange={setBadgeSearch} />
                  <CommandList>
                    <CommandEmpty><p className="text-sm text-muted-foreground p-2">No badges</p></CommandEmpty>
                    <CommandGroup>
                      {filteredBadges.map(badge => (
                        <CommandItem key={badge.id} onSelect={() => toggleBadge(badge.id)}>
                          <Check className={cn("mr-2 h-4 w-4", selectedBadges.includes(badge.id) ? "opacity-100" : "opacity-0")} />
                          <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: badge.color }} />
                          {badge.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <div className="flex gap-2 mt-3">
              <Input placeholder="New badge" value={newBadgeName} onChange={(e) => setNewBadgeName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addNewBadge()} className="flex-1" />
              <input type="color" value={newBadgeColor} onChange={(e) => setNewBadgeColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
              <Button size="icon" variant="outline" onClick={addNewBadge} disabled={!newBadgeName.trim()}><Plus className="w-4 h-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedBadges.map(badgeId => {
                const badge = allBadges.find(b => b.id === badgeId);
                return badge ? <Badge key={badgeId} className="cursor-pointer text-white" style={{ backgroundColor: badge.color }} onClick={() => toggleBadge(badgeId)}>{badge.name} <X className="w-3 h-3 ml-1" /></Badge> : null;
              })}
            </div>
          </div>

          {/* SEO Analytics Card */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2"><Sparkles className="w-5 h-5" /> SEO Score</h2>
              <Button variant="outline" size="sm" onClick={generateSEO}><Sparkles className="w-4 h-4 mr-1" /> Auto</Button>
            </div>
            <div className="flex justify-center mb-4"><CircularProgress value={seoScore} /></div>
            <div className="space-y-2">
              {seoChecklist.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {item.done ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                  <span className={item.done ? "text-muted-foreground" : "text-foreground"}>{item.label}</span>
                  <span className="ml-auto text-xs text-muted-foreground">+{item.points}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t space-y-3">
              <div>
                <Label className="text-xs">SEO Title</Label>
                <Input className="mt-1 text-sm" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} maxLength={60} />
                <p className="text-xs text-muted-foreground mt-0.5">{seoTitle.length}/60</p>
              </div>
              <div>
                <Label className="text-xs">Meta Description</Label>
                <Textarea className="mt-1 text-sm h-16" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} maxLength={160} />
                <p className="text-xs text-muted-foreground mt-0.5">{seoDescription.length}/160</p>
              </div>
              <div>
                <Label className="text-xs">Keywords</Label>
                <Input className="mt-1 text-sm" value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={deleting}>
              {deleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
