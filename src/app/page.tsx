import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomeContent from "@/components/home/HomeContent";

export const metadata: Metadata = {
  title: "SCB – Sai Computer Bazar | Buy PC Parts, Laptops, Accessories Online",
  description:
    "India's trusted destination for PC components, gaming gear, laptops, and accessories. Shop processors, graphics cards, motherboards, RAM, SSDs, and more at best prices with fast delivery.",
  keywords: [
    "PC parts India",
    "computer components",
    "gaming gear",
    "laptops",
    "processors",
    "graphics cards",
    "motherboards",
    "RAM",
    "SSD",
    "gaming accessories",
    "build PC India",
    "custom PC",
    "best prices",
  ],
  alternates: {
    canonical: "https://scbazar.in",
  },
  openGraph: {
    title: "SCB – Sai Computer Bazar | Buy PC Parts, Laptops, Accessories Online",
    description:
      "India's trusted destination for PC components, gaming gear, laptops, and accessories.",
    url: "https://scbazar.in",
    type: "website",
  },
};

const homePageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "SCB – Sai Computer Bazar",
  description:
    "India's trusted destination for PC components, gaming gear, laptops, and accessories.",
  url: "https://scbazar.in",
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

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homePageSchema),
        }}
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <HomeContent />
        </main>
        <Footer />
      </div>
    </>
  );
}
