import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://scbazar.in"),
  title: {
    default: "SCB – Sai Computer Bazar | Buy PC Parts, Laptops, Accessories Online",
    template: "%s | SCB – Sai Computer Bazar",
  },
  description:
    "India's trusted destination for PC components, gaming gear, laptops, and accessories. Shop processors, graphics cards, motherboards, RAM, and more at best prices.",
  keywords: [
    "PC parts",
    "computer components",
    "gaming gear",
    "laptops",
    "processors",
    "graphics cards",
    "motherboards",
    "RAM",
    "SSD",
    "gaming accessories",
    "build PC",
    "custom PC",
    "India",
  ],
  authors: [{ name: "SCB - Sai Computer Bazar" }],
  creator: "Sai Computer Bazar",
  publisher: "Sai Computer Bazar",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://scbazar.in",
    siteName: "SCB – Sai Computer Bazar",
    title: "SCB – Sai Computer Bazar | Buy PC Parts, Laptops, Accessories Online",
    description:
      "India's trusted destination for PC components, gaming gear, laptops, and accessories. Shop at best prices.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SCB - Sai Computer Bazar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SCB – Sai Computer Bazar | Buy PC Parts Online",
    description:
      "India's trusted destination for PC components, gaming gear, laptops, and accessories.",
    images: ["/og-image.jpg"],
    creator: "@scbazar",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  alternates: {
    canonical: "https://scbazar.in",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0e17" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// Organization Schema for SEO
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Sai Computer Bazar",
  alternateName: "SCB",
  url: "https://scbazar.in",
  logo: "https://scbazar.in/logo.png",
  sameAs: [
    "https://www.facebook.com/scbazar",
    "https://www.instagram.com/scbazar",
    "https://twitter.com/scbazar",
    "https://www.youtube.com/@scbazar",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+91-XXXXXXXXXX",
    contactType: "customer service",
    areaServed: "IN",
    availableLanguage: ["English", "Hindi", "Gujarati"],
  },
};

// Website Schema for SEO
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "SCB – Sai Computer Bazar",
  url: "https://scbazar.in",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://scbazar.in/products?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
