import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogContent from "@/components/blog/BlogContent";

interface Props {
  params: Promise<{ slug: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const blog = await prisma.blog.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
    },
    select: {
      title: true,
      excerpt: true,
      seoTitle: true,
      seoDescription: true,
      seoKeywords: true,
      featuredImage: true,
      ogTitle: true,
      ogDescription: true,
      ogImage: true,
      twitterTitle: true,
      twitterDescription: true,
      canonicalUrl: true,
      robotsIndex: true,
      robotsFollow: true,
      authorName: true,
      publishedAt: true,
    },
  });

  if (!blog) {
    return {
      title: "Blog Not Found",
    };
  }

  const title = blog.seoTitle || blog.title;
  const description = blog.seoDescription || blog.excerpt || "";
  const keywords = blog.seoKeywords?.split(",").map((k) => k.trim()) || [];

  return {
    title,
    description,
    keywords,
    authors: [{ name: blog.authorName }],
    robots: {
      index: blog.robotsIndex,
      follow: blog.robotsFollow,
    },
    alternates: {
      canonical: blog.canonicalUrl || `https://scbazar.in/blog/${slug}`,
    },
    openGraph: {
      title: blog.ogTitle || title,
      description: blog.ogDescription || description,
      url: `https://scbazar.in/blog/${slug}`,
      type: "article",
      publishedTime: blog.publishedAt?.toISOString(),
      authors: [blog.authorName],
      images: blog.ogImage || blog.featuredImage
        ? [
            {
              url: blog.ogImage || blog.featuredImage || "",
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: blog.twitterTitle || blog.ogTitle || title,
      description: blog.twitterDescription || blog.ogDescription || description,
      images: blog.ogImage || blog.featuredImage ? [blog.ogImage || blog.featuredImage || ""] : undefined,
    },
  };
}

export default async function BlogPage({ params }: Props) {
  const { slug } = await params;

  // Fetch blog for schema
  const blog = await prisma.blog.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
    },
    select: {
      id: true,
      title: true,
      excerpt: true,
      content: true,
      featuredImage: true,
      authorName: true,
      publishedAt: true,
      schemaType: true,
      category: {
        select: { name: true },
      },
    },
  });

  if (!blog) {
    notFound();
  }

  // Article schema for SEO
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": blog.schemaType || "Article",
    headline: blog.title,
    description: blog.excerpt,
    image: blog.featuredImage,
    author: {
      "@type": "Person",
      name: blog.authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "Sai Computer Bazar",
      url: "https://scbazar.in",
      logo: {
        "@type": "ImageObject",
        url: "https://scbazar.in/logo.png",
      },
    },
    datePublished: blog.publishedAt?.toISOString(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://scbazar.in/blog/${slug}`,
    },
    articleSection: blog.category?.name,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema),
        }}
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <BlogContent slug={slug} />
        </main>
        <Footer />
      </div>
    </>
  );
}
