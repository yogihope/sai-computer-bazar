import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CategoriesContent } from "@/components/categories";

export const metadata: Metadata = {
  title: "All Categories | SCB - Sai Computer Bazar",
  description:
    "Browse all product categories at Sai Computer Bazar. Find computer components, gaming gear, laptops, accessories, and more.",
  keywords: [
    "computer categories",
    "PC components",
    "gaming gear",
    "computer accessories",
    "laptops",
    "processors",
    "graphics cards",
    "motherboards",
  ],
  openGraph: {
    title: "All Categories | SCB - Sai Computer Bazar",
    description:
      "Browse all product categories at Sai Computer Bazar. Find computer components, gaming gear, laptops, accessories, and more.",
    type: "website",
    url: "/categories",
  },
  twitter: {
    card: "summary_large_image",
    title: "All Categories | SCB - Sai Computer Bazar",
    description:
      "Browse all product categories at Sai Computer Bazar. Find computer components, gaming gear, laptops, accessories, and more.",
  },
};

// JSON-LD Schema for Categories Page
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "All Categories",
  description:
    "Browse all product categories at Sai Computer Bazar. Find computer components, gaming gear, laptops, accessories, and more.",
  url: "https://scbazar.in/categories",
  isPartOf: {
    "@type": "WebSite",
    name: "Sai Computer Bazar",
    url: "https://scbazar.in",
  },
};

export default function CategoriesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1">
          <CategoriesContent />
        </main>
        <Footer />
      </div>
    </>
  );
}
