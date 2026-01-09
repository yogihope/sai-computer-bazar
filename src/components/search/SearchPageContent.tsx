"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Loader2,
  Package,
  MonitorSmartphone,
  FileText,
  Filter,
  X,
  ArrowRight,
  Clock,
  Star,
  ShoppingCart,
  Heart,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SearchResult {
  type: "product" | "prebuilt" | "blog";
  id: string;
  name: string;
  slug: string;
  image: string | null;
  price?: number;
  readingTime?: number;
  category: string;
  link: string;
}

interface SearchCounts {
  products: number;
  prebuiltPCs: number;
  blogs: number;
  total: number;
}

interface SearchPageContentProps {
  initialQuery: string;
}

export default function SearchPageContent({ initialQuery }: SearchPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [counts, setCounts] = useState<SearchCounts>({ products: 0, prebuiltPCs: 0, blogs: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "product" | "prebuilt" | "blog">("all");
  const [hasSearched, setHasSearched] = useState(false);

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Type badge info
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "product":
        return { label: "Product", color: "bg-blue-500", icon: Package };
      case "prebuilt":
        return { label: "Prebuilt PC", color: "bg-purple-500", icon: MonitorSmartphone };
      case "blog":
        return { label: "Blog", color: "bg-green-500", icon: FileText };
      default:
        return { label: "Item", color: "bg-gray-500", icon: Package };
    }
  };

  // Search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      setCounts({ products: 0, prebuiltPCs: 0, blogs: 0, total: 0 });
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/public/search?q=${encodeURIComponent(searchQuery)}&limit=50`);
      const data = await res.json();

      if (res.ok) {
        setResults(data.results || []);
        setCounts(data.counts || { products: 0, prebuiltPCs: 0, blogs: 0, total: 0 });
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial search on mount
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      performSearch(q);
    }
  }, [searchParams, performSearch]);

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      performSearch(query.trim());
    }
  };

  // Filter results
  const filteredResults = activeFilter === "all"
    ? results
    : results.filter(r => r.type === activeFilter);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Search Section */}
      <section className="relative py-12 sm:py-16 bg-gradient-to-br from-primary/5 via-primary/10 to-secondary/5">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Search Our Store
            </h1>
            <p className="text-muted-foreground mb-8">
              Find products, prebuilt PCs, and helpful articles
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for products, prebuilt PCs, or blogs..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-32 text-lg rounded-xl border-2 focus:border-primary"
              />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-6"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="container mx-auto px-4 sm:px-6 py-8">
        {/* Results Header */}
        {hasSearched && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold">
                {isLoading ? (
                  "Searching..."
                ) : counts.total > 0 ? (
                  <>Found {counts.total} results for &quot;{searchParams.get("q")}&quot;</>
                ) : (
                  <>No results found for &quot;{searchParams.get("q")}&quot;</>
                )}
              </h2>
              {counts.total > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  {counts.products} Products, {counts.prebuiltPCs} Prebuilt PCs, {counts.blogs} Blogs
                </p>
              )}
            </div>

            {/* Filter Tabs */}
            {counts.total > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant={activeFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter("all")}
                  className="gap-2"
                >
                  All ({counts.total})
                </Button>
                {counts.products > 0 && (
                  <Button
                    variant={activeFilter === "product" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFilter("product")}
                    className="gap-2"
                  >
                    <Package className="w-4 h-4" />
                    Products ({counts.products})
                  </Button>
                )}
                {counts.prebuiltPCs > 0 && (
                  <Button
                    variant={activeFilter === "prebuilt" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFilter("prebuilt")}
                    className="gap-2"
                  >
                    <MonitorSmartphone className="w-4 h-4" />
                    Prebuilt PCs ({counts.prebuiltPCs})
                  </Button>
                )}
                {counts.blogs > 0 && (
                  <Button
                    variant={activeFilter === "blog" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFilter("blog")}
                    className="gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Blogs ({counts.blogs})
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Searching...</p>
          </div>
        )}

        {/* No Results */}
        {!isLoading && hasSearched && counts.total === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-muted mx-auto flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              We couldn&apos;t find anything matching &quot;{searchParams.get("q")}&quot;. Try different keywords or browse our categories.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/products">
                <Button variant="outline" className="gap-2">
                  <Package className="w-4 h-4" />
                  Browse Products
                </Button>
              </Link>
              <Link href="/prebuilt-pcs">
                <Button variant="outline" className="gap-2">
                  <MonitorSmartphone className="w-4 h-4" />
                  Prebuilt PCs
                </Button>
              </Link>
              <Link href="/blog">
                <Button variant="outline" className="gap-2">
                  <FileText className="w-4 h-4" />
                  Read Blog
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Results Grid */}
        {!isLoading && filteredResults.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredResults.map((result) => {
              const badge = getTypeBadge(result.type);
              const BadgeIcon = badge.icon;

              return (
                <Link
                  key={`${result.type}-${result.id}`}
                  href={result.link}
                  className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-muted overflow-hidden">
                    {result.image ? (
                      <Image
                        src={result.image}
                        alt={result.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BadgeIcon className="w-16 h-16 text-muted-foreground/30" />
                      </div>
                    )}

                    {/* Type Badge */}
                    <div className={cn("absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1.5", badge.color)}>
                      <BadgeIcon className="w-3 h-3" />
                      {badge.label}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">{result.category}</p>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem]">
                      {result.name}
                    </h3>

                    {/* Price or Reading Time */}
                    <div className="mt-3 flex items-center justify-between">
                      {result.price !== undefined ? (
                        <span className="text-lg font-bold text-primary">{formatPrice(result.price)}</span>
                      ) : result.readingTime !== undefined ? (
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {result.readingTime} min read
                        </span>
                      ) : null}

                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Initial State - No Search Yet */}
        {!hasSearched && !isLoading && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Start Searching</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Enter your search query above to find products, prebuilt PCs, and helpful blog articles.
            </p>

            {/* Popular Searches */}
            <div className="max-w-2xl mx-auto">
              <p className="text-sm font-medium text-muted-foreground mb-4">Popular Searches</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {["RTX 4090", "Gaming PC", "AMD Ryzen", "Motherboard", "RAM DDR5", "SSD"].map((term) => (
                  <Button
                    key={term}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuery(term);
                      router.push(`/search?q=${encodeURIComponent(term)}`);
                      performSearch(term);
                    }}
                  >
                    {term}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
