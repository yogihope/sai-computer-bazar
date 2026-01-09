"use client";

import { useEffect, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Home,
  Monitor,
  Image,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface HeroBanner {
  id: string;
  location: "HOME" | "PREBUILT_PC";
  title: string;
  subtitle: string | null;
  description: string | null;
  imageUrl: string | null;
  mobileImageUrl: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  textColor: string | null;
  overlayColor: string | null;
  textAlign: string | null;
  badgeText: string | null;
  badgeColor: string | null;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

const defaultBanner: Partial<HeroBanner> = {
  location: "HOME",
  title: "",
  subtitle: "",
  description: "",
  imageUrl: "",
  mobileImageUrl: "",
  buttonText: "Shop Now",
  buttonLink: "/products",
  textColor: "#ffffff",
  overlayColor: "rgba(0,0,0,0.5)",
  textAlign: "left",
  badgeText: "",
  badgeColor: "#ef4444",
  isActive: true,
  sortOrder: 0,
};

export default function HeroBannersPage() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"HOME" | "PREBUILT_PC">("HOME");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Partial<HeroBanner> | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/hero-banners");
      const data = await res.json();
      if (res.ok) {
        setBanners(data.banners);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
      toast.error("Failed to fetch banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleCreate = () => {
    setEditingBanner({ ...defaultBanner, location: activeTab });
    setDialogOpen(true);
  };

  const handleEdit = (banner: HeroBanner) => {
    setEditingBanner(banner);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;

    try {
      const res = await fetch(`/api/admin/hero-banners/${deletingId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setBanners(banners.filter((b) => b.id !== deletingId));
        toast.success("Banner deleted");
      } else {
        toast.error("Failed to delete banner");
      }
    } catch (error) {
      console.error("Error deleting banner:", error);
      toast.error("Failed to delete banner");
    } finally {
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const handleSave = async () => {
    if (!editingBanner?.title) {
      toast.error("Title is required");
      return;
    }

    setSaving(true);
    try {
      const isEditing = !!editingBanner.id;
      const url = isEditing
        ? `/api/admin/hero-banners/${editingBanner.id}`
        : "/api/admin/hero-banners";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingBanner),
      });

      if (res.ok) {
        const data = await res.json();
        if (isEditing) {
          setBanners(banners.map((b) => (b.id === data.banner.id ? data.banner : b)));
        } else {
          setBanners([...banners, data.banner]);
        }
        toast.success(isEditing ? "Banner updated" : "Banner created");
        setDialogOpen(false);
        setEditingBanner(null);
      } else {
        toast.error("Failed to save banner");
      }
    } catch (error) {
      console.error("Error saving banner:", error);
      toast.error("Failed to save banner");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (banner: HeroBanner) => {
    try {
      const res = await fetch(`/api/admin/hero-banners/${banner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...banner, isActive: !banner.isActive }),
      });

      if (res.ok) {
        setBanners(banners.map((b) =>
          b.id === banner.id ? { ...b, isActive: !b.isActive } : b
        ));
        toast.success(banner.isActive ? "Banner deactivated" : "Banner activated");
      }
    } catch (error) {
      console.error("Error toggling banner:", error);
      toast.error("Failed to update banner");
    }
  };

  const filteredBanners = banners.filter((b) => b.location === activeTab);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hero Banners"
        subtitle="Manage hero sections for Home and Prebuilt PC pages"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Banner
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "HOME" | "PREBUILT_PC")}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="HOME" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Home Page
          </TabsTrigger>
          <TabsTrigger value="PREBUILT_PC" className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Prebuilt PC
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredBanners.length === 0 ? (
            <Card className="bg-card/50 backdrop-blur-xl border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Image className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Banners</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first hero banner for the {activeTab === "HOME" ? "Home" : "Prebuilt PC"} page
                </p>
                <Button onClick={handleCreate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Banner
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredBanners.map((banner) => (
                <Card key={banner.id} className="bg-card/50 backdrop-blur-xl border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {banner.imageUrl ? (
                        <div className="w-48 h-28 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={banner.imageUrl}
                            alt={banner.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-48 h-28 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <Image className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-lg">{banner.title}</h3>
                            {banner.subtitle && (
                              <p className="text-sm text-muted-foreground mt-1">{banner.subtitle}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={banner.isActive ? "default" : "secondary"}>
                                {banner.isActive ? "Active" : "Inactive"}
                              </Badge>
                              {banner.badgeText && (
                                <Badge style={{ backgroundColor: banner.badgeColor || "#ef4444" }}>
                                  {banner.badgeText}
                                </Badge>
                              )}
                              {banner.buttonText && (
                                <Badge variant="outline">{banner.buttonText}</Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleActive(banner)}
                            >
                              {banner.isActive ? (
                                <Eye className="w-4 h-4" />
                              ) : (
                                <EyeOff className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(banner)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(banner.id)}
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
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBanner?.id ? "Edit Banner" : "Create Banner"}
            </DialogTitle>
            <DialogDescription>
              Configure the hero banner for {editingBanner?.location === "HOME" ? "Home" : "Prebuilt PC"} page
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={editingBanner?.title || ""}
                  onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                  placeholder="Build Your Dream PC"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={editingBanner?.subtitle || ""}
                  onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                  placeholder="Premium components at best prices"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editingBanner?.description || ""}
                onChange={(e) => setEditingBanner({ ...editingBanner, description: e.target.value })}
                placeholder="Optional longer description..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ImageUpload
                label="Desktop Image"
                value={editingBanner?.imageUrl || ""}
                onChange={(url) => setEditingBanner({ ...editingBanner, imageUrl: url })}
                folder="banners"
                placeholder="Upload desktop banner image"
              />
              <ImageUpload
                label="Mobile Image (Optional)"
                value={editingBanner?.mobileImageUrl || ""}
                onChange={(url) => setEditingBanner({ ...editingBanner, mobileImageUrl: url })}
                folder="banners"
                placeholder="Upload mobile banner image"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="buttonText">Button Text</Label>
                <Input
                  id="buttonText"
                  value={editingBanner?.buttonText || ""}
                  onChange={(e) => setEditingBanner({ ...editingBanner, buttonText: e.target.value })}
                  placeholder="Shop Now"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buttonLink">Button Link</Label>
                <Input
                  id="buttonLink"
                  value={editingBanner?.buttonLink || ""}
                  onChange={(e) => setEditingBanner({ ...editingBanner, buttonLink: e.target.value })}
                  placeholder="/products"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="textColor">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="textColor"
                    type="color"
                    value={editingBanner?.textColor || "#ffffff"}
                    onChange={(e) => setEditingBanner({ ...editingBanner, textColor: e.target.value })}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={editingBanner?.textColor || "#ffffff"}
                    onChange={(e) => setEditingBanner({ ...editingBanner, textColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="textAlign">Text Align</Label>
                <Select
                  value={editingBanner?.textAlign || "left"}
                  onValueChange={(v) => setEditingBanner({ ...editingBanner, textAlign: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={editingBanner?.sortOrder || 0}
                  onChange={(e) => setEditingBanner({ ...editingBanner, sortOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="badgeText">Badge Text (Optional)</Label>
                <Input
                  id="badgeText"
                  value={editingBanner?.badgeText || ""}
                  onChange={(e) => setEditingBanner({ ...editingBanner, badgeText: e.target.value })}
                  placeholder="New, Sale, Limited"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="badgeColor">Badge Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="badgeColor"
                    type="color"
                    value={editingBanner?.badgeColor || "#ef4444"}
                    onChange={(e) => setEditingBanner({ ...editingBanner, badgeColor: e.target.value })}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={editingBanner?.badgeColor || "#ef4444"}
                    onChange={(e) => setEditingBanner({ ...editingBanner, badgeColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <Label htmlFor="isActive">Active</Label>
                <p className="text-sm text-muted-foreground">Show this banner on the website</p>
              </div>
              <Switch
                id="isActive"
                checked={editingBanner?.isActive ?? true}
                onCheckedChange={(checked) => setEditingBanner({ ...editingBanner, isActive: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingBanner?.id ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Banner?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The banner will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
