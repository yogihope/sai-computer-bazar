"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  Search,
  Trash2,
  Package,
  IndianRupee,
  TrendingDown,
  GripVertical,
  Upload,
  X,
  Check,
  ImagePlus,
  Clock,
  Tags,
  Award,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SearchProduct {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  price: string;
  brand: string | null;
  stockQuantity: number;
  isInStock: boolean;
  primaryCategory: { id: string; name: string; slug: string };
  images: { url: string; alt: string | null }[];
}

interface Component {
  id: string;
  productId: string;
  product: SearchProduct;
  componentType: string;
  quantity: number;
  priceOverride: number | null;
  sortOrder: number;
}

interface Tag { id: string; name: string; slug: string; }
interface BadgeItem { id: string; name: string; slug: string; color: string; }
interface PCType { id: string; name: string; slug: string; description?: string; }

const COMPONENT_TYPES = [
  "CPU", "GPU", "Motherboard", "RAM", "Storage", "PSU", "Case",
  "CPU Cooler", "Case Fan", "Monitor", "Keyboard", "Mouse",
  "Mousepad", "Headset", "Webcam", "Speakers", "UPS", "Other",
];

const DEFAULT_BADGE_COLORS = [
  "#f59e0b", "#22c55e", "#6366f1", "#ef4444",
  "#f97316", "#8b5cf6", "#ec4899", "#06b6d4",
];

// Circular Progress Component for SEO Score
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
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="none" className="text-muted/20" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={getColor()} strokeWidth={strokeWidth} fill="none" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-500" />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold" style={{ color: getColor() }}>{value}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

export default function EditPrebuiltPCPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const primaryImageRef = useRef<HTMLInputElement>(null);
  const galleryImageRef = useRef<HTMLInputElement>(null);

  // Basic Info
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [specifications, setSpecifications] = useState("");
  const [targetUse, setTargetUse] = useState("");

  // PC Type
  const [pcTypes, setPcTypes] = useState<PCType[]>([]);
  const [selectedPcTypeId, setSelectedPcTypeId] = useState<string>("");
  const [pcTypeSearchOpen, setPcTypeSearchOpen] = useState(false);
  const [pcTypeSearch, setPcTypeSearch] = useState("");
  const [creatingPcType, setCreatingPcType] = useState(false);

  // Pricing
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [compareAtPrice, setCompareAtPrice] = useState<number | null>(null);

  // Images
  const [primaryImage, setPrimaryImage] = useState({ url: "", alt: "" });
  const [galleryImages, setGalleryImages] = useState<{ url: string; alt: string }[]>([]);
  const [uploadingPrimary, setUploadingPrimary] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Status
  const [status, setStatus] = useState("DRAFT");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isInStock, setIsInStock] = useState(true);
  const [isComingSoon, setIsComingSoon] = useState(false);
  const [launchDate, setLaunchDate] = useState("");

  // SEO
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");

  // Components
  const [components, setComponents] = useState<Component[]>([]);
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedComponentType, setSelectedComponentType] = useState("CPU");

  // Tags
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearchOpen, setTagSearchOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const [newTagName, setNewTagName] = useState("");

  // Badges
  const [availableBadges, setAvailableBadges] = useState<BadgeItem[]>([]);
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [badgeSearchOpen, setBadgeSearchOpen] = useState(false);
  const [badgeSearch, setBadgeSearch] = useState("");
  const [newBadgeName, setNewBadgeName] = useState("");
  const [newBadgeColor, setNewBadgeColor] = useState(DEFAULT_BADGE_COLORS[0]);

  const totalPrice = components.reduce((sum, comp) => {
    const price = comp.priceOverride ?? parseFloat(comp.product.price);
    return sum + price * comp.quantity;
  }, 0);

  const discountPercent = totalPrice > 0 ? Math.round(((totalPrice - sellingPrice) / totalPrice) * 100) : 0;
  const savings = totalPrice - sellingPrice;

  // SEO Score Checklist
  const seoChecklist = useMemo(() => {
    return [
      { label: "SEO Title (30-60 chars)", done: seoTitle.length >= 30 && seoTitle.length <= 60, points: 15 },
      { label: "Meta Description (120-160 chars)", done: seoDescription.length >= 120 && seoDescription.length <= 160, points: 15 },
      { label: "SEO Keywords added", done: seoKeywords.length >= 10, points: 10 },
      { label: "Primary Image uploaded", done: !!primaryImage.url, points: 15 },
      { label: "Short Description added", done: shortDescription.length >= 50, points: 10 },
      { label: "PC Type selected", done: !!selectedPcTypeId, points: 10 },
      { label: "Tags added (at least 1)", done: selectedTags.length >= 1, points: 10 },
      { label: "Components added (at least 3)", done: components.length >= 3, points: 15 },
    ];
  }, [seoTitle, seoDescription, seoKeywords, primaryImage, shortDescription, selectedPcTypeId, selectedTags, components]);

  const seoScore = useMemo(() => {
    return seoChecklist.reduce((sum, item) => sum + (item.done ? item.points : 0), 0);
  }, [seoChecklist]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [pcRes, pcTypesRes, tagsRes, badgesRes] = await Promise.all([
          fetch(`/api/admin/prebuilt-pcs/${id}`),
          fetch("/api/admin/pc-types"),
          fetch("/api/admin/tags"),
          fetch("/api/admin/badges"),
        ]);

        if (pcTypesRes.ok) setPcTypes((await pcTypesRes.json()).pcTypes || []);
        if (tagsRes.ok) setAvailableTags((await tagsRes.json()).tags || []);
        if (badgesRes.ok) setAvailableBadges((await badgesRes.json()).badges || []);

        if (!pcRes.ok) {
          toast({ title: "Error", description: "Prebuilt PC not found", variant: "destructive" });
          router.push("/admin/prebuilt-pcs");
          return;
        }

        const { prebuiltPC: pc } = await pcRes.json();
        setName(pc.name);
        setSlug(pc.slug);
        setShortDescription(pc.shortDescription || "");
        setDescription(pc.description || "");
        setSpecifications(pc.specifications || "");
        setSelectedPcTypeId(pc.pcTypeId || pc.pcType?.id || "");
        setTargetUse(pc.targetUse || "");
        setSellingPrice(parseFloat(pc.sellingPrice) || 0);
        setCompareAtPrice(pc.compareAtPrice ? parseFloat(pc.compareAtPrice) : null);
        setPrimaryImage({ url: pc.primaryImage || "", alt: "" });
        setGalleryImages(Array.isArray(pc.galleryImages) ? pc.galleryImages : []);
        setStatus(pc.status);
        setVisibility(pc.visibility);
        setIsFeatured(pc.isFeatured);
        setIsInStock(pc.isInStock);
        setIsComingSoon(pc.isComingSoon || false);
        if (pc.launchDate) {
          const date = new Date(pc.launchDate);
          setLaunchDate(date.toISOString().slice(0, 16));
        }
        setSeoTitle(pc.seoTitle || "");
        setSeoDescription(pc.seoDescription || "");
        setSeoKeywords(pc.seoKeywords || "");
        setComponents(pc.components.map((comp: any) => ({
          id: comp.id,
          productId: comp.product.id,
          product: comp.product,
          componentType: comp.componentType,
          quantity: comp.quantity,
          priceOverride: comp.priceOverride ? parseFloat(comp.priceOverride) : null,
          sortOrder: comp.sortOrder,
        })));
        setSelectedTags(pc.tags?.map((t: any) => t.tag.id) || []);
        setSelectedBadges(pc.badges?.map((b: any) => b.badge.id) || []);
      } catch (error) {
        console.error("Error:", error);
        toast({ title: "Error", description: "Failed to load", variant: "destructive" });
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
    formData.append("folder", "prebuilt-pcs");

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

  // PC Type functions
  const filteredPcTypes = pcTypes.filter(t =>
    t.name.toLowerCase().includes(pcTypeSearch.toLowerCase())
  );

  const addNewPcType = async () => {
    const typeName = pcTypeSearch.trim();
    if (!typeName) return;
    setCreatingPcType(true);
    try {
      const res = await fetch("/api/admin/pc-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: typeName }),
      });
      const data = await res.json();
      if (res.ok) {
        setPcTypes([...pcTypes, data.pcType]);
        setSelectedPcTypeId(data.pcType.id);
        setPcTypeSearch("");
        setPcTypeSearchOpen(false);
        toast({ title: "Created", description: `"${typeName}" PC type added` });
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to create PC type", variant: "destructive" });
    }
    setCreatingPcType(false);
  };

  // Tag functions
  const filteredTags = availableTags.filter(t =>
    t.name.toLowerCase().includes(tagSearch.toLowerCase())
  );

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    );
  };

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
        setAvailableTags([...availableTags, data.tag]);
        setSelectedTags([...selectedTags, data.tag.id]);
        setTagSearch("");
        setNewTagName("");
        toast({ title: "Created", description: `"${tagName}" tag added` });
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to create tag", variant: "destructive" });
    }
  };

  // Badge functions
  const filteredBadges = availableBadges.filter(b =>
    b.name.toLowerCase().includes(badgeSearch.toLowerCase())
  );

  const toggleBadge = (badgeId: string) => {
    setSelectedBadges(prev =>
      prev.includes(badgeId) ? prev.filter(b => b !== badgeId) : [...prev, badgeId]
    );
  };

  const addNewBadge = async () => {
    const badgeName = newBadgeName.trim() || badgeSearch.trim();
    if (!badgeName) return;
    try {
      const res = await fetch("/api/admin/badges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: badgeName, slug: badgeName.toLowerCase().replace(/\s+/g, "-"), color: newBadgeColor }),
      });
      const data = await res.json();
      if (res.ok) {
        setAvailableBadges([...availableBadges, data.badge]);
        setSelectedBadges([...selectedBadges, data.badge.id]);
        setBadgeSearch("");
        setNewBadgeName("");
        setNewBadgeColor(DEFAULT_BADGE_COLORS[Math.floor(Math.random() * DEFAULT_BADGE_COLORS.length)]);
        toast({ title: "Created", description: `"${badgeName}" badge added` });
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to create badge", variant: "destructive" });
    }
  };

  // Search products
  const searchProducts = useCallback(async (query: string) => {
    try {
      setSearching(true);
      const res = await fetch(`/api/admin/products/search?q=${encodeURIComponent(query)}&limit=10`);
      if (res.ok) setSearchResults((await res.json()).products || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (productSearchOpen) searchProducts(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, productSearchOpen, searchProducts]);

  useEffect(() => {
    if (productSearchOpen && !searchQuery) {
      fetch("/api/admin/products/search?limit=10")
        .then(res => res.json())
        .then(data => setSearchResults(data.products || []))
        .catch(console.error);
    }
  }, [productSearchOpen, searchQuery]);

  const addComponent = (product: SearchProduct) => {
    if (components.some(c => c.productId === product.id)) {
      toast({ title: "Already Added", variant: "destructive" });
      return;
    }
    setComponents([...components, {
      id: `temp-${Date.now()}`,
      productId: product.id,
      product,
      componentType: selectedComponentType,
      quantity: 1,
      priceOverride: null,
      sortOrder: components.length,
    }]);
    toast({ title: "Added", description: `${product.name} added` });
  };

  const removeComponent = (componentId: string) => setComponents(components.filter(c => c.id !== componentId));
  const updateComponent = (componentId: string, updates: Partial<Component>) => setComponents(components.map(c => c.id === componentId ? { ...c, ...updates } : c));

  const handleSave = async () => {
    if (!name.trim() || !slug.trim()) {
      toast({ title: "Error", description: "Name and slug required", variant: "destructive" });
      return;
    }
    if (components.length === 0) {
      toast({ title: "Error", description: "Add at least one component", variant: "destructive" });
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`/api/admin/prebuilt-pcs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, slug, shortDescription, description, specifications, totalPrice,
          sellingPrice: sellingPrice || totalPrice, compareAtPrice,
          primaryImage: primaryImage.url || null,
          galleryImages: galleryImages.length > 0 ? galleryImages : null,
          status, visibility, isFeatured, isInStock,
          isComingSoon,
          launchDate: isComingSoon && launchDate ? new Date(launchDate).toISOString() : null,
          pcTypeId: selectedPcTypeId || null, targetUse: targetUse || null,
          seoTitle: seoTitle || null, seoDescription: seoDescription || null, seoKeywords: seoKeywords || null,
          seoScore,
          components: components.map((c, i) => ({ productId: c.productId, componentType: c.componentType, quantity: c.quantity, priceOverride: c.priceOverride, sortOrder: i })),
          tags: selectedTags, badges: selectedBadges,
        }),
      });

      if (res.ok) {
        toast({ title: "Success", description: "Updated successfully" });
        router.push("/admin/prebuilt-pcs");
      } else {
        toast({ title: "Error", description: (await res.json()).error, variant: "destructive" });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({ title: "Error", description: "Failed to save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const selectedPcType = pcTypes.find(t => t.id === selectedPcTypeId);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Prebuilt PC"
        subtitle={name}
        actions={
          <div className="flex items-center gap-3">
            <Link href="/admin/prebuilt-pcs"><Button variant="outline" className="gap-2"><ArrowLeft className="w-4 h-4" />Back</Button></Link>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Update PC
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>PC Name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div className="space-y-2"><Label>Slug *</Label><Input value={slug} onChange={(e) => setSlug(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>PC Type</Label>
                <Popover open={pcTypeSearchOpen} onOpenChange={setPcTypeSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      {selectedPcType ? selectedPcType.name : "Select or create PC type..."}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-64">
                    <Command>
                      <CommandInput placeholder="Search PC types..." value={pcTypeSearch} onValueChange={setPcTypeSearch} />
                      <CommandList>
                        <CommandEmpty>
                          <div className="p-2">
                            <p className="text-sm text-muted-foreground mb-2">No PC type found</p>
                            {pcTypeSearch && (
                              <Button size="sm" onClick={addNewPcType} disabled={creatingPcType} className="w-full gap-2">
                                {creatingPcType ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                                Add "{pcTypeSearch}"
                              </Button>
                            )}
                          </div>
                        </CommandEmpty>
                        <CommandGroup>
                          {filteredPcTypes.map(pcType => (
                            <CommandItem key={pcType.id} onSelect={() => { setSelectedPcTypeId(pcType.id); setPcTypeSearchOpen(false); }}>
                              <Check className={cn("mr-2 h-4 w-4", selectedPcTypeId === pcType.id ? "opacity-100" : "opacity-0")} />
                              {pcType.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2"><Label>Target Use</Label><Input value={targetUse} onChange={(e) => setTargetUse(e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>Short Description</Label><Textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} rows={2} /></div>
            <div className="space-y-2"><Label>Full Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} /></div>
            <div className="space-y-2"><Label>Specifications</Label><Textarea value={specifications} onChange={(e) => setSpecifications(e.target.value)} rows={4} /></div>
          </div>

          {/* Images */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ImagePlus className="w-5 h-5" />
              Images
              <span className="text-xs text-muted-foreground font-normal ml-2">Max 2MB | JPG, PNG, SVG, WebP</span>
            </h2>

            {/* Primary Image */}
            <div>
              <Label className="text-primary">Primary Image</Label>
              <div className="mt-2 flex gap-4 items-start">
                <div className="flex-1">
                  <input ref={primaryImageRef} type="file" accept="image/jpeg,image/jpg,image/png,image/svg+xml,image/webp" onChange={handlePrimaryImageUpload} className="hidden" />
                  <div onClick={() => primaryImageRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                    {uploadingPrimary ? (
                      <div className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /><span>Uploading...</span></div>
                    ) : (
                      <><Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" /><p className="text-sm text-muted-foreground">Click to upload primary image</p></>
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

            {/* Gallery Images */}
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

          {/* Components */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">PC Components</h2>
              <Button onClick={() => setProductSearchOpen(true)} className="gap-2"><Plus className="w-4 h-4" />Add Component</Button>
            </div>
            {components.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No components</p>
                <Button onClick={() => setProductSearchOpen(true)} variant="outline"><Plus className="w-4 h-4 mr-2" />Add Component</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {components.map((comp) => (
                  <div key={comp.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border border-border/50">
                    <GripVertical className="w-5 h-5 text-muted-foreground" />
                    <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                      {comp.product.images?.[0]?.url ? <img src={comp.product.images[0].url} alt="" className="w-full h-full object-cover" /> : <Package className="w-6 h-6 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{comp.product.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{comp.componentType}</Badge>
                        <span className="text-sm text-muted-foreground">₹{parseFloat(comp.product.price).toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                    <Select value={comp.componentType} onValueChange={(v) => updateComponent(comp.id, { componentType: v })}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent>{COMPONENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
                    <div className="flex items-center gap-2"><Label className="text-sm text-muted-foreground">Qty:</Label><Input type="number" min={1} value={comp.quantity} onChange={(e) => updateComponent(comp.id, { quantity: parseInt(e.target.value) || 1 })} className="w-16" /></div>
                    <Button variant="ghost" size="icon" onClick={() => removeComponent(comp.id)} className="text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SEO */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">SEO Settings</h2>
            <div className="space-y-2"><Label>SEO Title</Label><Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} maxLength={70} /><p className="text-xs text-muted-foreground">{seoTitle.length}/70</p></div>
            <div className="space-y-2"><Label>SEO Description</Label><Textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} maxLength={170} rows={3} /><p className="text-xs text-muted-foreground">{seoDescription.length}/170</p></div>
            <div className="space-y-2"><Label>Keywords</Label><Input value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} /></div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><IndianRupee className="w-5 h-5" />Pricing</h2>
            <div className="p-4 bg-card/50 rounded-lg border border-border/50">
              <div className="flex items-center justify-between mb-2"><span className="text-sm text-muted-foreground">Components Total</span><span className="text-lg font-semibold">₹{totalPrice.toLocaleString("en-IN")}</span></div>
              <p className="text-xs text-muted-foreground">Sum of {components.length} component(s)</p>
            </div>
            <div className="space-y-2"><Label>Selling Price *</Label><div className="relative"><IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input type="number" className="pl-9" value={sellingPrice || ""} onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)} /></div></div>
            <div className="space-y-2"><Label>Compare at Price</Label><div className="relative"><IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input type="number" className="pl-9" value={compareAtPrice || ""} onChange={(e) => setCompareAtPrice(parseFloat(e.target.value) || null)} /></div></div>
            {totalPrice > 0 && sellingPrice > 0 && sellingPrice < totalPrice && (
              <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <div className="flex items-center gap-2 text-emerald-500 mb-2"><TrendingDown className="w-5 h-5" /><span className="font-semibold">Customer Saves</span></div>
                <div className="text-2xl font-bold text-emerald-500">₹{savings.toLocaleString("en-IN")} ({discountPercent}% OFF)</div>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">Status</h2>
            <div className="space-y-2"><Label>Publication Status</Label><Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="DRAFT">Draft</SelectItem><SelectItem value="PUBLISHED">Published</SelectItem><SelectItem value="ARCHIVED">Archived</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Visibility</Label><Select value={visibility} onValueChange={setVisibility}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PUBLIC">Public</SelectItem><SelectItem value="HIDDEN">Hidden</SelectItem></SelectContent></Select></div>
            <div className="flex items-center justify-between"><Label>Featured</Label><Switch checked={isFeatured} onCheckedChange={setIsFeatured} /></div>
            <div className="flex items-center justify-between"><Label>In Stock</Label><Switch checked={isInStock} onCheckedChange={setIsInStock} /></div>

            {/* Coming Soon */}
            <div className="pt-4 border-t border-border/50 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Coming Soon
                </Label>
                <Switch checked={isComingSoon} onCheckedChange={setIsComingSoon} />
              </div>
              {isComingSoon && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Launch Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={launchDate}
                    onChange={(e) => setLaunchDate(e.target.value)}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Tags className="w-5 h-5" />Tags</h2>
            <Popover open={tagSearchOpen} onOpenChange={setTagSearchOpen}>
              <PopoverTrigger asChild><Button variant="outline" className="w-full justify-start"><Search className="w-4 h-4 mr-2" />Search tags...</Button></PopoverTrigger>
              <PopoverContent className="p-0 w-64">
                <Command>
                  <CommandInput placeholder="Search tags..." value={tagSearch} onValueChange={setTagSearch} />
                  <CommandList>
                    <CommandEmpty>
                      <div className="p-2">
                        <p className="text-sm text-muted-foreground mb-2">No tags found</p>
                        {tagSearch && <Button size="sm" onClick={addNewTag} className="w-full gap-2"><Plus className="w-3 h-3" />Add "{tagSearch}"</Button>}
                      </div>
                    </CommandEmpty>
                    <CommandGroup>
                      {filteredTags.map(tag => (
                        <CommandItem key={tag.id} onSelect={() => toggleTag(tag.id)}>
                          <Check className={cn("mr-2 h-4 w-4", selectedTags.includes(tag.id) ? "opacity-100" : "opacity-0")} />
                          {tag.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <div className="flex gap-2">
              <Input placeholder="New tag name" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addNewTag()} />
              <Button size="icon" variant="outline" onClick={addNewTag} disabled={!newTagName.trim()}><Plus className="w-4 h-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map(tagId => {
                const tag = availableTags.find(t => t.id === tagId);
                return tag ? <Badge key={tagId} variant="secondary" className="cursor-pointer" onClick={() => toggleTag(tagId)}>{tag.name} <X className="w-3 h-3 ml-1" /></Badge> : null;
              })}
            </div>
          </div>

          {/* Badges */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Award className="w-5 h-5" />Badges</h2>
            <Popover open={badgeSearchOpen} onOpenChange={setBadgeSearchOpen}>
              <PopoverTrigger asChild><Button variant="outline" className="w-full justify-start"><Search className="w-4 h-4 mr-2" />Search badges...</Button></PopoverTrigger>
              <PopoverContent className="p-0 w-64">
                <Command>
                  <CommandInput placeholder="Search badges..." value={badgeSearch} onValueChange={setBadgeSearch} />
                  <CommandList>
                    <CommandEmpty>
                      <div className="p-2">
                        <p className="text-sm text-muted-foreground mb-2">No badges found</p>
                        {badgeSearch && <Button size="sm" onClick={addNewBadge} className="w-full gap-2"><Plus className="w-3 h-3" />Add "{badgeSearch}"</Button>}
                      </div>
                    </CommandEmpty>
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
            <div className="flex gap-2">
              <Input placeholder="New badge name" value={newBadgeName} onChange={(e) => setNewBadgeName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addNewBadge()} className="flex-1" />
              <input type="color" value={newBadgeColor} onChange={(e) => setNewBadgeColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
              <Button size="icon" variant="outline" onClick={addNewBadge} disabled={!newBadgeName.trim()}><Plus className="w-4 h-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedBadges.map(badgeId => {
                const badge = availableBadges.find(b => b.id === badgeId);
                return badge ? <Badge key={badgeId} className="cursor-pointer text-white" style={{ backgroundColor: badge.color }} onClick={() => toggleBadge(badgeId)}>{badge.name} <X className="w-3 h-3 ml-1" /></Badge> : null;
              })}
            </div>
          </div>

          {/* SEO Analytics */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">SEO Analytics</h2>
            <div className="flex justify-center py-4">
              <CircularProgress value={seoScore} />
            </div>
            <div className="space-y-2">
              {seoChecklist.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-4 h-4 rounded-full flex items-center justify-center", item.done ? "bg-emerald-500" : "bg-muted")}>
                      {item.done && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={item.done ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
                  </div>
                  <span className={cn("font-medium", item.done ? "text-emerald-500" : "text-muted-foreground")}>+{item.points}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={productSearchOpen} onOpenChange={setProductSearchOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader><DialogTitle>Add Component</DialogTitle><DialogDescription>Search and add products</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Component Type</Label><Select value={selectedComponentType} onValueChange={setSelectedComponentType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{COMPONENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search products..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />{searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin" />}</div>
          </div>
          <div className="flex-1 overflow-auto mt-4 -mx-6 px-6">
            {searchResults.length === 0 ? (
              <div className="text-center py-8"><Package className="w-10 h-10 mx-auto text-muted-foreground mb-2" /><p className="text-sm text-muted-foreground">{searchQuery ? "No products found" : "Search for products"}</p></div>
            ) : (
              <div className="space-y-2">
                {searchResults.map((product) => {
                  const isAdded = components.some(c => c.productId === product.id);
                  return (
                    <div key={product.id} className={`flex items-center gap-3 p-3 rounded-lg border ${isAdded ? "bg-primary/5 border-primary/20" : "hover:bg-muted/50 border-border/50"}`}>
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">{product.images?.[0]?.url ? <img src={product.images[0].url} alt="" className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-muted-foreground" />}</div>
                      <div className="flex-1 min-w-0"><p className="font-medium truncate">{product.name}</p><p className="text-sm text-muted-foreground">{product.primaryCategory.name} {product.brand && `• ${product.brand}`}</p></div>
                      <div className="text-right"><p className="font-semibold">₹{parseFloat(product.price).toLocaleString("en-IN")}</p><p className={`text-xs ${product.isInStock ? "text-emerald-500" : "text-destructive"}`}>{product.isInStock ? "In Stock" : "Out of Stock"}</p></div>
                      <Button size="sm" variant={isAdded ? "secondary" : "default"} onClick={() => !isAdded && addComponent(product)} disabled={isAdded}>{isAdded ? "Added" : "Add"}</Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
