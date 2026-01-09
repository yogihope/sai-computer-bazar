"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  Video,
  Youtube,
  Instagram,
  Facebook,
  Link as LinkIcon,
  X,
  Check,
  ChevronsUpDown,
  Sparkles,
  Eye,
  ThumbsUp,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface BadgeOption {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface ProductOption {
  id: string;
  name: string;
  slug: string;
}

interface PrebuiltPCOption {
  id: string;
  name: string;
  slug: string;
}

export default function EditSocialVideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form data
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoType, setVideoType] = useState<"SHORT" | "VIDEO">("VIDEO");
  const [platform, setPlatform] = useState<"YOUTUBE" | "INSTAGRAM" | "FACEBOOK">("YOUTUBE");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [isFeatured, setIsFeatured] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [productId, setProductId] = useState<string>("");
  const [prebuiltPCId, setPrebuiltPCId] = useState<string>("");

  // Options for selects
  const [badges, setBadges] = useState<BadgeOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [prebuiltPCs, setPrebuiltPCs] = useState<PrebuiltPCOption[]>([]);

  // Popover states
  const [badgeOpen, setBadgeOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [prebuiltOpen, setPrebuiltOpen] = useState(false);

  // Fetch video data and options
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [videoRes, badgesRes, productsRes, prebuiltRes] = await Promise.all([
          fetch(`/api/admin/social-videos/${id}`),
          fetch("/api/admin/badges"),
          fetch("/api/admin/products?limit=100"),
          fetch("/api/admin/prebuilt-pcs?limit=100"),
        ]);

        if (badgesRes.ok) {
          const data = await badgesRes.json();
          setBadges(data.badges || []);
        }
        if (productsRes.ok) {
          const data = await productsRes.json();
          setProducts(data.products?.map((p: any) => ({ id: p.id, name: p.name, slug: p.slug })) || []);
        }
        if (prebuiltRes.ok) {
          const data = await prebuiltRes.json();
          setPrebuiltPCs(data.prebuiltPCs?.map((p: any) => ({ id: p.id, name: p.name, slug: p.slug })) || []);
        }

        if (videoRes.ok) {
          const data = await videoRes.json();
          const video = data.video;

          setTitle(video.title);
          setDescription(video.description || "");
          setVideoUrl(video.videoUrl);
          setVideoType(video.videoType);
          setPlatform(video.platform);
          setThumbnailUrl(video.thumbnailUrl || "");
          setStatus(video.status);
          setIsFeatured(video.isFeatured);
          setViewCount(video.viewCount);
          setLikeCount(video.likeCount);
          setSelectedBadges(video.badges?.map((b: any) => b.badge.id) || []);
          setProductId(video.productId || "");
          setPrebuiltPCId(video.prebuiltPCId || "");
        } else {
          toast({ title: "Error", description: "Video not found", variant: "destructive" });
          router.push("/admin/social-videos");
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({ title: "Error", description: "Failed to load video", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast({ title: "Error", description: "Title is required", variant: "destructive" });
      return;
    }
    if (!videoUrl.trim()) {
      toast({ title: "Error", description: "Video URL is required", variant: "destructive" });
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(`/api/admin/social-videos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          videoUrl: videoUrl.trim(),
          videoType,
          platform,
          thumbnailUrl: thumbnailUrl.trim() || null,
          status,
          isFeatured,
          viewCount,
          likeCount,
          badges: selectedBadges,
          productId: productId || null,
          prebuiltPCId: prebuiltPCId || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({ title: "Success", description: "Video updated successfully" });
        router.push("/admin/social-videos");
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to update video", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleBadge = (badgeId: string) => {
    setSelectedBadges(prev =>
      prev.includes(badgeId)
        ? prev.filter(id => id !== badgeId)
        : [...prev, badgeId]
    );
  };

  const getSelectedProduct = () => products.find(p => p.id === productId);
  const getSelectedPrebuilt = () => prebuiltPCs.find(p => p.id === prebuiltPCId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Social Video"
        subtitle="Update video information and settings"
        actions={
          <div className="flex items-center gap-3">
            <Link href="/admin/social-videos">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <a href={videoUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Video
              </Button>
            </a>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Video className="w-5 h-5 text-primary" />
              Video Information
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter video title"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter video description"
                  rows={4}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="videoUrl">Video URL *</Label>
                <div className="relative mt-1.5">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="videoUrl"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=... or https://instagram.com/reel/..."
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Platform *</Label>
                  <Select value={platform} onValueChange={(v) => setPlatform(v as any)}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YOUTUBE">
                        <div className="flex items-center gap-2">
                          <Youtube className="w-4 h-4 text-red-500" />
                          YouTube
                        </div>
                      </SelectItem>
                      <SelectItem value="INSTAGRAM">
                        <div className="flex items-center gap-2">
                          <Instagram className="w-4 h-4 text-pink-500" />
                          Instagram
                        </div>
                      </SelectItem>
                      <SelectItem value="FACEBOOK">
                        <div className="flex items-center gap-2">
                          <Facebook className="w-4 h-4 text-blue-500" />
                          Facebook
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Video Type *</Label>
                  <Select value={videoType} onValueChange={(v) => setVideoType(v as any)}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIDEO">Regular Video</SelectItem>
                      <SelectItem value="SHORT">Short / Reel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Thumbnail */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              Thumbnail
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                <Input
                  id="thumbnailUrl"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://..."
                  className="mt-1.5"
                />
              </div>

              {thumbnailUrl && (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                  <img
                    src={thumbnailUrl}
                    alt="Thumbnail preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Engagement Stats */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Engagement Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="viewCount">View Count</Label>
                <div className="relative mt-1.5">
                  <Eye className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="viewCount"
                    type="number"
                    value={viewCount}
                    onChange={(e) => setViewCount(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="likeCount">Like Count</Label>
                <div className="relative mt-1.5">
                  <ThumbsUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="likeCount"
                    type="number"
                    value={likeCount}
                    onChange={(e) => setLikeCount(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6">
            <h3 className="font-semibold mb-4">Status</h3>
            <div className="space-y-4">
              <div>
                <Label>Visibility</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="featured">Featured Video</Label>
                <Switch
                  id="featured"
                  checked={isFeatured}
                  onCheckedChange={setIsFeatured}
                />
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6">
            <h3 className="font-semibold mb-4">Badges</h3>
            <Popover open={badgeOpen} onOpenChange={setBadgeOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {selectedBadges.length > 0
                    ? `${selectedBadges.length} badge(s) selected`
                    : "Select badges"}
                  <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search badges..." />
                  <CommandList>
                    <CommandEmpty>No badges found.</CommandEmpty>
                    <CommandGroup>
                      {badges.map((badge) => (
                        <CommandItem
                          key={badge.id}
                          onSelect={() => toggleBadge(badge.id)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedBadges.includes(badge.id) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: badge.color }}
                          />
                          {badge.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {selectedBadges.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedBadges.map((badgeId) => {
                  const badge = badges.find(b => b.id === badgeId);
                  if (!badge) return null;
                  return (
                    <Badge
                      key={badge.id}
                      variant="outline"
                      style={{ borderColor: badge.color, color: badge.color }}
                      className="pr-1"
                    >
                      {badge.name}
                      <button
                        onClick={() => toggleBadge(badge.id)}
                        className="ml-1 hover:bg-muted rounded p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          {/* Link to Product */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6">
            <h3 className="font-semibold mb-4">Link to Product</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Optional: Link this video to a product or prebuilt PC
            </p>

            <div className="space-y-4">
              <div>
                <Label>Product</Label>
                <Popover open={productOpen} onOpenChange={setProductOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between mt-1.5">
                      {getSelectedProduct()?.name || "Select product"}
                      <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search products..." />
                      <CommandList>
                        <CommandEmpty>No products found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem onSelect={() => { setProductId(""); setProductOpen(false); }}>
                            <Check className={cn("mr-2 h-4 w-4", !productId ? "opacity-100" : "opacity-0")} />
                            None
                          </CommandItem>
                          {products.map((product) => (
                            <CommandItem
                              key={product.id}
                              onSelect={() => {
                                setProductId(product.id);
                                setPrebuiltPCId("");
                                setProductOpen(false);
                              }}
                            >
                              <Check
                                className={cn("mr-2 h-4 w-4", productId === product.id ? "opacity-100" : "opacity-0")}
                              />
                              {product.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="text-center text-xs text-muted-foreground">OR</div>

              <div>
                <Label>Prebuilt PC</Label>
                <Popover open={prebuiltOpen} onOpenChange={setPrebuiltOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between mt-1.5">
                      {getSelectedPrebuilt()?.name || "Select prebuilt PC"}
                      <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search prebuilt PCs..." />
                      <CommandList>
                        <CommandEmpty>No prebuilt PCs found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem onSelect={() => { setPrebuiltPCId(""); setPrebuiltOpen(false); }}>
                            <Check className={cn("mr-2 h-4 w-4", !prebuiltPCId ? "opacity-100" : "opacity-0")} />
                            None
                          </CommandItem>
                          {prebuiltPCs.map((pc) => (
                            <CommandItem
                              key={pc.id}
                              onSelect={() => {
                                setPrebuiltPCId(pc.id);
                                setProductId("");
                                setPrebuiltOpen(false);
                              }}
                            >
                              <Check
                                className={cn("mr-2 h-4 w-4", prebuiltPCId === pc.id ? "opacity-100" : "opacity-0")}
                              />
                              {pc.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
