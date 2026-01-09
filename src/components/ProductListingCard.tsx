"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Heart, Eye, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { cn, formatPrice } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { toast } from "sonner";

interface ProductListingCardProps {
  product: {
    id: number | string;
    slug?: string;
    brand: string;
    name: string;
    image: string;
    hoverImage?: string;
    price: number;
    originalPrice: number;
    discount: number;
    inStock: boolean;
  };
  onAddToCart?: (product: any) => void;
  compact?: boolean;
  type?: "product" | "prebuilt";
}

const ProductListingCard = ({
  product,
  onAddToCart,
  compact = false,
  type = "product",
}: ProductListingCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const productId = String(product.id);
  const isWishlisted = isInWishlist(productId, type);

  const formattedPrice = `₹${formatPrice(product.price)}`;
  const formattedOriginalPrice = `₹${formatPrice(product.originalPrice)}`;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onAddToCart) {
      onAddToCart(product);
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCart(productId, type, 1);
      toast.success("Added to cart!");
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsTogglingWishlist(true);
    try {
      await toggleWishlist(productId, type);
      toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist!");
    } catch {
      toast.error("Failed to update wishlist");
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const linkHref = type === "prebuilt" ? `/prebuilt-pcs/${product.slug || product.id}` : `/product/${product.slug || product.id}`;

  return (
    <div
      className={cn(
        "group relative bg-card rounded-xl overflow-hidden transition-all duration-300",
        "border border-border hover:border-border/80",
        "hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-black/20",
        isHovered && "-translate-y-0.5"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container */}
      <Link href={linkHref} className="block">
        <div
          className={cn(
            "relative bg-muted/30 overflow-hidden",
            compact ? "aspect-square p-3" : "aspect-[4/3] p-4"
          )}
        >
          {/* Product Image */}
          <img
            src={isHovered && product.hoverImage ? product.hoverImage : product.image}
            alt={product.name}
            className={cn(
              "w-full h-full object-contain transition-transform duration-500",
              isHovered && "scale-105"
            )}
          />

          {/* Discount Badge - Subtle */}
          {product.discount > 0 && (
            <div
              className={cn(
                "absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-medium",
                "bg-red-500/90 text-white"
              )}
            >
              -{product.discount}%
            </div>
          )}

          {/* Stock Status Badge */}
          {!product.inStock && (
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
              Out of Stock
            </div>
          )}

          {/* Quick Action Icons - Fade in on hover */}
          <div
            className={cn(
              "absolute bottom-3 left-1/2 -translate-x-1/2",
              "flex items-center gap-1.5",
              "transition-all duration-300",
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            )}
          >
            {/* Add to Cart */}
            <Button
              size="icon"
              variant="secondary"
              className={cn(
                "h-9 w-9 rounded-lg shadow-md",
                "bg-background/95 backdrop-blur-sm",
                "hover:bg-primary hover:text-primary-foreground",
                "transition-colors"
              )}
              onClick={handleAddToCart}
              disabled={!product.inStock || isAddingToCart}
            >
              {isAddingToCart ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShoppingCart className="h-4 w-4" />
              )}
            </Button>

            {/* Wishlist */}
            <Button
              size="icon"
              variant="secondary"
              className={cn(
                "h-9 w-9 rounded-lg shadow-md",
                "bg-background/95 backdrop-blur-sm",
                "hover:bg-red-500 hover:text-white",
                "transition-colors",
                isWishlisted && "bg-red-500 text-white"
              )}
              onClick={handleToggleWishlist}
              disabled={isTogglingWishlist}
            >
              {isTogglingWishlist ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
              )}
            </Button>

            {/* Quick View */}
            <Button
              size="icon"
              variant="secondary"
              className={cn(
                "h-9 w-9 rounded-lg shadow-md",
                "bg-background/95 backdrop-blur-sm",
                "hover:bg-foreground hover:text-background",
                "transition-colors"
              )}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Quick view logic
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className={cn("p-4", compact && "p-3")}>
        {/* Brand */}
        <p
          className={cn(
            "text-xs text-muted-foreground uppercase tracking-wide mb-1",
            compact && "text-[10px]"
          )}
        >
          {product.brand}
        </p>

        {/* Product Name */}
        <Link href={linkHref}>
          <h3
            className={cn(
              "font-medium text-foreground line-clamp-2 leading-snug",
              "hover:text-primary transition-colors",
              compact ? "text-xs min-h-[2.25rem]" : "text-sm min-h-[2.5rem]"
            )}
          >
            {product.name}
          </h3>
        </Link>

        {/* Price Section */}
        <div className={cn("flex items-baseline gap-2 mt-2", compact && "mt-1.5")}>
          <span
            className={cn(
              "font-semibold text-foreground",
              compact ? "text-base" : "text-lg"
            )}
          >
            {formattedPrice}
          </span>
          {product.originalPrice > product.price && (
            <span
              className={cn(
                "text-muted-foreground line-through",
                compact ? "text-xs" : "text-sm"
              )}
            >
              {formattedOriginalPrice}
            </span>
          )}
        </div>

        {/* Stock Status Text */}
        {product.inStock ? (
          <p className="text-xs text-green-600 dark:text-green-500 mt-1.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            In Stock
          </p>
        ) : (
          <p className="text-xs text-muted-foreground mt-1.5">
            Currently unavailable
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductListingCard;
