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
  Monitor,
  Eye,
  Cpu,
  Package,
  Star,
  TrendingDown,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { SeoScoreBadge } from "@/components/admin/SeoScoreBadge";

interface PrebuiltPC {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  totalPrice: string;
  sellingPrice: string;
  compareAtPrice: string | null;
  primaryImage: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  visibility: "PUBLIC" | "HIDDEN";
  isFeatured: boolean;
  isInStock: boolean;
  pcType: { id: string; name: string; slug: string } | null;
  pcTypeId: string | null;
  targetUse: string | null;
  seoScore: number;
  createdAt: string;
  updatedAt: string;
  components: {
    id: string;
    componentType: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      price: string;
      images: { url: string }[];
    };
  }[];
  _count: { components: number };
}

interface Stats {
  total: number;
  published: number;
  draft: number;
  featured: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function PrebuiltPCsPage() {
  const [prebuiltPCs, setPrebuiltPCs] = useState<PrebuiltPC[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, published: 0, draft: 0, featured: 0 });
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPrebuiltPCs = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: searchQuery,
        page: page.toString(),
        limit: "20",
      });
      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      const res = await fetch(`/api/admin/prebuilt-pcs?${params}`);
      const data = await res.json();

      if (res.ok) {
        setPrebuiltPCs(data.prebuiltPCs);
        setStats(data.stats);
        setPagination(data.pagination);
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to fetch prebuilt PCs", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrebuiltPCs();
  }, [searchQuery, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Published</Badge>;
      case "DRAFT":
        return <Badge variant="outline" className="border-muted-foreground/30">Draft</Badge>;
      case "ARCHIVED":
        return <Badge className="bg-muted text-muted-foreground">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDiscountPercent = (total: string, selling: string) => {
    const t = parseFloat(total);
    const s = parseFloat(selling);
    if (t <= 0) return 0;
    return Math.round(((t - s) / t) * 100);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/prebuilt-pcs/${deleteId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        setPrebuiltPCs(prev => prev.filter(p => p.id !== deleteId));
        toast({ title: "Deleted", description: "Prebuilt PC deleted successfully" });
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete prebuilt PC", variant: "destructive" });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Prebuilt PCs"
          subtitle="Create and manage pre-configured PC bundles with multiple products"
          actions={
            <Link href="/admin/prebuilt-pcs/create">
              <Button className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                <Plus className="w-4 h-4" />
                Create New PC
              </Button>
            </Link>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Monitor className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total PCs</p>
              </div>
            </div>
          </div>
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <Package className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.published}</p>
                <p className="text-sm text-muted-foreground">Published</p>
              </div>
            </div>
          </div>
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Cpu className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.draft}</p>
                <p className="text-sm text-muted-foreground">Drafts</p>
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
                <p className="text-sm text-muted-foreground">Featured</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search prebuilt PCs..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => fetchPrebuiltPCs()} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Prebuilt PCs Table */}
        <AdminTableWrapper>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : prebuiltPCs.length === 0 ? (
            <div className="text-center py-12">
              <Monitor className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No prebuilt PCs found</p>
              <Link href="/admin/prebuilt-pcs/create">
                <Button className="mt-4">Create First Prebuilt PC</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="w-20">Image</TableHead>
                  <TableHead>PC Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-center">Components</TableHead>
                  <TableHead>Total Price</TableHead>
                  <TableHead>Selling Price</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>SEO Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prebuiltPCs.map((pc) => (
                  <TableRow key={pc.id} className="border-border hover:bg-muted/50">
                    <TableCell>
                      {pc.primaryImage ? (
                        <img
                          src={pc.primaryImage}
                          alt={pc.name}
                          className="w-12 h-12 rounded-lg object-cover border border-border"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                          <Monitor className="w-6 h-6 text-primary" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{pc.name}</span>
                          {pc.isFeatured && (
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                        {pc.targetUse && (
                          <p className="text-xs text-muted-foreground">{pc.targetUse}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {pc.pcType?.name ? (
                        <Badge variant="outline" className="bg-primary/5">
                          {pc.pcType.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Cpu className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{pc._count.components}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <span className="line-through">
                        ₹{parseFloat(pc.totalPrice).toLocaleString("en-IN")}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-emerald-500">
                      ₹{parseFloat(pc.sellingPrice).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      {getDiscountPercent(pc.totalPrice, pc.sellingPrice) > 0 ? (
                        <Badge className="bg-red-500/10 text-red-500 border-red-500/20 gap-1">
                          <TrendingDown className="w-3 h-3" />
                          {getDiscountPercent(pc.totalPrice, pc.sellingPrice)}% OFF
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <SeoScoreBadge score={pc.seoScore || 0} size="sm" />
                    </TableCell>
                    <TableCell>{getStatusBadge(pc.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/prebuilt-pcs/edit/${pc.id}`} className="flex items-center">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/prebuilt-pc/${pc.slug}`} target="_blank" className="flex items-center">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteId(pc.id)}
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
              onClick={() => fetchPrebuiltPCs(pagination.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchPrebuiltPCs(pagination.page + 1)}
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
            <AlertDialogTitle>Delete Prebuilt PC?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The prebuilt PC and all its component associations will be permanently deleted.
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
