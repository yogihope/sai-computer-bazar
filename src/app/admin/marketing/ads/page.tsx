"use client";

import { useEffect, useState, useCallback } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Image,
  Eye,
  EyeOff,
  Ticket,
  Package,
  Layers,
  Monitor,
  FileText,
  Video,
  Link as LinkIcon,
  MousePointerClick,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface Advertisement {
  id: string;
  name: string;
  title: string;
  description: string | null;
  adType: string;
  couponId: string | null;
  productId: string | null;
  categoryId: string | null;
  prebuiltPCId: string | null;
  blogId: string | null;
  socialVideoId: string | null;
  customLink: string | null;
  imageUrl: string | null;
  backgroundColor: string | null;
  textColor: string | null;
  accentColor: string | null;
  position: string;
  showOnPages: string | null;
  buttonText: string | null;
  startDate: string | null;
  endDate: string | null;
  priority: number;
  isActive: boolean;
  impressions: number;
  clicks: number;
  createdAt: string;
  coupon?: { id: string; code: string; name: string } | null;
  product?: { id: string; name: string; slug: string } | null;
  category?: { id: string; name: string; slug: string } | null;
  prebuiltPC?: { id: string; name: string; slug: string } | null;
  blog?: { id: string; title: string; slug: string } | null;
  socialVideo?: { id: string; title: string } | null;
}

interface SelectOption {
  id: string;
  name?: string;
  title?: string;
  code?: string;
  slug?: string;
}

const adTypes = [
  { value: "COUPON", label: "Coupon", icon: Ticket },
  { value: "PRODUCT", label: "Product", icon: Package },
  { value: "CATEGORY", label: "Category", icon: Layers },
  { value: "PREBUILT_PC", label: "Prebuilt PC", icon: Monitor },
  { value: "BLOG", label: "Blog", icon: FileText },
  { value: "SOCIAL_VIDEO", label: "Social Video", icon: Video },
  { value: "CUSTOM", label: "Custom Link", icon: LinkIcon },
];

const positions = [
  { value: "SIDEBAR", label: "Sidebar" },
  { value: "BANNER_TOP", label: "Banner Top" },
  { value: "BANNER_BOTTOM", label: "Banner Bottom" },
  { value: "POPUP", label: "Popup" },
  { value: "INLINE", label: "Inline" },
];

const defaultAd: Partial<Advertisement> = {
  name: "",
  title: "",
  description: "",
  adType: "PRODUCT",
  imageUrl: "",
  backgroundColor: "#f3f4f6",
  textColor: "#000000",
  accentColor: "#3b82f6",
  position: "SIDEBAR",
  buttonText: "Shop Now",
  priority: 0,
  isActive: true,
};

export default function AdsPage() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Partial<Advertisement> | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Options for selects
  const [coupons, setCoupons] = useState<SelectOption[]>([]);
  const [products, setProducts] = useState<SelectOption[]>([]);
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [prebuiltPCs, setPrebuiltPCs] = useState<SelectOption[]>([]);
  const [blogs, setBlogs] = useState<SelectOption[]>([]);
  const [socialVideos, setSocialVideos] = useState<SelectOption[]>([]);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ads");
      const data = await res.json();
      if (res.ok) {
        setAds(data.ads);
      }
    } catch (error) {
      console.error("Error fetching ads:", error);
      toast.error("Failed to fetch advertisements");
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = useCallback(async () => {
    try {
      const [couponsRes, productsRes, categoriesRes, prebuiltRes, blogsRes, videosRes] = await Promise.all([
        fetch("/api/admin/coupons?limit=100"),
        fetch("/api/admin/products?limit=100&status=PUBLISHED"),
        fetch("/api/admin/categories?limit=100"),
        fetch("/api/admin/prebuilt-pcs?limit=100&status=PUBLISHED"),
        fetch("/api/admin/blogs?limit=100&status=PUBLISHED"),
        fetch("/api/admin/social-videos?limit=100&status=PUBLISHED"),
      ]);

      if (couponsRes.ok) {
        const data = await couponsRes.json();
        setCoupons(data.coupons || []);
      }
      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data.products || []);
      }
      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data.categories || []);
      }
      if (prebuiltRes.ok) {
        const data = await prebuiltRes.json();
        setPrebuiltPCs(data.prebuiltPCs || []);
      }
      if (blogsRes.ok) {
        const data = await blogsRes.json();
        setBlogs(data.blogs || []);
      }
      if (videosRes.ok) {
        const data = await videosRes.json();
        setSocialVideos(data.videos || []);
      }
    } catch (error) {
      console.error("Error fetching options:", error);
    }
  }, []);

  useEffect(() => {
    fetchAds();
    fetchOptions();
  }, [fetchOptions]);

  const handleCreate = () => {
    setEditingAd({ ...defaultAd });
    setDialogOpen(true);
  };

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;

    try {
      const res = await fetch(`/api/admin/ads/${deletingId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setAds(ads.filter((a) => a.id !== deletingId));
        toast.success("Advertisement deleted");
      } else {
        toast.error("Failed to delete advertisement");
      }
    } catch (error) {
      console.error("Error deleting ad:", error);
      toast.error("Failed to delete advertisement");
    } finally {
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const handleSave = async () => {
    if (!editingAd?.name || !editingAd?.title || !editingAd?.adType) {
      toast.error("Name, title, and type are required");
      return;
    }

    setSaving(true);
    try {
      const isEditing = !!editingAd.id;
      const url = isEditing ? `/api/admin/ads/${editingAd.id}` : "/api/admin/ads";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingAd),
      });

      if (res.ok) {
        await fetchAds(); // Refresh to get relations
        toast.success(isEditing ? "Advertisement updated" : "Advertisement created");
        setDialogOpen(false);
        setEditingAd(null);
      } else {
        toast.error("Failed to save advertisement");
      }
    } catch (error) {
      console.error("Error saving ad:", error);
      toast.error("Failed to save advertisement");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (ad: Advertisement) => {
    try {
      const res = await fetch(`/api/admin/ads/${ad.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...ad, isActive: !ad.isActive }),
      });

      if (res.ok) {
        setAds(ads.map((a) => (a.id === ad.id ? { ...a, isActive: !a.isActive } : a)));
        toast.success(ad.isActive ? "Ad deactivated" : "Ad activated");
      }
    } catch (error) {
      console.error("Error toggling ad:", error);
      toast.error("Failed to update advertisement");
    }
  };

  const getAdTypeIcon = (type: string) => {
    const found = adTypes.find((t) => t.value === type);
    if (found) {
      const Icon = found.icon;
      return <Icon className="w-4 h-4" />;
    }
    return <Package className="w-4 h-4" />;
  };

  const getLinkedItemName = (ad: Advertisement) => {
    switch (ad.adType) {
      case "COUPON":
        return ad.coupon?.name || ad.coupon?.code || "No coupon linked";
      case "PRODUCT":
        return ad.product?.name || "No product linked";
      case "CATEGORY":
        return ad.category?.name || "No category linked";
      case "PREBUILT_PC":
        return ad.prebuiltPC?.name || "No prebuilt PC linked";
      case "BLOG":
        return ad.blog?.title || "No blog linked";
      case "SOCIAL_VIDEO":
        return ad.socialVideo?.title || "No video linked";
      case "CUSTOM":
        return ad.customLink || "No link set";
      default:
        return "Unknown";
    }
  };

  const renderReferenceSelect = () => {
    if (!editingAd) return null;

    switch (editingAd.adType) {
      case "COUPON":
        return (
          <div className="space-y-2">
            <Label>Select Coupon</Label>
            <Select
              value={editingAd.couponId || ""}
              onValueChange={(v) => setEditingAd({ ...editingAd, couponId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a coupon" />
              </SelectTrigger>
              <SelectContent>
                {coupons.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name || c.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case "PRODUCT":
        return (
          <div className="space-y-2">
            <Label>Select Product</Label>
            <Select
              value={editingAd.productId || ""}
              onValueChange={(v) => setEditingAd({ ...editingAd, productId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case "CATEGORY":
        return (
          <div className="space-y-2">
            <Label>Select Category</Label>
            <Select
              value={editingAd.categoryId || ""}
              onValueChange={(v) => setEditingAd({ ...editingAd, categoryId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case "PREBUILT_PC":
        return (
          <div className="space-y-2">
            <Label>Select Prebuilt PC</Label>
            <Select
              value={editingAd.prebuiltPCId || ""}
              onValueChange={(v) => setEditingAd({ ...editingAd, prebuiltPCId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a prebuilt PC" />
              </SelectTrigger>
              <SelectContent>
                {prebuiltPCs.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case "BLOG":
        return (
          <div className="space-y-2">
            <Label>Select Blog</Label>
            <Select
              value={editingAd.blogId || ""}
              onValueChange={(v) => setEditingAd({ ...editingAd, blogId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a blog" />
              </SelectTrigger>
              <SelectContent>
                {blogs.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case "SOCIAL_VIDEO":
        return (
          <div className="space-y-2">
            <Label>Select Social Video</Label>
            <Select
              value={editingAd.socialVideoId || ""}
              onValueChange={(v) => setEditingAd({ ...editingAd, socialVideoId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a video" />
              </SelectTrigger>
              <SelectContent>
                {socialVideos.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case "CUSTOM":
        return (
          <div className="space-y-2">
            <Label>Custom Link</Label>
            <Input
              value={editingAd.customLink || ""}
              onChange={(e) => setEditingAd({ ...editingAd, customLink: e.target.value })}
              placeholder="https://example.com"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Advertisements"
        subtitle="Manage sidebar ads and promotions"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Create Ad
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : ads.length === 0 ? (
        <Card className="bg-card/50 backdrop-blur-xl border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Image className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Advertisements</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first advertisement to promote products, coupons, or content
            </p>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Create Ad
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {ads.map((ad) => (
            <Card key={ad.id} className="bg-card/50 backdrop-blur-xl border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {ad.imageUrl ? (
                    <div className="w-32 h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div
                      className="w-32 h-32 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: ad.backgroundColor || "#f3f4f6" }}
                    >
                      {getAdTypeIcon(ad.adType)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">{ad.name}</p>
                        <h3 className="font-semibold text-lg">{ad.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{getLinkedItemName(ad)}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <Badge variant={ad.isActive ? "default" : "secondary"}>
                            {ad.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="outline">{adTypes.find((t) => t.value === ad.adType)?.label}</Badge>
                          <Badge variant="outline">{positions.find((p) => p.value === ad.position)?.label}</Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <BarChart3 className="w-4 h-4" />
                            {ad.impressions.toLocaleString()} views
                          </span>
                          <span className="flex items-center gap-1">
                            <MousePointerClick className="w-4 h-4" />
                            {ad.clicks.toLocaleString()} clicks
                          </span>
                          {ad.impressions > 0 && (
                            <span>
                              CTR: {((ad.clicks / ad.impressions) * 100).toFixed(2)}%
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => toggleActive(ad)}>
                          {ad.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(ad)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(ad.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAd?.id ? "Edit Advertisement" : "Create Advertisement"}</DialogTitle>
            <DialogDescription>Configure the advertisement details</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Internal Name *</Label>
                <Input
                  id="name"
                  value={editingAd?.name || ""}
                  onChange={(e) => setEditingAd({ ...editingAd, name: e.target.value })}
                  placeholder="Summer Sale Banner"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Display Title *</Label>
                <Input
                  id="title"
                  value={editingAd?.title || ""}
                  onChange={(e) => setEditingAd({ ...editingAd, title: e.target.value })}
                  placeholder="Summer Sale - 50% Off!"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editingAd?.description || ""}
                onChange={(e) => setEditingAd({ ...editingAd, description: e.target.value })}
                placeholder="Optional description..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ad Type *</Label>
                <Select
                  value={editingAd?.adType || "PRODUCT"}
                  onValueChange={(v) => setEditingAd({
                    ...editingAd,
                    adType: v,
                    couponId: null,
                    productId: null,
                    categoryId: null,
                    prebuiltPCId: null,
                    blogId: null,
                    socialVideoId: null,
                    customLink: null,
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {adTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Position</Label>
                <Select
                  value={editingAd?.position || "SIDEBAR"}
                  onValueChange={(v) => setEditingAd({ ...editingAd, position: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((pos) => (
                      <SelectItem key={pos.value} value={pos.value}>
                        {pos.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {renderReferenceSelect()}

            <ImageUpload
              label="Ad Image"
              value={editingAd?.imageUrl || ""}
              onChange={(url) => setEditingAd({ ...editingAd, imageUrl: url })}
              folder="ads"
              placeholder="Upload ad image"
            />

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={editingAd?.backgroundColor || "#f3f4f6"}
                    onChange={(e) => setEditingAd({ ...editingAd, backgroundColor: e.target.value })}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={editingAd?.backgroundColor || "#f3f4f6"}
                    onChange={(e) => setEditingAd({ ...editingAd, backgroundColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={editingAd?.textColor || "#000000"}
                    onChange={(e) => setEditingAd({ ...editingAd, textColor: e.target.value })}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={editingAd?.textColor || "#000000"}
                    onChange={(e) => setEditingAd({ ...editingAd, textColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={editingAd?.accentColor || "#3b82f6"}
                    onChange={(e) => setEditingAd({ ...editingAd, accentColor: e.target.value })}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={editingAd?.accentColor || "#3b82f6"}
                    onChange={(e) => setEditingAd({ ...editingAd, accentColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="buttonText">Button Text</Label>
                <Input
                  id="buttonText"
                  value={editingAd?.buttonText || ""}
                  onChange={(e) => setEditingAd({ ...editingAd, buttonText: e.target.value })}
                  placeholder="Shop Now"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  value={editingAd?.priority || 0}
                  onChange={(e) => setEditingAd({ ...editingAd, priority: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <Label htmlFor="isActive">Active</Label>
                <p className="text-sm text-muted-foreground">Show this ad on the website</p>
              </div>
              <Switch
                id="isActive"
                checked={editingAd?.isActive ?? true}
                onCheckedChange={(checked) => setEditingAd({ ...editingAd, isActive: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingAd?.id ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Advertisement?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The advertisement will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
