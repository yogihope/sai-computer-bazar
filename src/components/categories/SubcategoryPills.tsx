"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  _count: {
    products: number;
  };
}

interface SubcategoryPillsProps {
  subcategories: Subcategory[];
  currentSlug?: string;
}

const SubcategoryPills = ({ subcategories, currentSlug }: SubcategoryPillsProps) => {
  if (!subcategories || subcategories.length === 0) return null;

  return (
    <div className="py-6 border-b border-border bg-muted/30">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-sm font-semibold text-foreground">Browse Subcategories</h2>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="flex flex-wrap gap-3">
          {subcategories.map((sub) => (
            <Link
              key={sub.id}
              href={`/category/${sub.slug}`}
              className={cn(
                "group relative flex items-center gap-3 px-4 py-2.5 rounded-xl",
                "bg-card border border-border",
                "hover:border-primary/50 hover:shadow-md",
                "dark:hover:shadow-lg dark:hover:shadow-primary/5",
                "transition-all duration-300",
                currentSlug === sub.slug && "border-primary bg-primary/5"
              )}
            >
              {/* Mini Image */}
              {sub.imageUrl && (
                <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                  <img
                    src={sub.imageUrl}
                    alt={sub.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <span className={cn(
                  "text-sm font-medium text-foreground",
                  "group-hover:text-primary transition-colors"
                )}>
                  {sub.name}
                </span>
                <span className="ml-2 text-xs text-muted-foreground">
                  ({sub._count.products})
                </span>
              </div>

              {/* Arrow */}
              <ChevronRight className={cn(
                "w-4 h-4 text-muted-foreground",
                "group-hover:text-primary group-hover:translate-x-0.5",
                "transition-all duration-300"
              )} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubcategoryPills;
