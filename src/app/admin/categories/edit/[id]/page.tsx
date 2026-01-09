"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
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
  Trash2,
  Upload,
  X,
  Sparkles,
  FolderTree,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ParentCategory {
  id: string;
  name: string;
  slug: string;
}

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

export default function CategoryEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [parentCategories, setParentCategories] = useState<ParentCategory[]>([]);
  const imageRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Basic Info
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [parentId, setParentId] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // SEO Fields
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [robotsIndex, setRobotsIndex] = useState(true);
  const [robotsFollow, setRobotsFollow] = useState(true);

  // Fetch category and parent categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, parentRes] = await Promise.all([
          fetch(`/api/admin/categories/${id}`),
          fetch("/api/admin/categories"),
        ]);

        const catData = await catRes.json();
        const parentData = await parentRes.json();

        if (parentRes.ok) {
          setParentCategories(parentData.categories.filter((c: ParentCategory) => c.id !== id && !c.slug.includes("/")));
        }

        if (catRes.ok && catData.category) {
          const c = catData.category;
          setName(c.name);
          setSlug(c.slug);
          setDescription(c.description || "");
          setImageUrl(c.imageUrl || "");
          setImageAlt(c.imageAlt || "");
          setParentId(c.parentId || "");
          setDisplayOrder(c.displayOrder || 0);
          setIsVisible(c.isVisible);
          setIsFeatured(c.isFeatured);
          setSeoTitle(c.seoTitle || "");
          setSeoDescription(c.seoDescription || "");
          setSeoKeywords(c.seoKeywords || "");
          setRobotsIndex(c.robotsIndex ?? true);
          setRobotsFollow(c.robotsFollow ?? true);
        } else {
          toast({ title: "Error", description: "Category not found", variant: "destructive" });
          router.push("/admin/categories");
        }
      } catch {
        toast({ title: "Error", description: "Failed to load category", variant: "destructive" });
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
    formData.append("folder", "categories");

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file);
    if (url) {
      setImageUrl(url);
      setImageAlt(file.name.split(".")[0]);
    }
    setUploading(false);
    if (imageRef.current) imageRef.current.value = "";
  };

  // Auto-generate SEO
  const generateSEO = () => {
    const parentName = parentCategories.find(c => c.id === parentId)?.name || "";

    const title = `${name}${parentName ? ` - ${parentName}` : ""} | Sai Computer Bazar`;
    setSeoTitle(title.slice(0, 60));

    const desc = description || `Shop ${name} at Sai Computer Bazar. Best prices on ${name.toLowerCase()} products.`;
    setSeoDescription(desc.slice(0, 160));

    const keywords = [name, parentName, "buy", "shop", "best price", "SCB"].filter(Boolean).join(", ");
    setSeoKeywords(keywords);

    toast({ title: "SEO Generated", description: "SEO fields auto-filled" });
  };

  // SEO Checklist
  const seoChecklist = useMemo(() => [
    { label: "SEO Title (30-60 chars)", done: seoTitle.length >= 30 && seoTitle.length <= 60, points: 25 },
    { label: "Meta Description (120-160 chars)", done: seoDescription.length >= 120 && seoDescription.length <= 160, points: 25 },
    { label: "Focus Keywords (3+)", done: seoKeywords.split(",").filter(k => k.trim()).length >= 3, points: 20 },
    { label: "Category Image with Alt", done: !!imageUrl && !!imageAlt, points: 15 },
    { label: "Description Added", done: description.length >= 30, points: 15 },
  ], [seoTitle, seoDescription, seoKeywords, imageUrl, imageAlt, description]);

  const seoScore = useMemo(() => seoChecklist.reduce((score, item) => score + (item.done ? item.points : 0), 0), [seoChecklist]);

  const generateJsonLd = () => ({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: name,
    description: seoDescription || description,
    image: imageUrl,
  });

  const handleSave = async () => {
    if (!name || !slug) {
      toast({ title: "Error", description: "Name and slug are required", variant: "destructive" });
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          description: description || null,
          imageUrl: imageUrl || null,
          imageAlt: imageAlt || null,
          parentId: parentId || null,
          displayOrder,
          isVisible,
          isFeatured,
          seoTitle: seoTitle || null,
          seoDescription: seoDescription || null,
          seoKeywords: seoKeywords || null,
          robotsIndex,
          robotsFollow,
          ogTitle: seoTitle || null,
          ogDescription: seoDescription || null,
          ogImage: imageUrl || null,
          twitterTitle: seoTitle || null,
          twitterDescription: seoDescription || null,
          twitterImage: imageUrl || null,
          jsonLd: generateJsonLd(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({ title: "Success", description: "Category updated" });
        router.push("/admin/categories");
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to update category", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok) {
        toast({ title: "Deleted", description: "Category deleted" });
        router.push("/admin/categories");
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
        title="Edit Category"
        subtitle={name}
        backUrl="/admin/categories"
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
              <FolderTree className="w-5 h-5" /> Basic Information
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Category Name *</Label>
                  <Input id="name" className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input id="slug" className="mt-1.5 font-mono text-sm" value={slug} onChange={(e) => setSlug(e.target.value)} />
                  <p className="text-xs text-muted-foreground mt-1">/category/{slug}</p>
                </div>
                <div>
                  <Label htmlFor="order">Display Order</Label>
                  <Input id="order" type="number" className="mt-1.5" value={displayOrder} onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)} />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea className="mt-1.5 h-24" value={description} onChange={(e) => setDescription(e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">{description.length} characters</p>
              </div>
            </div>
          </div>

          {/* Category Image */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Category Image</h2>
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <input ref={imageRef} type="file" accept="image/jpeg,image/jpg,image/png,image/svg+xml,image/webp" onChange={handleImageUpload} className="hidden" />
                <div onClick={() => imageRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                  {uploading ? (
                    <div className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /><span>Uploading...</span></div>
                  ) : (
                    <><Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" /><p className="text-sm text-muted-foreground">Click to upload (Max 2MB)</p></>
                  )}
                </div>
                <Input placeholder="Image alt text" className="mt-2" value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} />
              </div>
              {imageUrl && (
                <div className="relative">
                  <img src={imageUrl} alt={imageAlt} className="w-28 h-28 object-cover rounded-lg border-2 border-primary" />
                  <button onClick={() => { setImageUrl(""); setImageAlt(""); }} className="absolute -top-2 -right-2 p-1 bg-destructive text-white rounded-full"><X className="w-3 h-3" /></button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Organization */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Organization</h2>
            <div className="space-y-4">
              <div>
                <Label>Parent Category</Label>
                <Select value={parentId || "none"} onValueChange={(val) => setParentId(val === "none" ? "" : val)}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="None (Root)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Root category)</SelectItem>
                    {parentCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label>Visible on Store</Label>
                <Switch checked={isVisible} onCheckedChange={setIsVisible} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Featured Category</Label>
                <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
              </div>
            </div>
          </div>

          {/* Robots Settings */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Robots Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Index Page</Label>
                  <p className="text-xs text-muted-foreground">Allow indexing</p>
                </div>
                <Switch checked={robotsIndex} onCheckedChange={setRobotsIndex} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Follow Links</Label>
                  <p className="text-xs text-muted-foreground">Allow following</p>
                </div>
                <Switch checked={robotsFollow} onCheckedChange={setRobotsFollow} />
              </div>
            </div>
          </div>

          {/* SEO Analytics Card */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> SEO Score
              </h2>
              <Button variant="outline" size="sm" onClick={generateSEO}>
                <Sparkles className="w-4 h-4 mr-1" /> Auto
              </Button>
            </div>

            <div className="flex justify-center mb-4">
              <CircularProgress value={seoScore} />
            </div>

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
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. Products in this category will need to be reassigned.</AlertDialogDescription>
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
