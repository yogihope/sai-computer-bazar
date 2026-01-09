"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Clock,
  Eye,
  Loader2,
  ArrowLeft,
  Calendar,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link2,
  ChevronRight,
  Tag,
  TrendingUp,
  User,
  BookOpen,
  Heart,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featuredImage: string | null;
  featuredImageAlt: string | null;
  authorName: string;
  authorImage: string | null;
  authorBio: string | null;
  readingTime: number;
  viewCount: number;
  publishedAt: string;
  isFeatured: boolean;
  allowComments: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
    color: string;
  } | null;
  tags: { id: string; name: string; slug: string }[];
}

interface RelatedBlog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  featuredImageAlt: string | null;
  authorName: string;
  readingTime: number;
  publishedAt: string;
  category: {
    name: string;
    slug: string;
    color: string;
  } | null;
}

interface BlogContentProps {
  slug: string;
}

export default function BlogContent({ slug }: BlogContentProps) {
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<RelatedBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [readProgress, setReadProgress] = useState(0);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(`/api/public/blogs/${slug}`);
        const data = await res.json();

        if (res.ok && data.blog) {
          setBlog(data.blog);
          setRelatedBlogs(data.relatedBlogs || []);
        } else {
          router.push("/blog");
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
        router.push("/blog");
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug, router]);

  // Track reading progress
  useEffect(() => {
    const handleScroll = () => {
      const article = document.getElementById("blog-content");
      if (!article) return;

      const articleTop = article.offsetTop;
      const articleHeight = article.offsetHeight;
      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY;

      const progress = Math.min(
        100,
        Math.max(0, ((scrollY - articleTop + windowHeight) / articleHeight) * 100)
      );
      setReadProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const title = blog?.title || "";

    let shareUrl = "";
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
        break;
      case "copy":
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!blog) {
    return null;
  }

  return (
    <>
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted">
        <div
          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-150"
          style={{ width: `${readProgress}%` }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative">
        {/* Featured Image */}
        <div className="relative h-[50vh] sm:h-[60vh] lg:h-[70vh] bg-gradient-to-br from-primary/20 to-secondary/20">
          {blog.featuredImage ? (
            <Image
              src={blog.featuredImage}
              alt={blog.featuredImageAlt || blog.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <TrendingUp className="w-32 h-32 text-primary/10" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>

        {/* Content Overlay */}
        <div className="container mx-auto px-4 sm:px-6 relative -mt-48 sm:-mt-56 z-10">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>

            {/* Category & Reading Time */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {blog.category && (
                <Link href={`/blog?category=${blog.category.slug}`}>
                  <Badge
                    className="text-white hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: blog.category.color }}
                  >
                    {blog.category.name}
                  </Badge>
                </Link>
              )}
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {blog.readingTime} min read
              </span>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Eye className="w-4 h-4" />
                {blog.viewCount.toLocaleString()} views
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {blog.title}
            </h1>

            {/* Excerpt */}
            {blog.excerpt && (
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed">
                {blog.excerpt}
              </p>
            )}

            {/* Author & Date */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-border/50">
              <div className="flex items-center gap-4">
                {blog.authorImage ? (
                  <Image
                    src={blog.authorImage}
                    alt={blog.authorName}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary text-lg font-bold">
                    {blog.authorName.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-medium">{blog.authorName}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(blog.publishedAt), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground mr-2">Share:</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={() => handleShare("facebook")}
                >
                  <Facebook className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={() => handleShare("twitter")}
                >
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={() => handleShare("linkedin")}
                >
                  <Linkedin className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={() => handleShare("copy")}
                >
                  <Link2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="container mx-auto px-4 sm:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <article
            id="blog-content"
            className="prose prose-lg dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:tracking-tight
              prose-h1:text-3xl prose-h1:mt-10 prose-h1:mb-4
              prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-3
              prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-2
              prose-p:leading-relaxed prose-p:mb-4
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-xl prose-img:shadow-lg
              prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:rounded-r-lg
              prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-muted prose-pre:border prose-pre:border-border
              prose-ul:my-4 prose-ol:my-4
              prose-li:my-1
              prose-hr:border-border
            "
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Tags */}
          {blog.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <Tag className="w-5 h-5 text-primary" />
                <span className="font-medium">Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/blog?tag=${tag.slug}`}
                    className="px-4 py-2 rounded-full bg-muted/50 hover:bg-primary/10 border border-border/50 hover:border-primary/50 transition-all text-sm"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Author Bio */}
          {blog.authorBio && (
            <div className="mt-12 p-6 sm:p-8 glass-panel rounded-2xl">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {blog.authorImage ? (
                  <Image
                    src={blog.authorImage}
                    alt={blog.authorName}
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold flex-shrink-0">
                    {blog.authorName.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Written by</p>
                  <h3 className="text-xl font-bold mb-2">{blog.authorName}</h3>
                  <p className="text-muted-foreground">{blog.authorBio}</p>
                </div>
              </div>
            </div>
          )}

          {/* Share Section */}
          <div className="mt-12 p-6 sm:p-8 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl text-center">
            <h3 className="text-xl font-bold mb-2">Enjoyed this article?</h3>
            <p className="text-muted-foreground mb-6">
              Share it with your friends and help them level up their tech knowledge!
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => handleShare("facebook")}
              >
                <Facebook className="w-4 h-4" />
                Facebook
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => handleShare("twitter")}
              >
                <Twitter className="w-4 h-4" />
                Twitter
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => handleShare("linkedin")}
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      {relatedBlogs.length > 0 && (
        <section className="container mx-auto px-4 sm:px-6 py-12 border-t border-border/30">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <BookOpen className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Related Articles</h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedBlogs.map((relatedBlog) => (
                <Link
                  key={relatedBlog.id}
                  href={`/blog/${relatedBlog.slug}`}
                  className="group glass-panel rounded-xl overflow-hidden hover-scale"
                >
                  <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                    {relatedBlog.featuredImage ? (
                      <Image
                        src={relatedBlog.featuredImage}
                        alt={relatedBlog.featuredImageAlt || relatedBlog.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <TrendingUp className="w-12 h-12 text-primary/20" />
                      </div>
                    )}
                    {relatedBlog.category && (
                      <div
                        className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold text-white"
                        style={{ backgroundColor: relatedBlog.category.color }}
                      >
                        {relatedBlog.category.name}
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {relatedBlog.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {relatedBlog.readingTime} min
                      </span>
                      <span>
                        {format(new Date(relatedBlog.publishedAt), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link href="/blog">
                <Button variant="outline" className="gap-2">
                  View All Articles
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
