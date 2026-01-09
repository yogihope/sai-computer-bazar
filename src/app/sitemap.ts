import { MetadataRoute } from "next";
import { getAllProductIds, getAllCategorySlugs } from "@/lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://scbazar.in";

  // Get dynamic product IDs
  const productIds = await getAllProductIds();
  const categorySlugs = await getAllCategorySlugs();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/build-pc`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/prebuilt-pcs`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: `${baseUrl}/category/${slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // Product detail pages
  const productPages: MetadataRoute.Sitemap = productIds.map((id) => ({
    url: `${baseUrl}/product/${id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
