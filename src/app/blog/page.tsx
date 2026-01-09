import { Metadata } from "next";
import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogListingContent from "@/components/blog/BlogListingContent";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog | Tech Insights, Guides & Reviews",
  description:
    "Explore our latest articles on PC building, gaming tips, product reviews, and tech insights. Stay updated with the latest in computer hardware and technology.",
  keywords: [
    "tech blog",
    "PC building guide",
    "gaming tips",
    "hardware reviews",
    "computer tutorials",
    "tech news",
    "buying guides",
  ],
  alternates: {
    canonical: "https://scbazar.in/blog",
  },
  openGraph: {
    title: "Blog | SCB - Tech Insights & Guides",
    description:
      "Explore our latest articles on PC building, gaming tips, product reviews, and tech insights.",
    url: "https://scbazar.in/blog",
    type: "website",
  },
};

const blogPageSchema = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "SCB Blog",
  description: "Tech insights, guides, and reviews from Sai Computer Bazar",
  url: "https://scbazar.in/blog",
  publisher: {
    "@type": "Organization",
    name: "Sai Computer Bazar",
    url: "https://scbazar.in",
  },
};

export default function BlogPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogPageSchema),
        }}
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          }>
            <BlogListingContent />
          </Suspense>
        </main>
        <Footer />
      </div>
    </>
  );
}
