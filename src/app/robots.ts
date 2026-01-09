import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://scbazar.in";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/login",
          "/register",
          "/cart",
          "/checkout",
          "/orders",
          "/order/",
          "/order-tracking/",
          "/order-success",
          "/api/",
          "/_next/",
          "/forgot-password",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/admin/",
          "/login",
          "/register",
          "/cart",
          "/checkout",
          "/orders",
          "/order/",
          "/order-tracking/",
          "/order-success",
          "/api/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
