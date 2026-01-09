"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Monitor,
  Package,
  Star,
  Clock,
  ShoppingCart,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Shield,
  Truck,
  RotateCcw,
  Headphones,
  Zap,
  Cpu,
  HardDrive,
  CircuitBoard,
  Fan,
  Box,
  Eye,
  ArrowRight,
  Sparkles,
  TrendingDown,
  Calendar,
  Gift,
  MessageSquare,
  ThumbsUp,
  User,
  Send,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  X,
  Image as ImageIcon,
  FileText,
  Settings,
  BadgeCheck,
  Award,
  Flame,
  Gem,
  Target,
  Wallet,
  Pencil,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PrebuiltPC {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  specifications: string | null;
  totalPrice: string;
  sellingPrice: string;
  compareAtPrice: string | null;
  primaryImage: string | null;
  galleryImages: { url: string; alt: string }[] | null;
  status: string;
  visibility: string;
  isFeatured: boolean;
  isInStock: boolean;
  isComingSoon: boolean;
  launchDate: string | null;
  pcType: { id: string; name: string; slug: string } | null;
  targetUse: string | null;
  components: {
    id: string;
    componentType: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      slug: string;
      price: string;
      brand: string | null;
      shortDescription: string | null;
      images: { url: string }[];
    };
  }[];
  tags: { tag: { id: string; name: string; slug: string } }[];
  badges: { badge: { id: string; name: string; slug: string; color: string } }[];
}

interface RelatedPC {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  sellingPrice: string;
  totalPrice: string;
  primaryImage: string | null;
  isFeatured: boolean;
  pcType: { name: string } | null;
}

interface ReviewTag {
  id: string;
  name: string;
  color: string;
}

interface Review {
  id: string;
  userId: string | null;
  name: string;
  title: string;
  rating: number;
  date: string;
  description: string;
  helpful: number;
  hasVoted: boolean;
  images: string[];
  tags: ReviewTag[];
  isVerified: boolean;
}

// Component type icons
const componentIcons: Record<string, React.ElementType> = {
  CPU: Cpu,
  GPU: Monitor,
  Motherboard: CircuitBoard,
  RAM: HardDrive,
  Storage: HardDrive,
  PSU: Zap,
  Case: Box,
  "CPU Cooler": Fan,
  "Case Fan": Fan,
  Monitor: Monitor,
  Keyboard: Package,
  Mouse: Package,
  Default: Package,
};

// Component type icons are defined above

export default function PrebuiltPCPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const router = useRouter();
  const [pc, setPC] = useState<PrebuiltPC | null>(null);
  const [relatedPCs, setRelatedPCs] = useState<RelatedPC[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewAnalytics, setReviewAnalytics] = useState<{
    totalReviews: number;
    averageRating: number;
    starDistribution: { star: number; count: number; percentage: number }[];
    tagDistribution: { id: string; name: string; color: string; count: number; percentage: number }[];
  } | null>(null);
  const [reviewTags, setReviewTags] = useState<ReviewTag[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [newReview, setNewReview] = useState({
    title: "",
    rating: 5,
    description: "",
    selectedTags: [] as string[],
    images: [] as string[],
  });
  const [activeTab, setActiveTab] = useState<"about" | "specs" | "reviews">("about");
  const [reviewImagePreview, setReviewImagePreview] = useState<string | null>(null);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [reviewMenuOpen, setReviewMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    const fetchPC = async () => {
      try {
        const res = await fetch(`/api/prebuilt-pcs/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setPC(data.prebuiltPC);

          // Fetch related PCs
          if (data.prebuiltPC?.pcType?.id) {
            const relatedRes = await fetch(`/api/prebuilt-pcs?pcTypeId=${data.prebuiltPC.pcType.id}&limit=4&exclude=${data.prebuiltPC.id}`);
            if (relatedRes.ok) {
              const relatedData = await relatedRes.json();
              setRelatedPCs(relatedData.prebuiltPCs || []);
            }
          }

          // Fetch reviews for this PC
          const reviewsRes = await fetch(`/api/reviews?prebuiltPCId=${data.prebuiltPC.id}`);
          if (reviewsRes.ok) {
            const reviewsData = await reviewsRes.json();
            setReviews(reviewsData.reviews || []);
            setReviewAnalytics(reviewsData.analytics || null);
          }
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviewTags = async () => {
      try {
        const res = await fetch("/api/reviews/tags");
        if (res.ok) {
          const data = await res.json();
          setReviewTags(data.tags || []);
        }
      } catch (error) {
        console.error("Error fetching review tags:", error);
      }
    };

    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        // Not logged in
      }
    };

    fetchPC();
    fetchReviewTags();
    fetchUser();
  }, [slug]);

  // Handle Write Review click - check auth
  const handleWriteReviewClick = () => {
    if (!user) {
      // Redirect to login with return URL
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setShowReviewModal(true);
  };

  // Share functionality
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = pc?.name || "Check out this PC";
  const shareText = pc?.shortDescription || "Amazing prebuilt PC from Sai Computer Bazar";

  const handleShare = async (platform?: string) => {
    if (platform === "copy") {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }

    const shareLinks: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareTitle} - ${shareUrl}`)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      email: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`,
    };

    if (platform && shareLinks[platform]) {
      window.open(shareLinks[platform], "_blank", "noopener,noreferrer");
      setShowShareModal(false);
      return;
    }

    // Native share if supported
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      setShowShareModal(true);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pc || !user) return;

    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prebuiltPCId: pc.id,
          title: newReview.title,
          description: newReview.description,
          rating: newReview.rating,
          reviewerName: user.name,
          reviewerEmail: user.email,
          tagIds: newReview.selectedTags,
          images: newReview.images,
        }),
      });

      if (res.ok) {
        setShowReviewModal(false);
        setNewReview({
          title: "",
          rating: 5,
          description: "",
          selectedTags: [],
          images: [],
        });
        // Refresh reviews to show the new one
        await refreshReviews();
        alert("Thank you for your review!");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to submit review");
      }
    } catch (error) {
      alert("Failed to submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const toggleReviewTag = (tagId: string) => {
    setNewReview((prev) => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tagId)
        ? prev.selectedTags.filter((id) => id !== tagId)
        : [...prev.selectedTags, tagId],
    }));
  };

  const removeReviewTag = (tagId: string) => {
    setNewReview((prev) => ({
      ...prev,
      selectedTags: prev.selectedTags.filter((id) => id !== tagId),
    }));
  };

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 5 - newReview.images.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setNewReview((prev) => ({
          ...prev,
          images: [...prev.images, base64].slice(0, 5),
        }));
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = "";
  };

  // Remove image from preview
  const removeReviewImage = (index: number) => {
    setNewReview((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Refresh reviews after submit
  const refreshReviews = async () => {
    if (!pc) return;
    try {
      const reviewsRes = await fetch(`/api/reviews?prebuiltPCId=${pc.id}`);
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData.reviews || []);
        setReviewAnalytics(reviewsData.analytics || null);
      }
    } catch (error) {
      console.error("Error refreshing reviews:", error);
    }
  };

  // Handle helpful vote
  const handleHelpfulClick = async (review: Review) => {
    // Check if user is authenticated
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    try {
      const res = await fetch(`/api/reviews/${review.id}/helpful`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        // Update the review in state
        setReviews((prev) =>
          prev.map((r) =>
            r.id === review.id
              ? { ...r, helpful: data.helpfulCount, hasVoted: data.hasVoted }
              : r
          )
        );
      } else {
        const data = await res.json();
        if (data.requiresLogin) {
          router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        } else {
          alert(data.error || "Failed to update helpful vote");
        }
      }
    } catch (error) {
      console.error("Error updating helpful vote:", error);
    }
  };

  // Handle edit review click
  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setNewReview({
      title: review.title,
      rating: review.rating,
      description: review.description,
      selectedTags: review.tags.map((t) => t.id),
      images: review.images,
    });
    setShowEditModal(true);
    setReviewMenuOpen(null);
  };

  // Handle delete review
  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
      return;
    }

    setDeletingReviewId(reviewId);
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await refreshReviews();
        alert("Review deleted successfully");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review");
    } finally {
      setDeletingReviewId(null);
      setReviewMenuOpen(null);
    }
  };

  // Handle update review submit
  const handleUpdateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/reviews/${editingReview.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newReview.title,
          description: newReview.description,
          rating: newReview.rating,
          tagIds: newReview.selectedTags,
          images: newReview.images,
        }),
      });

      if (res.ok) {
        setShowEditModal(false);
        setEditingReview(null);
        setNewReview({
          title: "",
          rating: 5,
          description: "",
          selectedTags: [],
          images: [],
        });
        await refreshReviews();
        alert("Review updated successfully!");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update review");
      }
    } catch (error) {
      alert("Failed to update review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Use analytics from API or calculate from reviews
  const averageRating = reviewAnalytics?.averageRating || (reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0);
  const totalReviews = reviewAnalytics?.totalReviews || reviews.length;
  const starDistribution = reviewAnalytics?.starDistribution || [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { star, count, percentage };
  });
  const tagDistribution = reviewAnalytics?.tagDistribution || [];

  // Star colors
  const starColors = ["#22c55e", "#84cc16", "#eab308", "#f97316", "#ef4444"];

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-muted-foreground animate-pulse">Loading PC Details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!pc) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
          <div className="text-center p-8">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Monitor className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-3">PC Not Found</h1>
            <p className="text-muted-foreground mb-6 max-w-md">
              The prebuilt PC you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/prebuilt-pcs">
              <Button size="lg" className="gap-2">
                <ArrowRight className="w-4 h-4" />
                Browse All PCs
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const allImages = [
    ...(pc.primaryImage ? [{ url: pc.primaryImage, alt: pc.name }] : []),
    ...(pc.galleryImages || []),
  ];

  const discount = Math.round(
    ((parseFloat(pc.totalPrice) - parseFloat(pc.sellingPrice)) / parseFloat(pc.totalPrice)) * 100
  );

  const savings = parseFloat(pc.totalPrice) - parseFloat(pc.sellingPrice);

  const getComponentIcon = (type: string) => {
    return componentIcons[type] || componentIcons.Default;
  };

  // Group components by type for organized display
  const groupedComponents = pc.components.reduce((acc, comp) => {
    if (!acc[comp.componentType]) acc[comp.componentType] = [];
    acc[comp.componentType].push(comp);
    return acc;
  }, {} as Record<string, typeof pc.components>);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          {/* Main Product Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden">
                {allImages.length > 0 ? (
                  <img
                    src={allImages[selectedImageIndex]?.url}
                    alt={allImages[selectedImageIndex]?.alt || pc.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Monitor className="w-32 h-32 text-muted-foreground/50" />
                  </div>
                )}

                {/* Navigation Arrows */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-background/90 hover:bg-background shadow-lg transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setSelectedImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-background/90 hover:bg-background shadow-lg transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Badges Overlay */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  {pc.isFeatured && (
                    <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-semibold shadow-lg">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Featured
                    </Badge>
                  )}
                  {pc.isComingSoon && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-lg">
                      <Clock className="w-3 h-3 mr-1" />
                      Coming Soon
                    </Badge>
                  )}
                  {discount > 0 && (
                    <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold shadow-lg">
                      <TrendingDown className="w-3 h-3 mr-1" />
                      {discount}% OFF
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={cn(
                      "p-3 rounded-full shadow-lg transition-all",
                      isWishlisted
                        ? "bg-red-500 text-white"
                        : "bg-background/90 hover:bg-background text-muted-foreground hover:text-red-500"
                    )}
                  >
                    <Heart className={cn("w-5 h-5", isWishlisted && "fill-current")} />
                  </button>
                  <button
                    onClick={() => handleShare()}
                    className="p-3 rounded-full bg-background/90 hover:bg-background shadow-lg transition-all text-muted-foreground hover:text-primary"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Share Modal */}
                {showShareModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowShareModal(false)}>
                    <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold">Share this PC</h3>
                        <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-muted rounded-lg">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-5 gap-3 mb-4">
                        <button onClick={() => handleShare("whatsapp")} className="flex flex-col items-center gap-1 p-3 hover:bg-muted rounded-xl transition-colors">
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-xs">WhatsApp</span>
                        </button>
                        <button onClick={() => handleShare("facebook")} className="flex flex-col items-center gap-1 p-3 hover:bg-muted rounded-xl transition-colors">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <Facebook className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-xs">Facebook</span>
                        </button>
                        <button onClick={() => handleShare("twitter")} className="flex flex-col items-center gap-1 p-3 hover:bg-muted rounded-xl transition-colors">
                          <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center">
                            <Twitter className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-xs">Twitter</span>
                        </button>
                        <button onClick={() => handleShare("linkedin")} className="flex flex-col items-center gap-1 p-3 hover:bg-muted rounded-xl transition-colors">
                          <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center">
                            <Linkedin className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-xs">LinkedIn</span>
                        </button>
                        <button onClick={() => handleShare("email")} className="flex flex-col items-center gap-1 p-3 hover:bg-muted rounded-xl transition-colors">
                          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                            <Mail className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-xs">Email</span>
                        </button>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-xl">
                        <input
                          type="text"
                          value={shareUrl}
                          readOnly
                          className="flex-1 bg-transparent text-sm truncate outline-none"
                        />
                        <button
                          onClick={() => handleShare("copy")}
                          className={cn(
                            "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                            copied ? "bg-green-500 text-white" : "bg-primary text-primary-foreground hover:bg-primary/90"
                          )}
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          {copied ? "Copied!" : "Copy"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Custom Badges */}
                {pc.badges.length > 0 && (
                  <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                    {pc.badges.map(({ badge }) => (
                      <Badge key={badge.id} style={{ backgroundColor: badge.color }} className="text-white font-medium shadow-lg">
                        {badge.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={cn(
                        "flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all",
                        selectedImageIndex === index
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-transparent hover:border-muted-foreground/30"
                      )}
                    >
                      <img src={img.url} alt={img.alt || ""} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Title Section */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {pc.pcType && (
                    <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">
                      {pc.pcType.name}
                    </Badge>
                  )}
                  {pc.tags.map(({ tag }) => (
                    <Badge key={tag.id} variant="secondary" className="text-xs">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-2">{pc.name}</h1>
                {pc.targetUse && (
                  <p className="text-lg text-muted-foreground flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    {pc.targetUse}
                  </p>
                )}
              </div>

              {/* Short Description */}
              {pc.shortDescription && (
                <p className="text-muted-foreground text-lg leading-relaxed">{pc.shortDescription}</p>
              )}

              {/* Pricing Card */}
              <div className="bg-gradient-to-br from-card to-card/80 border border-border/50 rounded-2xl p-6 space-y-4">
                <div className="flex items-end gap-4 flex-wrap">
                  <span className="text-4xl lg:text-5xl font-bold text-primary">
                    ₹{parseFloat(pc.sellingPrice).toLocaleString("en-IN")}
                  </span>
                  {discount > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xl text-muted-foreground line-through">
                        ₹{parseFloat(pc.totalPrice).toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                </div>

                {savings > 0 && (
                  <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <div className="p-2 rounded-full bg-emerald-500/20">
                      <Gift className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                        You Save ₹{savings.toLocaleString("en-IN")}
                      </p>
                      <p className="text-sm text-emerald-600/70 dark:text-emerald-400/70">
                        {discount}% off on this bundle
                      </p>
                    </div>
                  </div>
                )}

                {/* CTA Buttons */}
                {pc.isComingSoon ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      <div className="p-3 rounded-full bg-amber-500/20">
                        <Clock className="w-6 h-6 text-amber-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-amber-600 dark:text-amber-400">Coming Soon</p>
                        {pc.launchDate && (
                          <p className="text-sm text-amber-600/70 dark:text-amber-400/70 flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Expected: {new Date(pc.launchDate).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button size="lg" className="w-full" variant="outline">
                      <Heart className="w-5 h-5 mr-2" />
                      Notify Me When Available
                    </Button>
                  </div>
                ) : pc.isInStock ? (
                  <Button size="lg" className="w-full h-14 text-lg gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25">
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </Button>
                ) : (
                  <Button size="lg" className="w-full h-14" disabled>
                    Out of Stock
                  </Button>
                )}

                {/* Stock Status */}
                <div className="flex items-center gap-2 pt-2">
                  {pc.isInStock && !pc.isComingSoon ? (
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                      <span className="font-medium">In Stock - Ready to Ship</span>
                    </div>
                  ) : pc.isComingSoon ? (
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">Coming Soon</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-500">
                      <span className="w-3 h-3 rounded-full bg-red-500"></span>
                      <span className="font-medium">Out of Stock</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">1 Year Warranty</p>
                    <p className="text-xs text-muted-foreground">Full coverage</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Truck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Free Delivery</p>
                    <p className="text-xs text-muted-foreground">Pan India</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <RotateCcw className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">7-Day Returns</p>
                    <p className="text-xs text-muted-foreground">Easy returns</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Headphones className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Expert Support</p>
                    <p className="text-xs text-muted-foreground">24/7 available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Components Section */}
          <section className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  What's Inside
                </h2>
                <p className="text-muted-foreground mt-1">
                  {pc.components.length} premium components included
                </p>
              </div>
              <Badge variant="outline" className="text-lg px-4 py-2">
                Total: ₹{parseFloat(pc.totalPrice).toLocaleString("en-IN")}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pc.components.map((comp) => {
                const IconComponent = getComponentIcon(comp.componentType);
                return (
                  <Link
                    key={comp.id}
                    href={`/product/${comp.product.slug}`}
                    className="group bg-card hover:bg-card/80 border border-border/50 hover:border-primary/30 rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-24 h-24 rounded-xl bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                        {comp.product.images?.[0]?.url ? (
                          <img
                            src={comp.product.images[0].url}
                            alt={comp.product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <IconComponent className="w-10 h-10 text-muted-foreground" />
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <Badge variant="secondary" className="text-xs mb-2 gap-1">
                          <IconComponent className="w-3 h-3" />
                          {comp.componentType}
                        </Badge>
                        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                          {comp.product.name}
                        </h3>
                        {comp.product.brand && (
                          <p className="text-xs text-muted-foreground mt-1">{comp.product.brand}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <p className="font-bold text-primary">
                            ₹{parseFloat(comp.product.price).toLocaleString("en-IN")}
                          </p>
                          {comp.quantity > 1 && (
                            <Badge variant="outline" className="text-xs">
                              x{comp.quantity}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* View Product Link */}
                    <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground group-hover:text-primary transition-colors">
                        View Product Details
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Tab Layout for About, Specifications, Reviews */}
          <section className="mt-16">
            {/* Tab Navigation */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setActiveTab("about")}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap",
                  activeTab === "about"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                )}
              >
                <FileText className="w-5 h-5" />
                About This PC
              </button>
              <button
                onClick={() => setActiveTab("specs")}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap",
                  activeTab === "specs"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                )}
              >
                <Settings className="w-5 h-5" />
                Specifications
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap",
                  activeTab === "reviews"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                )}
              >
                <MessageSquare className="w-5 h-5" />
                Reviews
                <Badge className="bg-primary-foreground/20 text-inherit ml-1">{totalReviews}</Badge>
              </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              {/* About Tab */}
              {activeTab === "about" && (
                <div className="bg-card border border-border/50 rounded-2xl p-6 lg:p-8 animate-in fade-in duration-300">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-primary" />
                    About This PC
                  </h2>
                  {pc.description ? (
                    <div className="prose prose-neutral dark:prose-invert max-w-none">
                      <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed text-lg">{pc.description}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No description available for this PC.</p>
                  )}
                </div>
              )}

              {/* Specifications Tab */}
              {activeTab === "specs" && (
                <div className="bg-card border border-border/50 rounded-2xl p-6 lg:p-8 animate-in fade-in duration-300">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Cpu className="w-6 h-6 text-primary" />
                    Technical Specifications
                  </h2>
                  {pc.specifications ? (
                    <pre className="whitespace-pre-wrap bg-muted/50 p-6 rounded-xl text-sm font-mono text-muted-foreground overflow-x-auto">
                      {pc.specifications}
                    </pre>
                  ) : (
                    <p className="text-muted-foreground">No specifications available for this PC.</p>
                  )}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === "reviews" && (
                <div className="animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Side - Analytics (35%) */}
                    <div className="lg:col-span-4 space-y-6">
                      {/* Overall Rating Circle */}
                      <div className="bg-card border border-border/50 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold mb-6 text-center">Overall Rating</h3>
                        <div className="flex flex-col items-center">
                          {/* Big Rating Circle */}
                          <div className="relative w-40 h-40 mb-4">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                              {/* Background circle */}
                              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
                              {/* Star distribution arcs */}
                              {(() => {
                                let startAngle = 0;
                                return starDistribution.map((item, index) => {
                                  const angle = (item.percentage / 100) * 360;
                                  const endAngle = startAngle + angle;
                                  const largeArc = angle > 180 ? 1 : 0;
                                  const startX = 50 + 45 * Math.cos((startAngle * Math.PI) / 180);
                                  const startY = 50 + 45 * Math.sin((startAngle * Math.PI) / 180);
                                  const endX = 50 + 45 * Math.cos((endAngle * Math.PI) / 180);
                                  const endY = 50 + 45 * Math.sin((endAngle * Math.PI) / 180);
                                  const path = `M ${startX} ${startY} A 45 45 0 ${largeArc} 1 ${endX} ${endY}`;
                                  startAngle = endAngle;
                                  return item.percentage > 0 ? (
                                    <path
                                      key={item.star}
                                      d={path}
                                      fill="none"
                                      stroke={starColors[index]}
                                      strokeWidth="8"
                                      strokeLinecap="round"
                                    />
                                  ) : null;
                                });
                              })()}
                            </svg>
                            {/* Center text */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-4xl font-bold">{averageRating.toFixed(1)}</span>
                              <span className="text-sm text-muted-foreground">out of 5</span>
                            </div>
                          </div>
                          {/* Stars */}
                          <div className="flex items-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={cn(
                                  "w-6 h-6",
                                  star <= Math.round(averageRating) ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
                                )}
                              />
                            ))}
                          </div>
                          <p className="text-muted-foreground">{totalReviews} reviews</p>
                        </div>
                      </div>

                      {/* Star Distribution */}
                      <div className="bg-card border border-border/50 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold mb-4">Rating Breakdown</h3>
                        <div className="space-y-3">
                          {starDistribution.map((item, index) => (
                            <div key={item.star} className="flex items-center gap-3">
                              <span className="w-8 text-sm font-medium flex items-center gap-1">
                                {item.star} <Star className="w-3 h-3 fill-current text-yellow-500" />
                              </span>
                              <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${item.percentage}%`,
                                    backgroundColor: starColors[index],
                                  }}
                                />
                              </div>
                              <span className="w-12 text-sm text-muted-foreground text-right">{item.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tag Distribution */}
                      {tagDistribution.length > 0 && (
                        <div className="bg-card border border-border/50 rounded-2xl p-6">
                          <h3 className="text-lg font-semibold mb-4">Most Mentioned</h3>
                          <div className="space-y-3">
                            {tagDistribution.slice(0, 5).map((tag) => (
                              <div key={tag.id} className="flex items-center gap-3">
                                <Badge style={{ backgroundColor: tag.color }} className="text-white text-xs">
                                  {tag.name}
                                </Badge>
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ width: `${tag.percentage}%`, backgroundColor: tag.color }}
                                  />
                                </div>
                                <span className="text-sm text-muted-foreground">{Math.round(tag.percentage)}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Side - Write Review Button & Reviews List (65%) */}
                    <div className="lg:col-span-8 space-y-6">
                      {/* Sexy Write Review Button */}
                      <button
                        onClick={handleWriteReviewClick}
                        className="w-full group relative overflow-hidden bg-gradient-to-r from-primary via-primary/90 to-primary rounded-2xl p-6 text-left transition-all hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-1"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                              <Send className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-white">Write a Review</h3>
                              <p className="text-white/80 text-sm">{user ? "Share your experience with this PC" : "Login to write a review"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                            ))}
                          </div>
                        </div>
                      </button>

                      {/* Reviews List */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Customer Reviews ({totalReviews})</h3>
                        {reviews.map((review) => (
                          <div
                            key={review.id}
                            className={cn(
                              "bg-card border rounded-2xl p-5 relative",
                              review.userId === user?.id
                                ? "border-primary/30 bg-primary/5"
                                : "border-border/50"
                            )}
                          >
                            {/* Your Review Badge */}
                            {review.userId === user?.id && (
                              <div className="absolute -top-3 left-4">
                                <Badge className="bg-primary text-primary-foreground text-xs">
                                  Your Review
                                </Badge>
                              </div>
                            )}

                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <User className="w-6 h-6 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                {/* Header Row: Name + Verified on left, Date + Actions on right */}
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-semibold">{review.name}</span>
                                    {review.isVerified && (
                                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs gap-1">
                                        <BadgeCheck className="w-3 h-3" />
                                        Verified
                                      </Badge>
                                    )}
                                  </div>

                                  {/* Right side: Date + Edit/Delete buttons */}
                                  <div className="flex items-center gap-3 flex-shrink-0">
                                    <span className="text-sm text-muted-foreground">
                                      {new Date(review.date).toLocaleDateString("en-IN", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric"
                                      })}
                                    </span>

                                    {/* Edit/Delete buttons for own review */}
                                    {review.userId === user?.id && (
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() => handleEditReview(review)}
                                          className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors text-muted-foreground hover:text-primary"
                                          title="Edit review"
                                        >
                                          <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteReview(review.id)}
                                          disabled={deletingReviewId === review.id}
                                          className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors text-muted-foreground hover:text-red-500"
                                          title="Delete review"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Star Rating below name */}
                                <div className="flex items-center gap-1 mb-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={cn(
                                        "w-4 h-4",
                                        star <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
                                      )}
                                    />
                                  ))}
                                </div>
                                <h4 className="font-medium mb-2">{review.title}</h4>
                                <p className="text-muted-foreground leading-relaxed mb-3">{review.description}</p>

                                {/* Tags */}
                                {review.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    {review.tags.map((tag) => (
                                      <Badge key={tag.id} style={{ backgroundColor: tag.color }} className="text-white text-xs">
                                        {tag.name}
                                      </Badge>
                                    ))}
                                  </div>
                                )}

                                {/* Images */}
                                {review.images.length > 0 && (
                                  <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                                    {review.images.map((img, idx) => (
                                      <button
                                        key={idx}
                                        onClick={() => setReviewImagePreview(img)}
                                        className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-border hover:border-primary transition-colors"
                                      >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                      </button>
                                    ))}
                                  </div>
                                )}

                                {/* Helpful Button */}
                                <button
                                  onClick={() => handleHelpfulClick(review)}
                                  className={cn(
                                    "flex items-center gap-2 text-sm transition-colors",
                                    review.hasVoted
                                      ? "text-primary font-medium"
                                      : "text-muted-foreground hover:text-primary"
                                  )}
                                  title={review.hasVoted ? "Click to remove your vote" : "Mark as helpful"}
                                >
                                  <ThumbsUp className={cn("w-4 h-4", review.hasVoted && "fill-current")} />
                                  Helpful ({review.helpful})
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                        {reviews.length === 0 && (
                          <div className="text-center py-12 bg-card border border-border/50 rounded-2xl">
                            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
                            <p className="text-muted-foreground">Be the first to review this PC!</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Image Preview Modal */}
          {reviewImagePreview && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setReviewImagePreview(null)}>
              <div className="relative max-w-4xl max-h-[90vh] p-4">
                <button
                  onClick={() => setReviewImagePreview(null)}
                  className="absolute top-2 right-2 p-2 bg-background/90 rounded-full hover:bg-background z-10"
                >
                  <X className="w-6 h-6" />
                </button>
                <img src={reviewImagePreview} alt="" className="max-w-full max-h-[85vh] object-contain rounded-lg" />
              </div>
            </div>
          )}

          {/* Related PCs */}
          {relatedPCs.length > 0 && (
            <section className="mt-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl lg:text-3xl font-bold">Related Builds</h2>
                <Link href="/prebuilt-pcs" className="text-primary hover:text-primary/80 font-medium flex items-center gap-1">
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedPCs.map((relatedPC) => {
                  const relatedDiscount = Math.round(
                    ((parseFloat(relatedPC.totalPrice) - parseFloat(relatedPC.sellingPrice)) / parseFloat(relatedPC.totalPrice)) * 100
                  );
                  return (
                    <Link
                      key={relatedPC.id}
                      href={`/prebuilt-pc/${relatedPC.slug}`}
                      className="group bg-card border border-border/50 hover:border-primary/30 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
                    >
                      {/* Image */}
                      <div className="relative aspect-square bg-muted">
                        {relatedPC.primaryImage ? (
                          <img
                            src={relatedPC.primaryImage}
                            alt={relatedPC.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Monitor className="w-16 h-16 text-muted-foreground/50" />
                          </div>
                        )}
                        {relatedDiscount > 0 && (
                          <Badge className="absolute top-3 left-3 bg-red-500 text-white">
                            {relatedDiscount}% OFF
                          </Badge>
                        )}
                        {relatedPC.isFeatured && (
                          <Badge className="absolute top-3 right-3 bg-yellow-500 text-black">
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            Featured
                          </Badge>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        {relatedPC.pcType && (
                          <Badge variant="outline" className="text-xs mb-2">{relatedPC.pcType.name}</Badge>
                        )}
                        <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                          {relatedPC.name}
                        </h3>
                        {relatedPC.shortDescription && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{relatedPC.shortDescription}</p>
                        )}
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-xl font-bold text-primary">
                            ₹{parseFloat(relatedPC.sellingPrice).toLocaleString("en-IN")}
                          </span>
                          {relatedDiscount > 0 && (
                            <span className="text-sm text-muted-foreground line-through">
                              ₹{parseFloat(relatedPC.totalPrice).toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowReviewModal(false)}>
          <div
            className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Write a Review</h2>
                  <p className="text-sm text-muted-foreground">Posting as <span className="font-medium text-foreground">{user?.name}</span></p>
                </div>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitReview} className="p-6 space-y-5">
              {/* Review Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Review Title *</label>
                <input
                  type="text"
                  value={newReview.title}
                  onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="Summarize your experience"
                  required
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium mb-3">Your Rating *</label>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={cn(
                            "w-10 h-10 transition-colors",
                            star <= newReview.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30 hover:text-yellow-400"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-muted-foreground">{newReview.rating}/5</span>
                </div>
              </div>

              {/* Tags Dropdown */}
              <div>
                <label className="block text-sm font-medium mb-2">Add Tags (optional)</label>

                {/* Selected Tags */}
                {newReview.selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {newReview.selectedTags.map((tagId) => {
                      const tag = reviewTags.find((t) => t.id === tagId);
                      if (!tag) return null;
                      return (
                        <span
                          key={tag.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium text-white"
                          style={{ backgroundColor: tag.color }}
                        >
                          {tag.name}
                          <button
                            type="button"
                            onClick={() => removeReviewTag(tag.id)}
                            className="hover:bg-white/20 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowTagDropdown(!showTagDropdown)}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-left flex items-center justify-between hover:border-primary/50 transition-colors"
                  >
                    <span className="text-muted-foreground">
                      {newReview.selectedTags.length === 0 ? "Select tags that describe your experience..." : "Add more tags..."}
                    </span>
                    <ChevronRight className={cn("w-5 h-5 text-muted-foreground transition-transform", showTagDropdown && "rotate-90")} />
                  </button>

                  {showTagDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto">
                      {reviewTags.filter((tag) => !newReview.selectedTags.includes(tag.id)).map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => {
                            toggleReviewTag(tag.id);
                            setShowTagDropdown(false);
                          }}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-left"
                        >
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span>{tag.name}</span>
                        </button>
                      ))}
                      {reviewTags.filter((tag) => !newReview.selectedTags.includes(tag.id)).length === 0 && (
                        <div className="px-4 py-3 text-muted-foreground text-sm">All tags selected</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Your Review *</label>
                <textarea
                  value={newReview.description}
                  onChange={(e) => setNewReview({ ...newReview, description: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary min-h-[140px] resize-none transition-all"
                  placeholder="Share your detailed experience with this PC. What did you like? What could be better?"
                  required
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Add Photos (optional, up to 5)</label>

                {/* Image Previews */}
                {newReview.images.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-3">
                    {newReview.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img}
                          alt={`Preview ${idx + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border border-border"
                        />
                        <button
                          type="button"
                          onClick={() => removeReviewImage(idx)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                {newReview.images.length < 5 && (
                  <label className="flex items-center justify-center gap-3 px-4 py-6 bg-muted/50 hover:bg-muted border-2 border-dashed border-border hover:border-primary/50 rounded-xl cursor-pointer transition-all">
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {newReview.images.length === 0
                        ? "Click to upload images"
                        : `Add more (${5 - newReview.images.length} remaining)`}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                  </label>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-1 h-12 text-base gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  {submittingReview ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Review
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowReviewModal(false)} className="h-12 px-6">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Review Modal */}
      {showEditModal && editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => { setShowEditModal(false); setEditingReview(null); }}>
          <div
            className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Pencil className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Edit Your Review</h2>
                  <p className="text-sm text-muted-foreground">Update your review for this PC</p>
                </div>
              </div>
              <button
                onClick={() => { setShowEditModal(false); setEditingReview(null); }}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleUpdateReview} className="p-6 space-y-5">
              {/* Review Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Review Title *</label>
                <input
                  type="text"
                  value={newReview.title}
                  onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="Summarize your experience"
                  required
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium mb-3">Your Rating *</label>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={cn(
                            "w-10 h-10 transition-colors",
                            star <= newReview.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30 hover:text-yellow-400"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-muted-foreground">{newReview.rating}/5</span>
                </div>
              </div>

              {/* Tags Dropdown */}
              <div>
                <label className="block text-sm font-medium mb-2">Tags (optional)</label>
                {newReview.selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {newReview.selectedTags.map((tagId) => {
                      const tag = reviewTags.find((t) => t.id === tagId);
                      if (!tag) return null;
                      return (
                        <span
                          key={tag.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium text-white"
                          style={{ backgroundColor: tag.color }}
                        >
                          {tag.name}
                          <button
                            type="button"
                            onClick={() => removeReviewTag(tag.id)}
                            className="hover:bg-white/20 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowTagDropdown(!showTagDropdown)}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-left flex items-center justify-between hover:border-primary/50 transition-colors"
                  >
                    <span className="text-muted-foreground">
                      {newReview.selectedTags.length === 0 ? "Select tags..." : "Add more tags..."}
                    </span>
                    <ChevronRight className={cn("w-5 h-5 text-muted-foreground transition-transform", showTagDropdown && "rotate-90")} />
                  </button>
                  {showTagDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto">
                      {reviewTags.filter((tag) => !newReview.selectedTags.includes(tag.id)).map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => {
                            toggleReviewTag(tag.id);
                            setShowTagDropdown(false);
                          }}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-left"
                        >
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                          <span>{tag.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Your Review *</label>
                <textarea
                  value={newReview.description}
                  onChange={(e) => setNewReview({ ...newReview, description: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary min-h-[140px] resize-none transition-all"
                  placeholder="Share your detailed experience..."
                  required
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Photos (optional, up to 5)</label>
                {newReview.images.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-3">
                    {newReview.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img src={img} alt={`Preview ${idx + 1}`} className="w-20 h-20 object-cover rounded-lg border border-border" />
                        <button
                          type="button"
                          onClick={() => removeReviewImage(idx)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {newReview.images.length < 5 && (
                  <label className="flex items-center justify-center gap-3 px-4 py-6 bg-muted/50 hover:bg-muted border-2 border-dashed border-border hover:border-primary/50 rounded-xl cursor-pointer transition-all">
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    <span className="text-muted-foreground">Click to upload images</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
                  </label>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-1 h-12 text-base gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  {submittingReview ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Update Review
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowEditModal(false); setEditingReview(null); }} className="h-12 px-6">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
