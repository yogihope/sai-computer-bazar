"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  Search,
  MoreHorizontal,
  Check,
  X,
  Star,
  MessageSquare,
  Clock,
  CheckCircle2,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  ShoppingBag,
  Monitor,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Shield,
  User,
  Calendar,
  ThumbsUp,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";

interface ReviewImage {
  id: string;
  url: string;
}

interface ReviewTag {
  id: string;
  name: string;
  color: string;
}

interface Review {
  id: string;
  type: "product" | "prebuilt";
  itemId: string;
  itemName: string;
  itemSlug: string | null;
  itemImage: string | null;
  title: string | null;
  description: string | null;
  rating: number;
  reviewerName: string;
  reviewerEmail: string | null;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  helpfulCount: number;
  isApproved: boolean;
  isVerified: boolean;
  images: ReviewImage[];
  tags: ReviewTag[];
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  approved: number;
  pending: number;
  productReviews: number;
  prebuiltReviews: number;
  avgRating: number;
  ratingDistribution: Record<number, number>;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
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
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    rating: 5,
    reviewerName: "",
    reviewerEmail: "",
    isApproved: false,
    isVerified: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (ratingFilter !== "all") params.append("rating", ratingFilter);

      const res = await fetch(`/api/admin/reviews?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setReviews(data.reviews);
        setStats(data.stats);
        setPagination(data.pagination);
      } else {
        toast.error(data.error || "Failed to fetch reviews");
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to fetch reviews");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery, statusFilter, typeFilter, ratingFilter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page !== 1) {
        setPagination((prev) => ({ ...prev, page: 1 }));
      } else {
        fetchReviews();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleViewReview = async (review: Review) => {
    // Fetch full review details
    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`);
      const data = await res.json();
      if (res.ok) {
        setSelectedReview(data.review);
        setViewModalOpen(true);
      } else {
        toast.error("Failed to load review details");
      }
    } catch (error) {
      toast.error("Failed to load review details");
    }
  };

  const handleEditReview = (review: Review) => {
    setSelectedReview(review);
    setEditForm({
      title: review.title || "",
      description: review.description || "",
      rating: review.rating,
      reviewerName: review.reviewerName,
      reviewerEmail: review.reviewerEmail || "",
      isApproved: review.isApproved,
      isVerified: review.isVerified,
    });
    setEditModalOpen(true);
  };

  const handleDeleteReview = (review: Review) => {
    setSelectedReview(review);
    setDeleteDialogOpen(true);
  };

  const handleApproveReview = async (review: Review, approved: boolean) => {
    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: approved }),
      });

      if (res.ok) {
        toast.success(approved ? "Review approved" : "Review rejected");
        fetchReviews();
      } else {
        toast.error("Failed to update review status");
      }
    } catch (error) {
      toast.error("Failed to update review status");
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedReview) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/reviews/${selectedReview.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        toast.success("Review updated successfully");
        setEditModalOpen(false);
        fetchReviews();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update review");
      }
    } catch (error) {
      toast.error("Failed to update review");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedReview) return;

    try {
      const res = await fetch(`/api/admin/reviews/${selectedReview.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Review deleted successfully");
        setDeleteDialogOpen(false);
        fetchReviews();
      } else {
        toast.error("Failed to delete review");
      }
    } catch (error) {
      toast.error("Failed to delete review");
    }
  };

  const renderStars = (rating: number, size: "sm" | "md" = "sm") => {
    const sizeClass = size === "sm" ? "w-4 h-4" : "w-5 h-5";
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              sizeClass,
              star <= rating
                ? "fill-amber-500 text-amber-500"
                : "text-muted-foreground/30"
            )}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reviews Management"
        subtitle="Moderate and manage product & prebuilt PC reviews"
        actions={
          <Button variant="outline" size="sm" onClick={fetchReviews} disabled={isLoading}>
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          {
            label: "Total Reviews",
            value: stats?.total || 0,
            icon: MessageSquare,
            color: "text-primary",
            bgColor: "bg-primary/10",
          },
          {
            label: "Product Reviews",
            value: stats?.productReviews || 0,
            icon: ShoppingBag,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
          },
          {
            label: "Prebuilt Reviews",
            value: stats?.prebuiltReviews || 0,
            icon: Monitor,
            color: "text-purple-500",
            bgColor: "bg-purple-500/10",
          },
          {
            label: "Approved",
            value: stats?.approved || 0,
            icon: CheckCircle2,
            color: "text-emerald-500",
            bgColor: "bg-emerald-500/10",
          },
          {
            label: "Pending",
            value: stats?.pending || 0,
            icon: Clock,
            color: "text-amber-500",
            bgColor: "bg-amber-500/10",
          },
          {
            label: "Avg Rating",
            value: stats?.avgRating?.toFixed(1) || "0.0",
            icon: Star,
            color: "text-amber-500",
            bgColor: "bg-amber-500/10",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4"
          >
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

      {/* Rating Distribution */}
      {stats?.ratingDistribution && (
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
          <h3 className="text-sm font-medium mb-3">Rating Distribution</h3>
          <div className="flex flex-wrap gap-4">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingDistribution[rating] || 0;
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={rating} className="flex items-center gap-2 min-w-[150px]">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  </div>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden min-w-[80px]">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-10 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, description, or reviewer..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="prebuilt">Prebuilt PC</SelectItem>
              </SelectContent>
            </Select>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mb-4" />
            <p>No reviews found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Item</TableHead>
                <TableHead>Reviewer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review.id} className="border-border hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        {review.itemImage ? (
                          <Image
                            src={review.itemImage}
                            alt={review.itemName}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {review.type === "product" ? (
                              <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <Monitor className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate max-w-[200px]">
                          {review.itemName}
                        </p>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] mt-0.5",
                            review.type === "product"
                              ? "border-blue-500/30 text-blue-500"
                              : "border-purple-500/30 text-purple-500"
                          )}
                        >
                          {review.type === "product" ? "Product" : "Prebuilt"}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{review.reviewerName}</p>
                        {review.isVerified && (
                          <div className="flex items-center gap-1 text-emerald-500">
                            <Shield className="w-3 h-3" />
                            <span className="text-[10px]">Verified</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {renderStars(review.rating)}
                      <span className="text-xs text-muted-foreground">
                        {review.helpfulCount > 0 && (
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" />
                            {review.helpfulCount}
                          </span>
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    {review.title && (
                      <p className="font-medium text-sm truncate">{review.title}</p>
                    )}
                    <p className="text-sm text-muted-foreground truncate">
                      {review.description || "No description"}
                    </p>
                    {review.images.length > 0 && (
                      <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                        <ImageIcon className="w-3 h-3" />
                        <span className="text-xs">{review.images.length} images</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        review.isApproved
                          ? "bg-emerald-500/20 text-emerald-500"
                          : "bg-amber-500/20 text-amber-500"
                      )}
                    >
                      {review.isApproved ? "Approved" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(review.createdAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewReview(review)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditReview(review)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {review.isApproved ? (
                          <DropdownMenuItem
                            onClick={() => handleApproveReview(review, false)}
                          >
                            <X className="w-4 h-4 mr-2 text-amber-500" />
                            <span className="text-amber-500">Unapprove</span>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleApproveReview(review, true)}
                          >
                            <Check className="w-4 h-4 mr-2 text-emerald-500" />
                            <span className="text-emerald-500">Approve</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteReview(review)}
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
              {pagination.total} reviews
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
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
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={pagination.page === pagination.totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* View Review Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-6">
              {/* Item Info */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                  {selectedReview.itemImage ? (
                    <Image
                      src={selectedReview.itemImage}
                      alt={selectedReview.itemName}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {selectedReview.type === "product" ? (
                        <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                      ) : (
                        <Monitor className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{selectedReview.itemName}</p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs mt-1",
                      selectedReview.type === "product"
                        ? "border-blue-500/30 text-blue-500"
                        : "border-purple-500/30 text-purple-500"
                    )}
                  >
                    {selectedReview.type === "product" ? "Product" : "Prebuilt PC"}
                  </Badge>
                  {selectedReview.itemSlug && (
                    <Link
                      href={
                        selectedReview.type === "product"
                          ? `/product/${selectedReview.itemSlug}`
                          : `/prebuilt/${selectedReview.itemSlug}`
                      }
                      target="_blank"
                      className="flex items-center gap-1 text-xs text-primary mt-2 hover:underline"
                    >
                      View Item <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>

              {/* Reviewer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Reviewer Name</label>
                  <p className="font-medium">{selectedReview.reviewerName}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Email</label>
                  <p className="text-sm">{selectedReview.reviewerEmail || "Not provided"}</p>
                </div>
                {selectedReview.userId && (
                  <>
                    <div>
                      <label className="text-xs text-muted-foreground">User Account</label>
                      <p className="text-sm">{selectedReview.userName || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">User Email</label>
                      <p className="text-sm">{selectedReview.userEmail || "N/A"}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Rating & Status */}
              <div className="flex items-center gap-6">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Rating</label>
                  <div className="flex items-center gap-2">
                    {renderStars(selectedReview.rating, "md")}
                    <span className="font-bold">{selectedReview.rating}/5</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Status</label>
                  <Badge
                    className={cn(
                      selectedReview.isApproved
                        ? "bg-emerald-500/20 text-emerald-500"
                        : "bg-amber-500/20 text-amber-500"
                    )}
                  >
                    {selectedReview.isApproved ? "Approved" : "Pending"}
                  </Badge>
                </div>
                {selectedReview.isVerified && (
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Verified</label>
                    <Badge className="bg-emerald-500/20 text-emerald-500">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified Purchase
                    </Badge>
                  </div>
                )}
              </div>

              {/* Review Content */}
              <div>
                {selectedReview.title && (
                  <>
                    <label className="text-xs text-muted-foreground">Title</label>
                    <p className="font-semibold text-lg mb-2">{selectedReview.title}</p>
                  </>
                )}
                <label className="text-xs text-muted-foreground">Review</label>
                <p className="text-sm mt-1 whitespace-pre-wrap">
                  {selectedReview.description || "No description provided"}
                </p>
              </div>

              {/* Images */}
              {selectedReview.images.length > 0 && (
                <div>
                  <label className="text-xs text-muted-foreground block mb-2">
                    Images ({selectedReview.images.length})
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedReview.images.map((img) => (
                      <div
                        key={img.id}
                        className="w-20 h-20 rounded-lg overflow-hidden bg-muted"
                      >
                        <Image
                          src={img.url}
                          alt="Review image"
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {selectedReview.tags.length > 0 && (
                <div>
                  <label className="text-xs text-muted-foreground block mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedReview.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Meta Info */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Created: {formatDate(selectedReview.createdAt)}
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  {selectedReview.helpfulCount} found helpful
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewModalOpen(false)}>
              Close
            </Button>
            {selectedReview && (
              <Button
                onClick={() => {
                  setViewModalOpen(false);
                  handleEditReview(selectedReview);
                }}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit Review
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Review Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={editForm.title}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Review title"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Review description"
                className="mt-1"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Reviewer Name</label>
                <Input
                  value={editForm.reviewerName}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, reviewerName: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Reviewer Email</label>
                <Input
                  type="email"
                  value={editForm.reviewerEmail}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, reviewerEmail: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Rating</label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() =>
                      setEditForm((prev) => ({ ...prev, rating: star }))
                    }
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={cn(
                        "w-6 h-6",
                        star <= editForm.rating
                          ? "fill-amber-500 text-amber-500"
                          : "text-muted-foreground/30"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.isApproved}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, isApproved: e.target.checked }))
                  }
                  className="w-4 h-4 rounded border-border"
                />
                <span className="text-sm">Approved</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.isVerified}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, isVerified: e.target.checked }))
                  }
                  className="w-4 h-4 rounded border-border"
                />
                <span className="text-sm">Verified Purchase</span>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review by{" "}
              <strong>{selectedReview?.reviewerName}</strong>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
