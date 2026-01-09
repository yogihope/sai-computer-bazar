"use client";

import Link from "next/link";
import { ChevronRight, Package, Layers, Grid3X3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryHeroProps {
  category: {
    name: string;
    slug: string;
    description?: string | null;
    imageUrl?: string | null;
    productCount: number;
    childCount?: number;
    parent?: {
      name: string;
      slug: string;
    } | null;
  };
}

const CategoryHero = ({ category }: CategoryHeroProps) => {
  const defaultImage = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80";

  return (
    <div className="relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={category.imageUrl || defaultImage}
          alt={category.name}
          className="w-full h-full object-cover"
        />
        {/* Multi-layer gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

        {/* Decorative Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Animated gradient accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />
      </div>

      {/* Content */}
      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 py-12 md:py-20">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6">
          <Link
            href="/"
            className="text-white/60 hover:text-white transition-colors"
          >
            Home
          </Link>
          <ChevronRight className="w-4 h-4 text-white/40" />
          <Link
            href="/categories"
            className="text-white/60 hover:text-white transition-colors"
          >
            Categories
          </Link>
          {category.parent && (
            <>
              <ChevronRight className="w-4 h-4 text-white/40" />
              <Link
                href={`/category/${category.parent.slug}`}
                className="text-white/60 hover:text-white transition-colors"
              >
                {category.parent.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-4 h-4 text-white/40" />
          <span className="text-primary font-medium">{category.name}</span>
        </nav>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          {/* Left: Title & Description */}
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-lg text-white/70 leading-relaxed">
                {category.description}
              </p>
            )}
          </div>

          {/* Right: Stats */}
          <div className="flex flex-wrap gap-3">
            {/* Products Count */}
            <div className={cn(
              "flex items-center gap-3 px-5 py-3 rounded-xl",
              "bg-white/10 backdrop-blur-md",
              "border border-white/20"
            )}>
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{category.productCount}</p>
                <p className="text-xs text-white/60">Products</p>
              </div>
            </div>

            {/* Subcategories Count */}
            {category.childCount !== undefined && category.childCount > 0 && (
              <div className={cn(
                "flex items-center gap-3 px-5 py-3 rounded-xl",
                "bg-white/10 backdrop-blur-md",
                "border border-white/20"
              )}>
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{category.childCount}</p>
                  <p className="text-xs text-white/60">Subcategories</p>
                </div>
              </div>
            )}

            {/* View Type Indicator */}
            <div className={cn(
              "flex items-center gap-3 px-5 py-3 rounded-xl",
              "bg-primary/20 backdrop-blur-md",
              "border border-primary/30"
            )}>
              <Grid3X3 className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-white">Grid View</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryHero;
