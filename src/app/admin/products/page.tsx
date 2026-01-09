"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminTableWrapper } from "@/components/admin/AdminCard";
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
  MoreVertical,
  Edit,
  Trash2,
  Loader2,
  RefreshCw,
  Package,
  Eye,
  CheckCircle,
  FileEdit,
  AlertTriangle,
  Star,
  Boxes,
  FolderOpen,
  TrendingDown,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { SeoScoreBadge } from "@/components/admin/SeoScoreBadge";

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  price: string;
  stockQuantity: number;
  isInStock: boolean;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  visibility: "PUBLIC" | "HIDDEN";
  isFeatured: boolean;
  brand: string | null;
  updatedAt: string;
  seoScore: number;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  primaryCategory: { id: string; name: string; slug: string };
  images: { url: string; alt: string | null; isPrimary: boolean }[];
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Stats {
  total: number;
  published: number;
  draft: number;
  outOfStock: number;
  featured: number;
  lowStock: number;
  totalStock: number;
  categoriesWithProducts: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [stats, setStats] = useState<Stats>({
    total: 0,
    published: 0,
    draft: 0,
    outOfStock: 0,
    featured: 0,
    lowStock: 0,
    totalStock: 0,
    categoriesWithProducts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/products?search=${searchQuery}&page=${page}&limit=20`);
      const data = await res.json();

      if (res.ok) {
        setProducts(data.products);
        setPagination(data.pagination);
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to fetch products", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchQuery]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return <Badge className="bg-primary/10 text-primary border-primary/20">Published</Badge>;
      case "DRAFT":
        return <Badge variant="outline" className="border-muted-foreground/30">Draft</Badge>;
      case "ARCHIVED":
        return <Badge className="bg-muted text-muted-foreground">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStockColor = (stock: number, inStock: boolean) => {
    if (!inStock || stock === 0) return "text-destructive";
    if (stock <= 5) return "text-amber-500";
    return "text-muted-foreground";
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/products/${deleteId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== deleteId));
        toast({ title: "Deleted", description: "Product deleted successfully" });
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete product", variant: "destructive" });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Products Management"
          subtitle="Manage your entire product catalog, inventory, and specifications"
          actions={
            <Link href="/admin/products/create">
              <Button className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                <Plus className="w-4 h-4" />
                Add New Product
              </Button>
            </Link>
          }
        />

        {/* Actions Bar */}
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products by name, SKU, or brand..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <Button variant="outline" onClick={() => fetchProducts()} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Products</p>
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
              <div className="p-2 rounded-lg bg-amber-500/20">
                <FileEdit className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.draft}</p>
                <p className="text-xs text-muted-foreground">Draft</p>
              </div>
            </div>
          </div>
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/20">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.outOfStock}</p>
                <p className="text-xs text-muted-foreground">Out of Stock</p>
              </div>
            </div>
          </div>
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.featured}</p>
                <p className="text-xs text-muted-foreground">Featured</p>
              </div>
            </div>
          </div>
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <TrendingDown className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.lowStock}</p>
                <p className="text-xs text-muted-foreground">Low Stock</p>
              </div>
            </div>
          </div>
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <Boxes className="w-5 h-5 text-cyan-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalStock.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Stock</p>
              </div>
            </div>
          </div>
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-500/20">
                <FolderOpen className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.categoriesWithProducts}</p>
                <p className="text-xs text-muted-foreground">Categories</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pagination Info */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Showing {products.length} of {pagination.total} products</span>
            <span>Page {pagination.page} of {pagination.totalPages}</span>
          </div>
        )}

        {/* Products Table */}
        <AdminTableWrapper>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No products found</p>
              <Link href="/admin/products/create">
                <Button className="mt-4">Create First Product</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="w-20">Image</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>SEO Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className="border-border hover:bg-muted/50">
                    <TableCell>
                      {product.images?.[0]?.url ? (
                        <img
                          src={product.images[0].url}
                          alt={product.images[0].alt || product.name}
                          className="w-12 h-12 rounded-lg object-cover border border-border"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                          <Package className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="font-medium">{product.name}</span>
                        {product.brand && (
                          <p className="text-xs text-muted-foreground">{product.brand}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">
                      {product.sku || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.primaryCategory.name}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ₹{parseFloat(product.price).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className={getStockColor(product.stockQuantity, product.isInStock)}>
                      {product.stockQuantity === 0 ? "Out of Stock" : `${product.stockQuantity} units`}
                    </TableCell>
                    <TableCell>
                      <SeoScoreBadge score={product.seoScore || 0} size="sm" />
                    </TableCell>
                    <TableCell>{getStatusBadge(product.status)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(product.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/products/edit/${product.id}`} className="flex items-center">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/product/${product.slug}`} target="_blank" className="flex items-center">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteId(product.id)}
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
        </AdminTableWrapper>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              disabled={pagination.page <= 1}
              onClick={() => fetchProducts(pagination.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchProducts(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The product and all its images, specs, and tags will be permanently deleted.
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
