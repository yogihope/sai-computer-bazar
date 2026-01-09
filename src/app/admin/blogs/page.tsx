"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  FileText,
  Clock,
  Star,
  StarOff,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FolderPlus,
  TrendingUp,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { SeoScoreBadge } from "@/components/admin/SeoScoreBadge";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  authorName: string;
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED";
  isFeatured: boolean;
  publishedAt: string | null;
  scheduledAt: string | null;
  readingTime: number;
  viewCount: number;
  seoScore: number;
  createdAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
    color: string;
  } | null;
  tags: { id: string; name: string; slug: string }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  _count: { blogs: number };
}

interface Stats {
  total: number;
  published: number;
  draft: number;
  scheduled: number;
  featured: number;
  totalViews: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    published: 0,
    draft: 0,
    scheduled: 0,
    featured: 0,
    totalViews: 0,
  });
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");

  // Modal states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    id: "",
    name: "",
    description: "",
    color: "#6366f1",
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchBlogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (categoryFilter !== "all") params.append("categoryId", categoryFilter);
      if (featuredFilter !== "all") params.append("featured", featuredFilter);

      const res = await fetch(`/api/admin/blogs?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setBlogs(data.blogs);
        setCategories(data.categories);
        setStats(data.stats);
        setPagination(data.pagination);
      } else {
        toast.error(data.error || "Failed to fetch blogs");
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error("Failed to fetch blogs");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery, statusFilter, categoryFilter, featuredFilter]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page !== 1) {
        setPagination((prev) => ({ ...prev, page: 1 }));
      } else {
        fetchBlogs();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleDelete = async () => {
    if (!selectedBlog) return;

    try {
      const res = await fetch(`/api/admin/blogs/${selectedBlog.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Blog deleted successfully");
        setShowDeleteDialog(false);
        setSelectedBlog(null);
        fetchBlogs();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete blog");
      }
    } catch (error) {
      toast.error("Failed to delete blog");
    }
  };

  const handleToggleFeatured = async (blog: Blog) => {
    try {
      const res = await fetch(`/api/admin/blogs/${blog.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !blog.isFeatured }),
      });

      if (res.ok) {
        toast.success(blog.isFeatured ? "Removed from featured" : "Added to featured");
        fetchBlogs();
      } else {
        toast.error("Failed to update blog");
      }
    } catch (error) {
      toast.error("Failed to update blog");
    }
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setIsSaving(true);
    try {
      const method = categoryForm.id ? "PUT" : "POST";
      const res = await fetch("/api/admin/blog-categories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryForm),
      });

      if (res.ok) {
        toast.success(categoryForm.id ? "Category updated" : "Category created");
        setCategoryForm({ id: "", name: "", description: "", color: "#6366f1" });
        fetchBlogs();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save category");
      }
    } catch (error) {
      toast.error("Failed to save category");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/blog-categories?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Category deleted");
        fetchBlogs();
      } else {
        const data = await res.json();
        toast.error(data.error || "Cannot delete category");
      }
    } catch (error) {
      toast.error("Failed to delete category");
    }
  };

  const openDeleteDialog = (blog: Blog) => {
    setSelectedBlog(blog);
    setShowDeleteDialog(true);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PUBLISHED: "bg-emerald-500/20 text-emerald-500",
      DRAFT: "bg-amber-500/20 text-amber-500",
      SCHEDULED: "bg-blue-500/20 text-blue-500",
      ARCHIVED: "bg-gray-500/20 text-gray-500",
    };
    return styles[status] || styles.DRAFT;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setFeaturedFilter("all");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blog Management"
        subtitle="Create and manage SEO-optimized blog posts"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowCategoryModal(true)}>
              <FolderPlus className="w-4 h-4 mr-2" />
              Categories
            </Button>
            <Link href="/admin/blogs/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Blog
              </Button>
            </Link>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total", value: stats.total, icon: FileText, color: "text-primary", bgColor: "bg-primary/10" },
          { label: "Published", value: stats.published, icon: CheckCircle2, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
          { label: "Draft", value: stats.draft, icon: AlertCircle, color: "text-amber-500", bgColor: "bg-amber-500/10" },
          { label: "Scheduled", value: stats.scheduled, icon: Clock, color: "text-blue-500", bgColor: "bg-blue-500/10" },
          { label: "Featured", value: stats.featured, icon: Star, color: "text-amber-500", bgColor: "bg-amber-500/10" },
          { label: "Total Views", value: stats.totalViews.toLocaleString(), icon: TrendingUp, color: "text-purple-500", bgColor: "bg-purple-500/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">{stat.label}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name} ({cat._count.blogs})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Featured" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Blogs</SelectItem>
                <SelectItem value="true">Featured</SelectItem>
                <SelectItem value="false">Non-Featured</SelectItem>
              </SelectContent>
            </Select>

            {(searchQuery || statusFilter !== "all" || categoryFilter !== "all" || featuredFilter !== "all") && (
              <Button variant="ghost" onClick={clearFilters}>
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}

            <Button variant="outline" onClick={fetchBlogs} disabled={isLoading}>
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <FileText className="w-12 h-12 mb-4" />
            <p className="mb-4">No blogs found</p>
            <Link href="/admin/blogs/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create First Blog
              </Button>
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Blog</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>SEO</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blogs.map((blog) => (
                <TableRow key={blog.id} className="border-border hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        {blog.featuredImage ? (
                          <Image
                            src={blog.featuredImage}
                            alt={blog.title}
                            width={56}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate max-w-[200px]">
                            {blog.title}
                          </p>
                          {blog.isFeatured && (
                            <Star className="w-4 h-4 fill-amber-500 text-amber-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {blog.authorName} • {blog.readingTime} min read
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {blog.category ? (
                      <Badge
                        style={{
                          backgroundColor: `${blog.category.color}20`,
                          color: blog.category.color,
                        }}
                      >
                        {blog.category.name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(blog.status)}>
                      {blog.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <SeoScoreBadge score={blog.seoScore} size="sm" showScore={false} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Eye className="w-4 h-4" />
                      <span>{blog.viewCount.toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {blog.publishedAt
                      ? formatDate(blog.publishedAt)
                      : blog.scheduledAt
                      ? `Scheduled: ${formatDate(blog.scheduledAt)}`
                      : formatDate(blog.createdAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/blog/${blog.slug}`} target="_blank">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/blogs/${blog.id}/edit`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleToggleFeatured(blog)}>
                          {blog.isFeatured ? (
                            <>
                              <StarOff className="w-4 h-4 mr-2 text-amber-500" />
                              <span className="text-amber-500">Remove Featured</span>
                            </>
                          ) : (
                            <>
                              <Star className="w-4 h-4 mr-2 text-amber-500" />
                              <span className="text-amber-500">Make Featured</span>
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(blog)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} blogs
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedBlog?.title}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Category Management Modal */}
      <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Category Form */}
            <div className="space-y-3 p-4 rounded-lg bg-muted/50">
              <div>
                <label className="text-sm font-medium">Category Name</label>
                <Input
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="Enter category name"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Enter description"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Color</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="color"
                    value={categoryForm.color}
                    onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer border border-border"
                  />
                  <Input
                    value={categoryForm.color}
                    onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <Button onClick={handleSaveCategory} disabled={isSaving} className="w-full">
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : categoryForm.id ? (
                  "Update Category"
                ) : (
                  "Add Category"
                )}
              </Button>
              {categoryForm.id && (
                <Button
                  variant="outline"
                  onClick={() => setCategoryForm({ id: "", name: "", description: "", color: "#6366f1" })}
                  className="w-full"
                >
                  Cancel Edit
                </Button>
              )}
            </div>

            {/* Category List */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Existing Categories</h4>
              {categories.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4 text-center">
                  No categories yet
                </p>
              ) : (
                categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-medium">{cat.name}</span>
                      <Badge variant="outline">{cat._count.blogs} blogs</Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          setCategoryForm({
                            id: cat.id,
                            name: cat.name,
                            description: "",
                            color: cat.color,
                          })
                        }
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDeleteCategory(cat.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
