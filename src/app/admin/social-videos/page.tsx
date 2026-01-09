"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Loader2,
  RefreshCw,
  Video,
  Eye,
  ThumbsUp,
  Play,
  ExternalLink,
  CheckCircle,
  FileEdit,
  Youtube,
  Instagram,
  Facebook,
  Clapperboard,
  Film,
  Star,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SocialVideo {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  videoType: "SHORT" | "VIDEO";
  platform: "YOUTUBE" | "INSTAGRAM" | "FACEBOOK";
  thumbnailUrl: string | null;
  status: "DRAFT" | "PUBLISHED";
  isFeatured: boolean;
  viewCount: number;
  likeCount: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  product: { id: string; name: string; slug: string } | null;
  prebuiltPC: { id: string; name: string; slug: string } | null;
  badges: { badge: { id: string; name: string; slug: string; color: string } }[];
}

interface Stats {
  total: number;
  published: number;
  draft: number;
  youtube: number;
  instagram: number;
  facebook: number;
  shorts: number;
  videos: number;
  totalViews: number;
  totalLikes: number;
}

const platformIcons = {
  YOUTUBE: Youtube,
  INSTAGRAM: Instagram,
  FACEBOOK: Facebook,
};

const platformColors = {
  YOUTUBE: "bg-red-500",
  INSTAGRAM: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400",
  FACEBOOK: "bg-blue-600",
};

export default function SocialVideosPage() {
  const [videos, setVideos] = useState<SocialVideo[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    published: 0,
    draft: 0,
    youtube: 0,
    instagram: 0,
    facebook: 0,
    shorts: 0,
    videos: 0,
    totalViews: 0,
    totalLikes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (platformFilter !== "all") params.set("platform", platformFilter);
      if (typeFilter !== "all") params.set("videoType", typeFilter);

      const res = await fetch(`/api/admin/social-videos?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setVideos(data.videos);
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to fetch videos", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [searchQuery, statusFilter, platformFilter, typeFilter]);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/social-videos/${deleteId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        setVideos(prev => prev.filter(v => v.id !== deleteId));
        toast({ title: "Deleted", description: "Video deleted successfully" });
        fetchVideos(); // Refresh stats
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete video", variant: "destructive" });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleQuickStatusToggle = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
      const res = await fetch(`/api/admin/social-videos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setVideos(prev => prev.map(v => v.id === id ? { ...v, status: newStatus as "DRAFT" | "PUBLISHED" } : v));
        toast({ title: "Updated", description: `Video ${newStatus === "PUBLISHED" ? "published" : "unpublished"}` });
      }
    } catch {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const getVideoLink = (url: string, platform: string) => {
    return url;
  };

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Social Videos"
          subtitle="Manage your video content across YouTube, Instagram, and Facebook"
          actions={
            <Link href="/admin/social-videos/create">
              <Button className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                <Plus className="w-4 h-4" />
                Add Video
              </Button>
            </Link>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Video className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Videos</p>
              </div>
            </div>
          </div>
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.published}</p>
                <p className="text-xs text-muted-foreground">Published</p>
              </div>
            </div>
          </div>
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <Eye className="w-5 h-5 text-cyan-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatNumber(stats.totalViews)}</p>
                <p className="text-xs text-muted-foreground">Total Views</p>
              </div>
            </div>
          </div>
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <ThumbsUp className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatNumber(stats.totalLikes)}</p>
                <p className="text-xs text-muted-foreground">Total Likes</p>
              </div>
            </div>
          </div>
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-500/20">
                <Clapperboard className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.shorts}</p>
                <p className="text-xs text-muted-foreground">Shorts/Reels</p>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <Youtube className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.youtube}</p>
                <p className="text-xs text-muted-foreground">YouTube Videos</p>
              </div>
            </div>
          </div>
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-500/20">
                <Instagram className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.instagram}</p>
                <p className="text-xs text-muted-foreground">Instagram Videos</p>
              </div>
            </div>
          </div>
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Facebook className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.facebook}</p>
                <p className="text-xs text-muted-foreground">Facebook Videos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search videos..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
              </SelectContent>
            </Select>

            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="YOUTUBE">YouTube</SelectItem>
                <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                <SelectItem value="FACEBOOK">Facebook</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="VIDEO">Video</SelectItem>
                <SelectItem value="SHORT">Short/Reel</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => fetchVideos()} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Video Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : videos.length === 0 ? (
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-12 text-center">
            <Video className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No videos found</p>
            <Link href="/admin/social-videos/create">
              <Button>Add Your First Video</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos.map((video) => {
              const PlatformIcon = platformIcons[video.platform];
              return (
                <Card
                  key={video.id}
                  className="bg-card/50 backdrop-blur-xl border-border/50 hover:border-primary/50 transition-all overflow-hidden group"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                        <Video className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}

                    {/* Play Button Overlay */}
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
                        <Play className="w-6 h-6 text-primary-foreground ml-1" />
                      </div>
                    </a>

                    {/* Platform Badge */}
                    <div className={cn(
                      "absolute top-2 left-2 p-1.5 rounded-lg text-white",
                      platformColors[video.platform]
                    )}>
                      <PlatformIcon className="w-4 h-4" />
                    </div>

                    {/* Type Badge */}
                    <Badge
                      className={cn(
                        "absolute top-2 right-2",
                        video.videoType === "SHORT"
                          ? "bg-violet-500/90 text-white"
                          : "bg-blue-500/90 text-white"
                      )}
                    >
                      {video.videoType === "SHORT" ? "Short" : "Video"}
                    </Badge>

                    {/* Status Badge */}
                    <Badge
                      className={cn(
                        "absolute bottom-2 left-2",
                        video.status === "PUBLISHED"
                          ? "bg-emerald-500/90 text-white"
                          : "bg-muted/90 text-muted-foreground"
                      )}
                    >
                      {video.status === "PUBLISHED" ? "Published" : "Draft"}
                    </Badge>

                    {/* Featured Star */}
                    {video.isFeatured && (
                      <div className="absolute bottom-2 right-2">
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4">
                    {/* Title */}
                    <h3 className="font-semibold line-clamp-2 mb-2 min-h-[48px]">
                      {video.title}
                    </h3>

                    {/* Badges */}
                    {video.badges.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {video.badges.map(({ badge }) => (
                          <Badge
                            key={badge.id}
                            variant="outline"
                            style={{ borderColor: badge.color, color: badge.color }}
                            className="text-xs"
                          >
                            {badge.name}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Linked Product/PC */}
                    {(video.product || video.prebuiltPC) && (
                      <div className="mb-3">
                        <Badge variant="secondary" className="text-xs">
                          {video.product ? `Product: ${video.product.name}` : `PC: ${video.prebuiltPC?.name}`}
                        </Badge>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {formatNumber(video.viewCount)}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        {formatNumber(video.likeCount)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/social-videos/edit/${video.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="w-3.5 h-3.5 mr-1" />
                            Edit
                          </Button>
                        </Link>
                        <a href={video.videoUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </a>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleQuickStatusToggle(video.id, video.status)}>
                            {video.status === "PUBLISHED" ? (
                              <>
                                <FileEdit className="w-4 h-4 mr-2" />
                                Unpublish
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Publish
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteId(video.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The video will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
