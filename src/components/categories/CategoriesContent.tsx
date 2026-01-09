"use client";

import { useState, useEffect } from "react";
import { Search, Grid3X3, List, Loader2, Sparkles, Package, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import CategoryCard from "./CategoryCard";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  displayOrder: number;
  parentId: string | null;
  _count: {
    products: number;
  };
}

const CategoriesContent = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFeatured, setShowFeatured] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/public/categories?limit=50");
        const data = await res.json();
        if (res.ok && data.categories) {
          setCategories(data.categories);
          setFilteredCategories(data.categories);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Filter categories based on search
  useEffect(() => {
    let filtered = categories;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (cat) =>
          cat.name.toLowerCase().includes(query) ||
          cat.description?.toLowerCase().includes(query)
      );
    }

    // Featured filter (parent categories only)
    if (showFeatured) {
      filtered = filtered.filter((cat) => cat.parentId === null);
    }

    setFilteredCategories(filtered);
  }, [searchQuery, showFeatured, categories]);

  // Separate parent and child categories
  const parentCategories = filteredCategories.filter((cat) => cat.parentId === null);
  const childCategories = filteredCategories.filter((cat) => cat.parentId !== null);

  // Get children for a parent
  const getChildren = (parentId: string) => {
    return categories.filter((cat) => cat.parentId === parentId);
  };

  // Stats
  const totalProducts = categories.reduce((sum, cat) => sum + cat._count.products, 0);
  const parentCount = categories.filter((cat) => cat.parentId === null).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 py-12 md:py-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-6">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-primary font-medium">Categories</span>
          </nav>

          {/* Title & Description */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm font-medium text-primary uppercase tracking-wide">
                  Explore Our Collection
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                All Categories
              </h1>
              <p className="text-lg text-muted-foreground">
                Discover our wide range of computer components, gaming gear, and accessories.
                Find exactly what you need for your perfect setup.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="flex gap-4">
              <div className={cn(
                "flex items-center gap-3 px-5 py-3 rounded-xl",
                "bg-card border border-border shadow-sm"
              )}>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Grid3X3 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{parentCount}</p>
                  <p className="text-xs text-muted-foreground">Categories</p>
                </div>
              </div>
              <div className={cn(
                "flex items-center gap-3 px-5 py-3 rounded-xl",
                "bg-card border border-border shadow-sm"
              )}>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalProducts}</p>
                  <p className="text-xs text-muted-foreground">Products</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="sticky top-[88px] z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "w-full pl-10 h-10 rounded-lg",
                  "bg-muted/50 border-border/50",
                  "focus:bg-background focus:border-primary/50"
                )}
              />
            </div>

            {/* View Toggle & Filter */}
            <div className="flex items-center gap-3">
              {/* Parent Only Toggle */}
              <Button
                variant={showFeatured ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFeatured(!showFeatured)}
                className="h-10"
              >
                Main Categories
              </Button>

              {/* View Mode */}
              <div className="flex items-center rounded-lg border border-border overflow-hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "h-10 w-10 rounded-none",
                    viewMode === "grid" && "bg-primary/10 text-primary"
                  )}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "h-10 w-10 rounded-none border-l border-border",
                    viewMode === "list" && "bg-primary/10 text-primary"
                  )}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              {/* Results Count */}
              <span className="text-sm text-muted-foreground hidden sm:block">
                {filteredCategories.length} categories
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No categories found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or filter to find what you&apos;re looking for.
            </p>
            <Button onClick={() => { setSearchQuery(""); setShowFeatured(false); }}>
              Clear Filters
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <>
            {/* Featured/Parent Categories */}
            {parentCategories.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Main Categories</h2>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {parentCategories.map((category) => (
                    <CategoryCard
                      key={category.id}
                      category={{
                        ...category,
                        productCount: category._count.products,
                        childCount: getChildren(category.id).length,
                      }}
                      variant="featured"
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Subcategories */}
            {childCategories.length > 0 && !showFeatured && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Subcategories</h2>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {childCategories.map((category) => (
                    <CategoryCard
                      key={category.id}
                      category={{
                        ...category,
                        productCount: category._count.products,
                      }}
                      variant="default"
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          /* List View */
          <div className="space-y-4">
            {filteredCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={{
                  ...category,
                  productCount: category._count.products,
                  childCount: category.parentId === null ? getChildren(category.id).length : undefined,
                }}
                variant="compact"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesContent;
