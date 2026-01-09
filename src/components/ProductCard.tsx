"use client";

import Link from "next/link";
import { Heart, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { formatPrice, cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useState } from "react";
import { toast } from "sonner";

interface ProductCardProps {
  id?: string | number;
  slug?: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  discount: number;
  type?: "product" | "prebuilt";
}

const ProductCard = ({ id, slug, name, image, price, originalPrice, discount, type = "product" }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  const productId = id ? String(id) : undefined;
  const isWishlisted = productId ? isInWishlist(productId, type) : false;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!productId) return;

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
    if (!productId) return;

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

  const cardContent = (
    <>
      <div className="relative aspect-square bg-background/50 p-2 sm:p-4">
        <img src={image} alt={name} className="w-full h-full object-contain" />
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex flex-col gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "h-6 w-6 sm:h-8 sm:w-8 glass-panel",
              isWishlisted && "text-red-500"
            )}
            onClick={handleToggleWishlist}
            disabled={isTogglingWishlist}
          >
            {isTogglingWishlist ? (
              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
            ) : (
              <Heart className={cn("h-3 w-3 sm:h-4 sm:w-4", isWishlisted && "fill-current")} />
            )}
          </Button>
        </div>
        {discount > 0 && (
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-destructive text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-sm font-bold">
            -{discount}%
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        <h3 className="font-medium text-xs sm:text-sm md:text-base line-clamp-2 min-h-[2rem] sm:min-h-[3rem]">{name}</h3>

        <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
          <span className="text-base sm:text-lg md:text-2xl font-bold text-primary">₹{formatPrice(price)}</span>
          {originalPrice > price && (
            <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground line-through">
              ₹{formatPrice(originalPrice)}
            </span>
          )}
        </div>

        <Button
          variant="destructive"
          className="w-full glow-blue h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
          onClick={handleAddToCart}
          disabled={isAddingToCart}
        >
          {isAddingToCart ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              ADD TO CART
            </>
          )}
        </Button>
      </div>
    </>
  );

  const cardClassName = "glass-panel rounded-lg sm:rounded-xl overflow-hidden group hover:scale-[1.02] sm:hover:scale-105 transition-all duration-300 hover:shadow-xl sm:hover:shadow-2xl hover:shadow-primary/20 block";

  const linkHref = type === "prebuilt" ? `/prebuilt-pcs/${slug}` : `/product/${slug}`;

  if (slug) {
    return (
      <Link href={linkHref} className={cardClassName}>
        {cardContent}
      </Link>
    );
  }

  return (
    <div className={cardClassName}>
      {cardContent}
    </div>
  );
};

export default ProductCard;
