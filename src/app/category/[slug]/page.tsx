import { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CategoryProductsContent } from "@/components/categories";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate dynamic metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const category = await prisma.category.findUnique({
      where: { slug, isVisible: true },
      select: {
        name: true,
        description: true,
        seoTitle: true,
        seoDescription: true,
        seoKeywords: true,
        ogTitle: true,
        ogDescription: true,
        ogImage: true,
        twitterTitle: true,
        twitterDescription: true,
        twitterImage: true,
        canonicalUrl: true,
        robotsIndex: true,
        robotsFollow: true,
        imageUrl: true,
      },
    });

    if (!category) {
      return {
        title: "Category Not Found | SCB - Sai Computer Bazar",
        description: "The category you're looking for doesn't exist.",
      };
    }

    const title = category.seoTitle || `${category.name} | SCB - Sai Computer Bazar`;
    const description =
      category.seoDescription ||
      category.description ||
      `Shop ${category.name} at Sai Computer Bazar. Best prices, quality products, and fast delivery.`;

    const ogImage = category.ogImage || category.imageUrl || "/og-default.jpg";

    return {
      title,
      description,
      keywords: category.seoKeywords?.split(",").map((k) => k.trim()) || [category.name],
      openGraph: {
        title: category.ogTitle || title,
        description: category.ogDescription || description,
        type: "website",
        url: `/category/${slug}`,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: category.name,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: category.twitterTitle || title,
        description: category.twitterDescription || description,
        images: [category.twitterImage || ogImage],
      },
      alternates: {
        canonical: category.canonicalUrl || `/category/${slug}`,
      },
      robots: {
        index: category.robotsIndex ?? true,
        follow: category.robotsFollow ?? true,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Category | SCB - Sai Computer Bazar",
      description: "Browse products in this category at Sai Computer Bazar.",
    };
  }
}

// Generate JSON-LD structured data
async function generateJsonLd(slug: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { slug, isVisible: true },
      select: {
        name: true,
        description: true,
        imageUrl: true,
        jsonLd: true,
        _count: { select: { products: true } },
      },
    });

    if (!category) return null;

    // If custom JSON-LD exists, use it
    if (category.jsonLd) {
      return category.jsonLd;
    }

    // Generate default JSON-LD
    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: category.name,
      description: category.description || `Shop ${category.name} at Sai Computer Bazar`,
      url: `https://scbazar.in/category/${slug}`,
      image: category.imageUrl,
      numberOfItems: category._count.products,
      isPartOf: {
        "@type": "WebSite",
        name: "Sai Computer Bazar",
        url: "https://scbazar.in",
      },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://scbazar.in",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Categories",
            item: "https://scbazar.in/categories",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: category.name,
            item: `https://scbazar.in/category/${slug}`,
          },
        ],
      },
    };
  } catch (error) {
    console.error("Error generating JSON-LD:", error);
    return null;
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;

  // Verify category exists
  const category = await prisma.category.findUnique({
    where: { slug, isVisible: true },
    select: { id: true },
  });

  if (!category) {
    notFound();
  }

  const jsonLd = await generateJsonLd(slug);

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1">
          <CategoryProductsContent slug={slug} />
        </main>
        <Footer />
      </div>
    </>
  );
}

// Generate static params for popular categories (optional - for better performance)
export async function generateStaticParams() {
  try {
    const categories = await prisma.category.findMany({
      where: { isVisible: true },
      select: { slug: true },
      take: 20, // Pre-render top 20 categories
      orderBy: { displayOrder: "asc" },
    });

    return categories.map((category) => ({
      slug: category.slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}
