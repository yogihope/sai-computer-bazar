"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  SlidersHorizontal,
  Grid3X3,
  LayoutGrid,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import ProductListingCard from "@/components/ProductListingCard";
import FilterPanel from "@/components/FilterPanel";
import MiniCart from "@/components/MiniCart";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  price: number;
  compareAtPrice: number | null;
  discount: number;
  isInStock: boolean;
  images: { url: string; alt: string | null; isPrimary: boolean }[];
  primaryCategory: { id: string; name: string; slug: string } | null;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const ProductListingContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [gridView, setGridView] = useState<"normal" | "compact">("normal");
  const [appliedFilters, setAppliedFilters] = useState<string[]>([]);

  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Get current filters from URL
  const currentCategorySlug = searchParams.get("category") || "";
  const sortBy = searchParams.get("sortBy") || "newest";
  const currentPage = parseInt(searchParams.get("page") || "1");
  const searchQuery = searchParams.get("search") || "";

  // Find current category
  const currentCategory = categories.find((c) => c.slug === currentCategorySlug);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/public/categories?limit=50");
        const data = await res.json();
        if (data.categories) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentCategorySlug) params.set("category", currentCategorySlug);
      if (sortBy) params.set("sortBy", sortBy);
      if (currentPage) params.set("page", currentPage.toString());
      if (searchQuery) params.set("search", searchQuery);
      params.set("limit", "20");

      const res = await fetch(`/api/public/products?${params.toString()}`);
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [currentCategorySlug, sortBy, currentPage, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Generate page title based on category
  const pageTitle = !currentCategorySlug ? "All Products" : currentCategory?.name || "Products";
  const pageSubtitle = !currentCategorySlug
    ? "Explore our complete range of products"
    : `Browse our selection of ${currentCategory?.name?.toLowerCase() || "products"}`;

  const handleCategoryChange = (slug: string) => {
    if (slug) {
      router.push(`/products?category=${slug}`);
    } else {
      router.push("/products");
    }
  };

  const handleSortChange = (newSortBy: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", newSortBy);
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/products?${params.toString()}`);
  };

  const handleAddToCart = (product: any) => {
    const existingItem = cartItems.find((item) => item.id === product.id);
    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
    setIsCartOpen(true);
  };

  const removeFilter = (filter: string) => {
    setAppliedFilters(appliedFilters.filter((f) => f !== filter));
  };

  const clearAllFilters = () => {
    setAppliedFilters([]);
    router.push("/products");
  };

  // Transform products for ProductListingCard
  const transformedProducts = products.map((product) => ({
    id: product.id,
    slug: product.slug,
    brand: product.brand || "",
    name: product.name,
    image: product.images[0]?.url || "/placeholder-product.png",
    hoverImage: product.images[1]?.url || product.images[0]?.url || "/placeholder-product.png",
    price: product.price,
    originalPrice: product.compareAtPrice || product.price,
    discount: product.discount,
    inStock: product.isInStock,
    category: product.primaryCategory?.slug || "",
  }));

  return (
    <>
      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        {/* Breadcrumb - Dynamic */}
        <nav className="flex items-center gap-1.5 text-sm mb-6">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
          <Link
            href="/products"
            className={cn(
              "transition-colors",
              currentCategorySlug
                ? "text-muted-foreground hover:text-foreground"
                : "text-foreground font-medium"
            )}
          >
            Products
          </Link>
          {currentCategorySlug && currentCategory && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
              <span className="text-foreground font-medium">{currentCategory.name}</span>
            </>
          )}
        </nav>

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            {pageTitle}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {pageSubtitle}
          </p>
        </div>

        {/* Category Navigation - Scrollable Pills */}
        <div className="mb-6 -mx-4 sm:mx-0">
          <div className="flex gap-2 overflow-x-auto px-4 sm:px-0 pb-2 scrollbar-hide">
            <button
              onClick={() => handleCategoryChange("")}
              className={cn(
                "flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200",
                "border",
                !currentCategorySlug
                  ? "bg-foreground text-background border-foreground"
                  : "bg-transparent text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
              )}
            >
              All Products
            </button>
            {categoriesLoading ? (
              <div className="flex items-center px-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              categories.slice(0, 11).map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.slug)}
                  className={cn(
                    "flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200",
                    "border",
                    currentCategorySlug === category.slug
                      ? "bg-foreground text-background border-foreground"
                      : "bg-transparent text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
                  )}
                >
                  {category.name}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Applied Filters */}
        {appliedFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {appliedFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => removeFilter(filter)}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-sm bg-muted rounded-full hover:bg-muted/80 transition-colors"
              >
                {filter}
                <X className="h-3 w-3" />
              </button>
            ))}
            <button
              onClick={() => setAppliedFilters([])}
              className="text-sm text-primary hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Main Grid Layout */}
        <div className="flex gap-8">
          {/* Filter Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <FilterPanel />
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-border">
              <p className="text-sm text-muted-foreground">
                {loading ? (
                  "Loading..."
                ) : (
                  <>
                    Showing{" "}
                    <span className="font-medium text-foreground">{pagination.total}</span>{" "}
                    {pagination.total === 1 ? "result" : "results"}
                  </>
                )}
              </p>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Mobile Filter Button */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="lg:hidden gap-2"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 p-0">
                    <SheetHeader className="p-4 border-b">
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="p-4 overflow-y-auto max-h-[calc(100vh-80px)]">
                      <FilterPanel />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Grid View Toggle */}
                <div className="hidden sm:flex items-center border border-border rounded-lg p-0.5">
                  <button
                    onClick={() => setGridView("normal")}
                    className={cn(
                      "p-1.5 rounded-md transition-colors",
                      gridView === "normal"
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setGridView("compact")}
                    className={cn(
                      "p-1.5 rounded-md transition-colors",
                      gridView === "compact"
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                </div>

                {/* Sort Dropdown */}
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[160px] sm:w-[180px] h-9 text-sm">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popularity">Popularity</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="newest">New Arrivals</SelectItem>
                    <SelectItem value="discount">Discount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : transformedProducts.length > 0 ? (
              <div
                className={cn(
                  "grid gap-4 sm:gap-5",
                  gridView === "normal"
                    ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4"
                )}
              >
                {transformedProducts.map((product) => (
                  <ProductListingCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    compact={gridView === "compact"}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <SlidersHorizontal className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-1">
                  No products found
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Try adjusting your filters or search criteria to find what you're looking for.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={clearAllFilters}
                >
                  Clear all filters
                </Button>
              </div>
            )}

            {/* Pagination */}
            {!loading && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "ghost"}
                        size="sm"
                        className="w-9 h-9"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= pagination.totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mini Cart Drawer */}
      <MiniCart
        items={cartItems}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={(id, quantity) => {
          if (quantity === 0) {
            setCartItems(cartItems.filter((item) => item.id !== id));
          } else {
            setCartItems(
              cartItems.map((item) =>
                item.id === id ? { ...item, quantity } : item
              )
            );
          }
        }}
      />
    </>
  );
};

export default ProductListingContent;
