"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  SlidersHorizontal,
  Grid3X3,
  LayoutGrid,
  Loader2,
  ChevronRight,
  ArrowRight,
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
import { cn } from "@/lib/utils";
import { CategoryHero, SubcategoryPills, CategoryCard } from "./index";

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  isFeatured: boolean;
  totalProducts: number;
  parent: {
    id: string;
    name: string;
    slug: string;
  } | null;
  children: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    _count: { products: number };
  }[];
  _count: { products: number };
  // SEO
  seoTitle: string | null;
  seoDescription: string | null;
}

interface SiblingCategory {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  _count: { products: number };
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

interface CategoryProductsContentProps {
  slug: string;
}

const CategoryProductsContent = ({ slug }: CategoryProductsContentProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Category data
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [siblings, setSiblings] = useState<SiblingCategory[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // Products data
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [productsLoading, setProductsLoading] = useState(true);

  // UI states
  const [gridView, setGridView] = useState<"normal" | "compact">("normal");

  // URL params
  const sortBy = searchParams.get("sortBy") || "newest";
  const currentPage = parseInt(searchParams.get("page") || "1");

  // Fetch category data
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setCategoryLoading(true);
        setCategoryError(null);

        const res = await fetch(`/api/public/categories/${slug}`);
        const data = await res.json();

        if (!res.ok) {
          setCategoryError(data.error || "Category not found");
          return;
        }

        setCategory(data.category);
        setSiblings(data.siblings || []);
      } catch (error) {
        console.error("Error fetching category:", error);
        setCategoryError("Failed to load category");
      } finally {
        setCategoryLoading(false);
      }
    };

    if (slug) {
      fetchCategory();
    }
  }, [slug]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    if (!slug) return;

    setProductsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("category", slug);
      params.set("sortBy", sortBy);
      params.set("page", currentPage.toString());
      params.set("limit", "20");

      const res = await fetch(`/api/public/products?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.products) {
        setProducts(data.products);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setProductsLoading(false);
    }
  }, [slug, sortBy, currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handlers
  const handleSortChange = (newSortBy: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", newSortBy);
    params.delete("page");
    router.push(`/category/${slug}?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/category/${slug}?${params.toString()}`);
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

  // Loading state
  if (categoryLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading category...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (categoryError || !category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <SlidersHorizontal className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Category Not Found</h1>
          <p className="text-muted-foreground mb-6">
            {categoryError || "The category you're looking for doesn't exist or has been removed."}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.back()} variant="outline">
              Go Back
            </Button>
            <Button asChild>
              <Link href="/categories">Browse Categories</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <CategoryHero
        category={{
          name: category.name,
          slug: category.slug,
          description: category.description,
          imageUrl: category.imageUrl,
          productCount: category.totalProducts,
          childCount: category.children.length,
          parent: category.parent,
        }}
      />

      {/* Subcategories Pills */}
      {category.children.length > 0 && (
        <SubcategoryPills subcategories={category.children} />
      )}

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
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
                {productsLoading ? (
                  "Loading products..."
                ) : (
                  <>
                    Showing{" "}
                    <span className="font-medium text-foreground">{pagination.total}</span>{" "}
                    {pagination.total === 1 ? "product" : "products"}
                  </>
                )}
              </p>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Mobile Filter Button */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden gap-2">
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
            {productsLoading ? (
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
                  There are no products in this category yet. Check back later or explore other categories.
                </p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/categories">Browse Categories</Link>
                </Button>
              </div>
            )}

            {/* Pagination */}
            {!productsLoading && pagination.totalPages > 1 && (
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

        {/* Related Categories Section */}
        {siblings.length > 0 && (
          <section className="mt-16 pt-10 border-t border-border">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Related Categories</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Explore similar categories you might be interested in
                </p>
              </div>
              <Button variant="outline" size="sm" asChild className="hidden sm:flex">
                <Link href="/categories">
                  View All <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {siblings.slice(0, 3).map((sib) => (
                <CategoryCard
                  key={sib.id}
                  category={{
                    ...sib,
                    productCount: sib._count.products,
                  }}
                  variant="compact"
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default CategoryProductsContent;
