"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Folder,
  FolderTree,
  Layers,
  Box,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { SeoScoreBadge } from "@/components/admin/SeoScoreBadge";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  displayOrder: number;
  isVisible: boolean;
  isFeatured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  seoScore: number;
  createdAt: string;
  parent: { id: string; name: string; slug: string } | null;
  children: { id: string; name: string; slug: string }[];
  _count: { products: number; children: number };
}

interface Stats {
  total: number;
  parents: number;
  subcategories: number;
  totalProducts: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, parents: 0, subcategories: 0, totalProducts: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/categories?search=${searchQuery}`);
      const data = await res.json();

      if (res.ok) {
        setCategories(data.categories);
        setStats(data.stats);
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to fetch categories", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [searchQuery]);

  const toggleVisibility = async (id: string, currentValue: boolean) => {
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: !currentValue }),
      });

      if (res.ok) {
        setCategories(prev =>
          prev.map(c => (c.id === id ? { ...c, isVisible: !currentValue } : c))
        );
        toast({ title: "Updated", description: "Visibility updated" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
  };

  const toggleFeatured = async (id: string, currentValue: boolean) => {
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !currentValue }),
      });

      if (res.ok) {
        setCategories(prev =>
          prev.map(c => (c.id === id ? { ...c, isFeatured: !currentValue } : c))
        );
        toast({ title: "Updated", description: "Featured status updated" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/categories/${deleteId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        setCategories(prev => prev.filter(c => c.id !== deleteId));
        toast({ title: "Deleted", description: "Category deleted successfully" });
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete category", variant: "destructive" });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories Management"
        subtitle="Manage store categories, hierarchies & SEO"
        actions={
          <Link href="/admin/categories/create">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add New Category
            </Button>
          </Link>
        }
      />

      {/* Actions Bar */}
      <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Button variant="outline" onClick={fetchCategories} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Folder className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Categories</p>
            </div>
          </div>
        </div>
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <Layers className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.parents}</p>
              <p className="text-sm text-muted-foreground">Parent Categories</p>
            </div>
          </div>
        </div>
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <FolderTree className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.subcategories}</p>
              <p className="text-sm text-muted-foreground">Subcategories</p>
            </div>
          </div>
        </div>
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20">
              <Box className="w-5 h-5 text-cyan-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalProducts}</p>
              <p className="text-sm text-muted-foreground">Total Products</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <Folder className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No categories found</p>
            <Link href="/admin/categories/create">
              <Button className="mt-4">Create First Category</Button>
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Category Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead className="text-center">Products</TableHead>
                <TableHead>SEO Score</TableHead>
                <TableHead className="text-center">Visible</TableHead>
                <TableHead className="text-center">Featured</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow
                  key={category.id}
                  className="border-border hover:bg-muted/50"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                        <Folder className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-medium">{category.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                      /{category.slug}
                    </code>
                  </TableCell>
                  <TableCell>
                    {category.parent ? (
                      <Badge variant="outline">{category.parent.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">Root</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-medium">{category._count.products}</span>
                  </TableCell>
                  <TableCell>
                    <SeoScoreBadge score={category.seoScore || 0} size="sm" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={category.isVisible}
                      onCheckedChange={() => toggleVisibility(category.id, category.isVisible)}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={category.isFeatured}
                      onCheckedChange={() => toggleFeatured(category.id, category.isFeatured)}
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(category.createdAt).toLocaleDateString()}
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
                          <Link href={`/admin/categories/edit/${category.id}`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Category
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/category/${category.slug}`} target="_blank">
                            <Eye className="w-4 h-4 mr-2" />
                            View Page
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteId(category.id)}
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
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Categories with products cannot be deleted.
              Subcategories will become root categories.
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
    </div>
  );
}
