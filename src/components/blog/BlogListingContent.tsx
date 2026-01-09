"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Clock,
  Eye,
  Loader2,
  ArrowRight,
  Sparkles,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  BookOpen,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  featuredImageAlt: string | null;
  authorName: string;
  authorImage: string | null;
  readingTime: number;
  viewCount: number;
  publishedAt: string;
  isFeatured: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
    color: string;
  } | null;
  tags: { id: string; name: string; slug: string }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  blogCount: number;
}

interface PopularTag {
  name: string;
  slug: string;
  _count: { id: number };
}

export default function BlogListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [popularTags, setPopularTags] = useState<PopularTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", currentPage.toString());
      params.set("limit", "12");
      if (searchQuery) params.set("search", searchQuery);
      if (activeCategory) params.set("category", activeCategory);

      const res = await fetch(`/api/public/blogs?${params.toString()}`);
      const data = await res.json();

      if (data.blogs) {
        setBlogs(data.blogs);
        setCategories(data.categories || []);
        setPopularTags(data.popularTags || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalBlogs(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, activeCategory]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  // Update URL on filter change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (activeCategory) params.set("category", activeCategory);
    if (currentPage > 1) params.set("page", currentPage.toString());

    const queryString = params.toString();
    router.push(`/blog${queryString ? `?${queryString}` : ""}`, { scroll: false });
  }, [searchQuery, activeCategory, currentPage, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleCategoryClick = (slug: string) => {
    setActiveCategory(activeCategory === slug ? "" : slug);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setActiveCategory("");
    setCurrentPage(1);
  };

  const featuredBlogs = blogs.filter((b) => b.isFeatured);
  const regularBlogs = blogs.filter((b) => !b.isFeatured);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16 sm:py-24">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Our Blog</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-glow-teal">
              Tech Insights & Guides
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              Expert tips, buying guides, and the latest tech news to help you make informed decisions
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-6 text-base rounded-full border-border/50 bg-background/80 backdrop-blur-sm focus:border-primary"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            variant={activeCategory === "" ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryClick("")}
            className="rounded-full"
          >
            All Posts
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.slug ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryClick(category.slug)}
              className="rounded-full gap-2"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              {category.name}
              <span className="text-muted-foreground">({category.blogCount})</span>
            </Button>
          ))}
        </div>

        {/* Active Filters */}
        {(searchQuery || activeCategory) && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-sm text-muted-foreground">Filters:</span>
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                Search: {searchQuery}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setSearchQuery("")}
                />
              </Badge>
            )}
            {activeCategory && (
              <Badge variant="secondary" className="gap-1">
                Category: {categories.find((c) => c.slug === activeCategory)?.name}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setActiveCategory("")}
                />
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          </div>
        )}
      </section>

      {/* Blog Grid */}
      <section className="container mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Articles Found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || activeCategory
                ? "Try adjusting your filters or search query"
                : "Check back soon for new articles"}
            </p>
            {(searchQuery || activeCategory) && (
              <Button onClick={clearFilters}>Clear Filters</Button>
            )}
          </div>
        ) : (
          <>
            {/* Featured Blogs Row */}
            {featuredBlogs.length > 0 && currentPage === 1 && !searchQuery && !activeCategory && (
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-5 h-5 text-accent" />
                  <h2 className="text-xl font-bold">Featured Articles</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {featuredBlogs.slice(0, 2).map((blog) => (
                    <Link
                      key={blog.id}
                      href={`/blog/${blog.slug}`}
                      className="group glass-panel rounded-2xl overflow-hidden hover-scale"
                    >
                      <div className="relative h-64 sm:h-80 bg-gradient-to-br from-primary/20 to-secondary/20">
                        {blog.featuredImage ? (
                          <Image
                            src={blog.featuredImage}
                            alt={blog.featuredImageAlt || blog.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <TrendingUp className="w-20 h-20 text-primary/20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                        {blog.category && (
                          <div
                            className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold text-white"
                            style={{ backgroundColor: blog.category.color }}
                          >
                            {blog.category.name}
                          </div>
                        )}

                        <div className="absolute top-4 right-4 bg-accent px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Featured
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            {blog.title}
                          </h3>
                          {blog.excerpt && (
                            <p className="text-white/70 text-sm line-clamp-2 mb-4">
                              {blog.excerpt}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center text-white text-xs font-bold">
                                {blog.authorName.charAt(0)}
                              </div>
                              <div>
                                <p className="text-white text-sm">{blog.authorName}</p>
                                <p className="text-white/60 text-xs">
                                  {format(new Date(blog.publishedAt), "MMM d, yyyy")}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-white/60 text-xs">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {blog.readingTime} min
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5" />
                                {blog.viewCount.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                Showing {blogs.length} of {totalBlogs} articles
              </p>
            </div>

            {/* Regular Blog Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(currentPage === 1 && !searchQuery && !activeCategory ? regularBlogs : blogs).map((blog) => (
                <Link
                  key={blog.id}
                  href={`/blog/${blog.slug}`}
                  className="group glass-panel rounded-xl overflow-hidden hover-scale flex flex-col"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                    {blog.featuredImage ? (
                      <Image
                        src={blog.featuredImage}
                        alt={blog.featuredImageAlt || blog.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <TrendingUp className="w-12 h-12 text-primary/20" />
                      </div>
                    )}

                    {blog.category && (
                      <div
                        className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold text-white"
                        style={{ backgroundColor: blog.category.color }}
                      >
                        {blog.category.name}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5 flex flex-col">
                    <h3 className="font-bold text-base sm:text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {blog.title}
                    </h3>
                    {blog.excerpt && (
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-1">
                        {blog.excerpt}
                      </p>
                    )}

                    {/* Tags */}
                    {blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {blog.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag.id}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground"
                          >
                            #{tag.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold">
                          {blog.authorName.charAt(0)}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(blog.publishedAt), "MMM d")}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {blog.readingTime} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {blog.viewCount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="icon"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Popular Tags Section */}
      {popularTags.length > 0 && (
        <section className="container mx-auto px-4 sm:px-6 py-12 border-t border-border/30">
          <div className="flex items-center gap-3 mb-6">
            <Tag className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Popular Tags</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {popularTags.map((tag) => (
              <Link
                key={tag.slug}
                href={`/blog?tag=${tag.slug}`}
                className="px-4 py-2 rounded-full bg-muted/50 hover:bg-primary/10 border border-border/50 hover:border-primary/50 transition-all text-sm"
              >
                #{tag.name}
                <span className="text-muted-foreground ml-1">({tag._count.id})</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
