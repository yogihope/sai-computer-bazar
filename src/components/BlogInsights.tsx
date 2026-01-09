"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowRight, Eye, Loader2, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { format } from "date-fns";

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
    name: string;
    slug: string;
    color: string;
  } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  blogCount: number;
}

const BlogInsights = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch("/api/public/blogs?limit=6");
        const data = await res.json();
        if (data.blogs) {
          setBlogs(data.blogs);
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-glow-teal">Insights & Guides</h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg">Learn from experts before you buy</p>
        </div>
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (blogs.length === 0) {
    return null;
  }

  // Featured blog (first one)
  const featuredBlog = blogs.find((b) => b.isFeatured) || blogs[0];
  const otherBlogs = blogs.filter((b) => b.id !== featuredBlog.id).slice(0, 5);

  return (
    <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-16">
      {/* Section Header */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Latest Articles</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-glow-teal">
          Insights & Guides
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
          Expert tips, buying guides, and tech insights to help you make informed decisions
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Featured Blog - Large Card */}
        <div className="lg:col-span-7">
          <Link
            href={`/blog/${featuredBlog.slug}`}
            className="group block glass-panel rounded-2xl overflow-hidden hover-scale h-full"
          >
            {/* Featured Image */}
            <div className="relative h-56 sm:h-72 lg:h-80 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
              {featuredBlog.featuredImage ? (
                <Image
                  src={featuredBlog.featuredImage}
                  alt={featuredBlog.featuredImageAlt || featuredBlog.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-6">
                    <TrendingUp className="w-16 h-16 text-primary/30 mx-auto mb-4" />
                    <span className="text-muted-foreground/50 text-lg">{featuredBlog.title}</span>
                  </div>
                </div>
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Category Badge */}
              {featuredBlog.category && (
                <div
                  className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold text-white backdrop-blur-sm"
                  style={{ backgroundColor: featuredBlog.category.color || "#6366f1" }}
                >
                  {featuredBlog.category.name}
                </div>
              )}

              {/* Featured Badge */}
              {featuredBlog.isFeatured && (
                <div className="absolute top-4 right-4 bg-accent/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-accent-foreground flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Featured
                </div>
              )}

              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                  {featuredBlog.title}
                </h3>
                {featuredBlog.excerpt && (
                  <p className="text-white/80 text-sm sm:text-base line-clamp-2 mb-4">
                    {featuredBlog.excerpt}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {featuredBlog.authorImage ? (
                      <Image
                        src={featuredBlog.authorImage}
                        alt={featuredBlog.authorName}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                        {featuredBlog.authorName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-white text-sm font-medium">{featuredBlog.authorName}</p>
                      <p className="text-white/60 text-xs">
                        {format(new Date(featuredBlog.publishedAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-white/60 text-xs">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {featuredBlog.readingTime} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {featuredBlog.viewCount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Other Blogs - Stacked Cards */}
        <div className="lg:col-span-5 space-y-4">
          {otherBlogs.slice(0, 3).map((blog) => (
            <Link
              key={blog.id}
              href={`/blog/${blog.slug}`}
              className="group flex gap-4 glass-panel rounded-xl p-3 hover-scale"
            >
              {/* Thumbnail */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary/20 to-secondary/20">
                {blog.featuredImage ? (
                  <Image
                    src={blog.featuredImage}
                    alt={blog.featuredImageAlt || blog.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-primary/30" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                {blog.category && (
                  <span
                    className="inline-block w-fit px-2 py-0.5 rounded text-[10px] font-bold text-white mb-1"
                    style={{ backgroundColor: blog.category.color || "#6366f1" }}
                  >
                    {blog.category.name}
                  </span>
                )}
                <h4 className="font-bold text-sm sm:text-base line-clamp-2 group-hover:text-primary transition-colors">
                  {blog.title}
                </h4>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
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
            </Link>
          ))}

          {/* View All Button */}
          <Link href="/blog" className="block">
            <Button variant="outline" className="w-full group glow-teal">
              View All Articles
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="mt-8 sm:mt-12 flex flex-wrap justify-center gap-3">
          {categories.slice(0, 6).map((category) => (
            <Link
              key={category.id}
              href={`/blog?category=${category.slug}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 hover:bg-primary/10 border border-border/50 hover:border-primary/50 transition-all text-sm"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              {category.name}
              <span className="text-muted-foreground">({category.blogCount})</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default BlogInsights;
