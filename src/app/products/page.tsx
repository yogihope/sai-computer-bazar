import { Suspense } from "react";
import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductListingContent from "@/components/products/ProductListingContent";

export const metadata: Metadata = {
  title: "Products | PC Parts, Gaming Gear & Accessories",
  description:
    "Shop our complete range of PC components, gaming peripherals, laptops, and accessories. Find processors, graphics cards, motherboards, RAM, SSDs, monitors, and more at best prices.",
  keywords: [
    "PC parts",
    "gaming gear",
    "computer components",
    "processors",
    "graphics cards",
    "motherboards",
    "RAM",
    "SSD",
    "monitors",
    "gaming accessories",
    "laptops",
  ],
  alternates: {
    canonical: "https://scbazar.in/products",
  },
  openGraph: {
    title: "Products | SCB - Sai Computer Bazar",
    description:
      "Shop our complete range of PC components, gaming peripherals, laptops, and accessories.",
    url: "https://scbazar.in/products",
    type: "website",
  },
};

const productListingSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Products - SCB Sai Computer Bazar",
  description:
    "Browse our complete collection of PC parts, gaming gear, laptops, and accessories.",
  url: "https://scbazar.in/products",
  mainEntity: {
    "@type": "ItemList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Processors",
        url: "https://scbazar.in/category/processors",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Graphics Cards",
        url: "https://scbazar.in/category/graphics-cards",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Motherboards",
        url: "https://scbazar.in/category/motherboards",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "RAM",
        url: "https://scbazar.in/category/ram",
      },
      {
        "@type": "ListItem",
        position: 5,
        name: "Storage",
        url: "https://scbazar.in/category/storage",
      },
    ],
  },
};

function ProductsLoading() {
  return (
    <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
      <div className="animate-pulse">
        <div className="h-6 bg-muted rounded w-48 mb-6"></div>
        <div className="h-10 bg-muted rounded w-64 mb-4"></div>
        <div className="h-12 bg-muted rounded-full w-full mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-muted rounded-xl"></div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productListingSchema),
        }}
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Suspense fallback={<ProductsLoading />}>
            <ProductListingContent />
          </Suspense>
        </main>
        <Footer />
      </div>
    </>
  );
}
