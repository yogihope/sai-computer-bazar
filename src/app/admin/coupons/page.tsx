"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
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
  Ticket,
  Percent,
  Users,
  Loader2,
  RefreshCw,
  Filter,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  Copy,
  Package,
  Monitor,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface CouponProduct {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  price?: number;
}

interface Coupon {
  id: string;
  code: string;
  name: string;
  title: string | null;
  description: string | null;
  image: string | null;
  discountType: string;
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usageCount: number;
  perUserLimit: number;
  applyOn: string;
  applyToAll: boolean;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  products: CouponProduct[];
  prebuiltPCs: CouponProduct[];
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  active: number;
  expired: number;
  expiringSoon: number;
  totalUsage: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [discountTypeFilter, setDiscountTypeFilter] = useState<string>("all");
  const [applyOnFilter, setApplyOnFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  const fetchCoupons = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", pagination.page.toString());
      params.set("limit", pagination.limit.toString());
      if (searchQuery) params.set("search", searchQuery);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (discountTypeFilter !== "all") params.set("discountType", discountTypeFilter);
      if (applyOnFilter !== "all") params.set("applyOn", applyOnFilter);

      const res = await fetch(`/api/admin/coupons?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setCoupons(data.coupons);
        setStats(data.stats);
        setPagination(data.pagination);
      } else {
        toast.error(data.error || "Failed to fetch coupons");
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Failed to fetch coupons");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery, statusFilter, discountTypeFilter, applyOnFilter]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchCoupons();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setDiscountTypeFilter("all");
    setApplyOnFilter("all");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleDelete = async () => {
    if (!selectedCoupon) return;

    try {
      const res = await fetch(`/api/admin/coupons/${selectedCoupon.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Coupon deleted successfully");
        setShowDeleteDialog(false);
        setSelectedCoupon(null);
        fetchCoupons();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete coupon");
      }
    } catch (error) {
      toast.error("Failed to delete coupon");
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });

      if (res.ok) {
        toast.success(coupon.isActive ? "Coupon deactivated" : "Coupon activated");
        fetchCoupons();
      } else {
        toast.error("Failed to update coupon status");
      }
    } catch (error) {
      toast.error("Failed to update coupon status");
    }
  };

  const openViewModal = async (coupon: Coupon) => {
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`);
      const data = await res.json();

      if (res.ok) {
        setSelectedCoupon(data.coupon);
        setShowViewModal(true);
      }
    } catch (error) {
      toast.error("Failed to load coupon details");
    }
  };

  const openDeleteDialog = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setShowDeleteDialog(true);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
  };

  const getCouponStatus = (coupon: Coupon) => {
    if (!coupon.isActive) {
      return { label: "Inactive", color: "bg-gray-500/20 text-gray-500" };
    }

    const now = new Date();
    if (coupon.endDate && new Date(coupon.endDate) < now) {
      return { label: "Expired", color: "bg-red-500/20 text-red-500" };
    }

    if (coupon.startDate && new Date(coupon.startDate) > now) {
      return { label: "Scheduled", color: "bg-blue-500/20 text-blue-500" };
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { label: "Exhausted", color: "bg-amber-500/20 text-amber-500" };
    }

    return { label: "Active", color: "bg-emerald-500/20 text-emerald-500" };
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd MMM yyyy");
    } catch {
      return dateString;
    }
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discountType === "percentage") {
      return `${coupon.discountValue}%`;
    }
    return `Rs.${coupon.discountValue.toLocaleString("en-IN")}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coupons Management"
        subtitle="Create and manage discount coupons"
        actions={
          <Link href="/admin/coupons/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Coupon
            </Button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Coupons", value: stats?.total || 0, icon: Ticket, color: "text-primary", bgColor: "bg-primary/10" },
          { label: "Active", value: stats?.active || 0, icon: CheckCircle2, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
          { label: "Expired", value: stats?.expired || 0, icon: AlertCircle, color: "text-red-500", bgColor: "bg-red-500/10" },
          { label: "Expiring Soon", value: stats?.expiringSoon || 0, icon: Clock, color: "text-amber-500", bgColor: "bg-amber-500/10" },
          { label: "Total Uses", value: stats?.totalUsage || 0, icon: Users, color: "text-blue-500", bgColor: "bg-blue-500/10" },
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

      {/* Search & Filters */}
      <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by code, name, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button type="button" variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {(statusFilter !== "all" || discountTypeFilter !== "all" || applyOnFilter !== "all") && (
                <Badge variant="secondary" className="ml-2">Active</Badge>
              )}
            </Button>
            <Button type="submit" variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            <Button type="button" variant="outline" onClick={fetchCoupons}>
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </Button>
          </div>
        </form>

        {showFilters && (
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            <Select value={discountTypeFilter} onValueChange={setDiscountTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Discount Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>

            <Select value={applyOnFilter} onValueChange={setApplyOnFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Apply On" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="PRODUCT">Products Only</SelectItem>
                <SelectItem value="PREBUILT_PC">Prebuilt PCs Only</SelectItem>
                <SelectItem value="BOTH">Both</SelectItem>
              </SelectContent>
            </Select>

            {(statusFilter !== "all" || discountTypeFilter !== "all" || applyOnFilter !== "all" || searchQuery) && (
              <Button type="button" variant="ghost" onClick={clearFilters}>
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Coupons Table */}
      <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Ticket className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Coupons Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== "all" ? "Try adjusting your filters" : "Create your first coupon to get started"}
            </p>
            <Link href="/admin/coupons/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create First Coupon
              </Button>
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Coupon</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Apply On</TableHead>
                <TableHead>Min Order</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Validity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => {
                const status = getCouponStatus(coupon);
                return (
                  <TableRow key={coupon.id} className="border-border hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {coupon.image ? (
                          <div className="w-12 h-8 rounded overflow-hidden bg-muted">
                            <Image
                              src={coupon.image}
                              alt={coupon.name}
                              width={48}
                              height={32}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-8 rounded bg-muted flex items-center justify-center">
                            <Ticket className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-primary">{coupon.code}</span>
                            <button
                              onClick={() => copyCode(coupon.code)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-sm text-muted-foreground truncate max-w-[150px]">{coupon.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {coupon.discountType === "percentage" ? (
                          <Percent className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <IndianRupee className="w-4 h-4 text-emerald-500" />
                        )}
                        <span className="font-semibold">{formatDiscount(coupon)}</span>
                      </div>
                      {coupon.maxDiscount && (
                        <p className="text-xs text-muted-foreground">
                          Max: Rs.{coupon.maxDiscount.toLocaleString("en-IN")}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        {coupon.applyOn === "PRODUCT" && <Package className="w-3 h-3" />}
                        {coupon.applyOn === "PREBUILT_PC" && <Monitor className="w-3 h-3" />}
                        {coupon.applyOn === "BOTH" && (
                          <>
                            <Package className="w-3 h-3" />
                            <span className="text-xs">&</span>
                            <Monitor className="w-3 h-3" />
                          </>
                        )}
                      </Badge>
                      {!coupon.applyToAll && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {coupon.products.length + coupon.prebuiltPCs.length} items
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      {coupon.minOrderAmount ? (
                        <span>Rs.{coupon.minOrderAmount.toLocaleString("en-IN")}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {coupon.usageCount}
                          {coupon.usageLimit && <span className="text-muted-foreground">/{coupon.usageLimit}</span>}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {coupon.startDate || coupon.endDate ? (
                          <>
                            <p>{formatDate(coupon.startDate)}</p>
                            <p className="text-muted-foreground">to {formatDate(coupon.endDate)}</p>
                          </>
                        ) : (
                          <span className="text-muted-foreground">No limit</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={status.color}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openViewModal(coupon)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/coupons/${coupon.id}/edit`}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => copyCode(coupon.code)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Code
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleToggleActive(coupon)}>
                            {coupon.isActive ? (
                              <>
                                <X className="w-4 h-4 mr-2 text-amber-500" />
                                <span className="text-amber-500">Deactivate</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
                                <span className="text-emerald-500">Activate</span>
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(coupon)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} coupons
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

      {/* View Coupon Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Coupon Details</DialogTitle>
          </DialogHeader>
          {selectedCoupon && (
            <div className="space-y-4">
              {selectedCoupon.image && (
                <div className="w-full h-32 rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={selectedCoupon.image}
                    alt={selectedCoupon.name}
                    width={400}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Ticket className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xl font-bold text-primary">{selectedCoupon.code}</span>
                    <button onClick={() => copyCode(selectedCoupon.code)}>
                      <Copy className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  </div>
                  <p className="text-muted-foreground">{selectedCoupon.name}</p>
                </div>
                <Badge className={getCouponStatus(selectedCoupon).color}>
                  {getCouponStatus(selectedCoupon).label}
                </Badge>
              </div>

              {selectedCoupon.title && (
                <div>
                  <p className="text-sm text-muted-foreground">Title</p>
                  <p className="font-medium">{selectedCoupon.title}</p>
                </div>
              )}

              {selectedCoupon.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm">{selectedCoupon.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="text-xs text-muted-foreground">Discount</p>
                  <p className="text-lg font-bold text-emerald-500">{formatDiscount(selectedCoupon)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Min Order</p>
                  <p className="font-medium">
                    {selectedCoupon.minOrderAmount
                      ? `Rs.${selectedCoupon.minOrderAmount.toLocaleString("en-IN")}`
                      : "No minimum"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Max Discount</p>
                  <p className="font-medium">
                    {selectedCoupon.maxDiscount
                      ? `Rs.${selectedCoupon.maxDiscount.toLocaleString("en-IN")}`
                      : "No limit"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Usage</p>
                  <p className="font-medium">
                    {selectedCoupon.usageCount}
                    {selectedCoupon.usageLimit && ` / ${selectedCoupon.usageLimit}`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Apply On</p>
                  <Badge variant="outline" className="mt-1">
                    {selectedCoupon.applyOn === "PRODUCT" && "Products Only"}
                    {selectedCoupon.applyOn === "PREBUILT_PC" && "Prebuilt PCs Only"}
                    {selectedCoupon.applyOn === "BOTH" && "Both"}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Scope</p>
                  <p className="text-sm mt-1">
                    {selectedCoupon.applyToAll ? "All Items" : "Specific Items"}
                  </p>
                </div>
              </div>

              {!selectedCoupon.applyToAll && (
                <div className="space-y-2">
                  {selectedCoupon.products.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Applied Products ({selectedCoupon.products.length})</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedCoupon.products.map((p) => (
                          <Badge key={p.id} variant="secondary" className="text-xs">
                            {p.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedCoupon.prebuiltPCs.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Applied Prebuilt PCs ({selectedCoupon.prebuiltPCs.length})</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedCoupon.prebuiltPCs.map((p) => (
                          <Badge key={p.id} variant="secondary" className="text-xs">
                            {p.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Start Date</p>
                  <p>{formatDate(selectedCoupon.startDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">End Date</p>
                  <p>{formatDate(selectedCoupon.endDate)}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Link href={`/admin/coupons/${selectedCoupon.id}/edit`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                <Button className="flex-1" onClick={() => copyCode(selectedCoupon.code)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Code
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the coupon <strong>{selectedCoupon?.code}</strong>? This action cannot be undone.
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
    </div>
  );
}
