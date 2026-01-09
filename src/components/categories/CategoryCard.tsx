"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Package, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    imageUrl?: string | null;
    productCount: number;
    childCount?: number;
  };
  variant?: "default" | "featured" | "compact";
}

const CategoryCard = ({ category, variant = "default" }: CategoryCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const defaultImage = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80";

  if (variant === "compact") {
    return (
      <Link
        href={`/category/${category.slug}`}
        className={cn(
          "group relative flex items-center gap-4 p-4 rounded-xl",
          "bg-card border border-border",
          "hover:border-primary/30 hover:shadow-lg",
          "dark:hover:shadow-xl dark:hover:shadow-primary/5",
          "transition-all duration-300"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image */}
        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
          <img
            src={category.imageUrl || defaultImage}
            alt={category.name}
            className={cn(
              "w-full h-full object-cover transition-transform duration-500",
              isHovered && "scale-110"
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
            {category.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {category.productCount} Products
          </p>
        </div>

        {/* Arrow */}
        <ArrowRight className={cn(
          "w-5 h-5 text-muted-foreground transition-all duration-300",
          "group-hover:text-primary group-hover:translate-x-1"
        )} />
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link
        href={`/category/${category.slug}`}
        className={cn(
          "group relative overflow-hidden rounded-2xl",
          "bg-card border border-border",
          "hover:border-primary/30",
          "transition-all duration-500"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={category.imageUrl || defaultImage}
            alt={category.name}
            className={cn(
              "w-full h-full object-cover transition-transform duration-700",
              isHovered && "scale-110"
            )}
          />

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          <div className={cn(
            "absolute inset-0 bg-primary/20 transition-opacity duration-500",
            isHovered ? "opacity-100" : "opacity-0"
          )} />

          {/* Floating Stats */}
          <div className="absolute top-4 right-4 flex gap-2">
            <div className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium",
              "bg-white/10 backdrop-blur-md text-white",
              "border border-white/20"
            )}>
              <Package className="w-3.5 h-3.5 inline-block mr-1.5" />
              {category.productCount} Products
            </div>
            {category.childCount && category.childCount > 0 && (
              <div className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium",
                "bg-white/10 backdrop-blur-md text-white",
                "border border-white/20"
              )}>
                <Layers className="w-3.5 h-3.5 inline-block mr-1.5" />
                {category.childCount} Subcategories
              </div>
            )}
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className={cn(
              "text-2xl font-bold text-white mb-2",
              "group-hover:text-primary transition-colors duration-300"
            )}>
              {category.name}
            </h3>
            {category.description && (
              <p className="text-white/70 text-sm line-clamp-2 mb-4">
                {category.description}
              </p>
            )}

            {/* CTA Button */}
            <div className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-lg",
              "bg-white/10 backdrop-blur-md text-white",
              "border border-white/20",
              "group-hover:bg-primary group-hover:border-primary",
              "transition-all duration-300"
            )}>
              <span className="text-sm font-medium">Explore Category</span>
              <ArrowRight className={cn(
                "w-4 h-4 transition-transform duration-300",
                "group-hover:translate-x-1"
              )} />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link
      href={`/category/${category.slug}`}
      className={cn(
        "group relative overflow-hidden rounded-xl",
        "bg-card border border-border",
        "hover:border-primary/30 hover:shadow-xl",
        "dark:hover:shadow-2xl dark:hover:shadow-primary/10",
        "transition-all duration-500",
        isHovered && "-translate-y-1"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={category.imageUrl || defaultImage}
          alt={category.name}
          className={cn(
            "w-full h-full object-cover transition-transform duration-700",
            isHovered && "scale-110"
          )}
        />

        {/* Gradient Overlay */}
        <div className={cn(
          "absolute inset-0 transition-opacity duration-500",
          "bg-gradient-to-t from-black/80 via-black/40 to-transparent",
          isHovered && "from-black/90 via-black/50"
        )} />

        {/* Decorative Corner */}
        <div className={cn(
          "absolute top-0 right-0 w-24 h-24",
          "bg-gradient-to-bl from-primary/30 to-transparent",
          "transition-opacity duration-500",
          isHovered ? "opacity-100" : "opacity-0"
        )} />

        {/* Product Count Badge */}
        <div className={cn(
          "absolute top-3 left-3",
          "px-3 py-1 rounded-full text-xs font-semibold",
          "bg-background/90 dark:bg-background/80 backdrop-blur-sm",
          "text-foreground border border-border/50",
          "shadow-lg"
        )}>
          {category.productCount} Products
        </div>

        {/* Content at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Category Name */}
          <h3 className={cn(
            "text-xl font-bold text-white mb-1",
            "group-hover:text-primary transition-colors duration-300"
          )}>
            {category.name}
          </h3>

          {/* Description */}
          {category.description && (
            <p className={cn(
              "text-white/70 text-sm line-clamp-2 mb-3",
              "transition-all duration-300",
              isHovered ? "opacity-100" : "opacity-80"
            )}>
              {category.description}
            </p>
          )}

          {/* View Link */}
          <div className={cn(
            "flex items-center gap-2 text-sm font-medium",
            "text-white/80 group-hover:text-primary",
            "transition-colors duration-300"
          )}>
            <span>Browse Products</span>
            <ArrowRight className={cn(
              "w-4 h-4 transition-transform duration-300",
              "group-hover:translate-x-1"
            )} />
          </div>
        </div>
      </div>

      {/* Bottom Accent Line */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-1",
        "bg-gradient-to-r from-primary via-primary/80 to-primary/60",
        "transform origin-left transition-transform duration-500",
        isHovered ? "scale-x-100" : "scale-x-0"
      )} />
    </Link>
  );
};

export default CategoryCard;
