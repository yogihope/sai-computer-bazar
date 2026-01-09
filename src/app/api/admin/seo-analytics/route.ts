import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Static pages definition with their expected SEO status
const STATIC_PAGES = [
  {
    pageKey: "home",
    pagePath: "/",
    pageName: "Homepage",
    hasHardcodedSeo: true,
    hasSeoTitle: true,
    hasSeoDescription: true,
    hasSeoKeywords: true,
    hasOpenGraph: true,
    hasTwitterCard: true,
    hasSchemaMarkup: true,
    hasCanonical: true,
  },
  {
    pageKey: "products",
    pagePath: "/products",
    pageName: "Products Listing",
    hasHardcodedSeo: true,
    hasSeoTitle: true,
    hasSeoDescription: true,
    hasSeoKeywords: true,
    hasOpenGraph: true,
    hasTwitterCard: false,
    hasSchemaMarkup: true,
    hasCanonical: true,
  },
  {
    pageKey: "prebuilt-pcs",
    pagePath: "/prebuilt-pcs",
    pageName: "Prebuilt PCs Listing",
    hasHardcodedSeo: true,
    hasSeoTitle: true,
    hasSeoDescription: true,
    hasSeoKeywords: false,
    hasOpenGraph: true,
    hasTwitterCard: false,
    hasSchemaMarkup: false,
    hasCanonical: false,
  },
  {
    pageKey: "build-pc",
    pagePath: "/build-pc",
    pageName: "Build Your PC",
    hasHardcodedSeo: false,
    hasSeoTitle: false,
    hasSeoDescription: false,
    hasSeoKeywords: false,
    hasOpenGraph: false,
    hasTwitterCard: false,
    hasSchemaMarkup: false,
    hasCanonical: false,
  },
  {
    pageKey: "cart",
    pagePath: "/cart",
    pageName: "Shopping Cart",
    hasHardcodedSeo: false,
    hasSeoTitle: false,
    hasSeoDescription: false,
    hasSeoKeywords: false,
    hasOpenGraph: false,
    hasTwitterCard: false,
    hasSchemaMarkup: false,
    hasCanonical: false,
    noIndex: true, // Cart should not be indexed
  },
  {
    pageKey: "checkout",
    pagePath: "/checkout",
    pageName: "Checkout",
    hasHardcodedSeo: false,
    hasSeoTitle: false,
    hasSeoDescription: false,
    hasSeoKeywords: false,
    hasOpenGraph: false,
    hasTwitterCard: false,
    hasSchemaMarkup: false,
    hasCanonical: false,
    noIndex: true,
  },
  {
    pageKey: "login",
    pagePath: "/login",
    pageName: "Login",
    hasHardcodedSeo: false,
    hasSeoTitle: false,
    hasSeoDescription: false,
    hasSeoKeywords: false,
    hasOpenGraph: false,
    hasTwitterCard: false,
    hasSchemaMarkup: false,
    hasCanonical: false,
    noIndex: true,
  },
  {
    pageKey: "register",
    pagePath: "/register",
    pageName: "Register",
    hasHardcodedSeo: false,
    hasSeoTitle: false,
    hasSeoDescription: false,
    hasSeoKeywords: false,
    hasOpenGraph: false,
    hasTwitterCard: false,
    hasSchemaMarkup: false,
    hasCanonical: false,
    noIndex: true,
  },
  {
    pageKey: "wishlist",
    pagePath: "/wishlist",
    pageName: "Wishlist",
    hasHardcodedSeo: false,
    hasSeoTitle: false,
    hasSeoDescription: false,
    hasSeoKeywords: false,
    hasOpenGraph: false,
    hasTwitterCard: false,
    hasSchemaMarkup: false,
    hasCanonical: false,
    noIndex: true,
  },
  {
    pageKey: "orders",
    pagePath: "/orders",
    pageName: "My Orders",
    hasHardcodedSeo: false,
    hasSeoTitle: false,
    hasSeoDescription: false,
    hasSeoKeywords: false,
    hasOpenGraph: false,
    hasTwitterCard: false,
    hasSchemaMarkup: false,
    hasCanonical: false,
    noIndex: true,
  },
  {
    pageKey: "account",
    pagePath: "/account",
    pageName: "My Account",
    hasHardcodedSeo: false,
    hasSeoTitle: false,
    hasSeoDescription: false,
    hasSeoKeywords: false,
    hasOpenGraph: false,
    hasTwitterCard: false,
    hasSchemaMarkup: false,
    hasCanonical: false,
    noIndex: true,
  },
];

// Calculate SEO score for a static page
function calculateStaticPageScore(page: typeof STATIC_PAGES[0]): number {
  if (page.noIndex) return 100; // No-index pages are fine without SEO

  let score = 0;
  const weights = {
    seoTitle: 25,
    seoDescription: 25,
    seoKeywords: 10,
    openGraph: 15,
    twitterCard: 10,
    schemaMarkup: 10,
    canonical: 5,
  };

  if (page.hasSeoTitle) score += weights.seoTitle;
  if (page.hasSeoDescription) score += weights.seoDescription;
  if (page.hasSeoKeywords) score += weights.seoKeywords;
  if (page.hasOpenGraph) score += weights.openGraph;
  if (page.hasTwitterCard) score += weights.twitterCard;
  if (page.hasSchemaMarkup) score += weights.schemaMarkup;
  if (page.hasCanonical) score += weights.canonical;

  return score;
}

// GET - Get comprehensive SEO analytics data
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ============================================
    // STATIC PAGES SEO ANALYSIS
    // ============================================
    const indexableStaticPages = STATIC_PAGES.filter(p => !p.noIndex);
    const noIndexStaticPages = STATIC_PAGES.filter(p => p.noIndex);

    const staticPagesWithScore = STATIC_PAGES.map(page => ({
      ...page,
      seoScore: calculateStaticPageScore(page),
      issues: !page.noIndex ? [
        !page.hasSeoTitle && "Missing SEO title",
        !page.hasSeoDescription && "Missing meta description",
        !page.hasSeoKeywords && "Missing keywords",
        !page.hasOpenGraph && "Missing Open Graph tags",
        !page.hasTwitterCard && "Missing Twitter Card",
        !page.hasSchemaMarkup && "Missing Schema.org markup",
        !page.hasCanonical && "Missing canonical URL",
      ].filter(Boolean) : [],
    }));

    const staticPagesIssues = {
      missingTitle: indexableStaticPages.filter(p => !p.hasSeoTitle).length,
      missingDescription: indexableStaticPages.filter(p => !p.hasSeoDescription).length,
      missingKeywords: indexableStaticPages.filter(p => !p.hasSeoKeywords).length,
      missingOpenGraph: indexableStaticPages.filter(p => !p.hasOpenGraph).length,
      missingTwitterCard: indexableStaticPages.filter(p => !p.hasTwitterCard).length,
      missingSchemaMarkup: indexableStaticPages.filter(p => !p.hasSchemaMarkup).length,
      missingCanonical: indexableStaticPages.filter(p => !p.hasCanonical).length,
    };

    const avgStaticPageScore = indexableStaticPages.length > 0
      ? Math.round(indexableStaticPages.reduce((sum, p) => sum + calculateStaticPageScore(p), 0) / indexableStaticPages.length)
      : 0;

    const staticPagesWithFullSeo = indexableStaticPages.filter(p =>
      p.hasSeoTitle && p.hasSeoDescription && p.hasSeoKeywords && p.hasOpenGraph
    ).length;

    // ============================================
    // PRODUCT SEO ANALYSIS
    // ============================================
    const products = await prisma.product.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        shortDescription: true,
        seoTitle: true,
        seoDescription: true,
        seoKeywords: true,
        seoScore: true,
        canonicalUrl: true,
        ogTitle: true,
        ogDescription: true,
        ogImage: true,
        twitterTitle: true,
        twitterDescription: true,
        jsonLd: true,
        images: { select: { id: true, alt: true } },
      },
    });

    // Product SEO Issues
    const productIssues = {
      missingTitle: products.filter(p => !p.seoTitle).length,
      missingDescription: products.filter(p => !p.seoDescription).length,
      missingKeywords: products.filter(p => !p.seoKeywords).length,
      missingProductDescription: products.filter(p => !p.description).length,
      missingShortDescription: products.filter(p => !p.shortDescription).length,
      missingImages: products.filter(p => p.images.length === 0).length,
      missingImageAlt: products.filter(p => p.images.some(img => !img.alt)).length,
      missingOpenGraph: products.filter(p => !p.ogTitle && !p.ogDescription).length,
      missingCanonical: products.filter(p => !p.canonicalUrl).length,
    };

    const avgProductSeoScore = products.length > 0
      ? Math.round(products.reduce((sum, p) => sum + (p.seoScore || 0), 0) / products.length)
      : 0;

    // ============================================
    // PREBUILT PC SEO ANALYSIS
    // ============================================
    const prebuiltPCs = await prisma.prebuiltPC.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        shortDescription: true,
        seoTitle: true,
        seoDescription: true,
        seoKeywords: true,
        seoScore: true,
        primaryImage: true,
        galleryImages: true,
        canonicalUrl: true,
        ogTitle: true,
        ogDescription: true,
        ogImage: true,
        twitterTitle: true,
        twitterDescription: true,
        jsonLd: true,
      },
    });

    const prebuiltIssues = {
      missingTitle: prebuiltPCs.filter(p => !p.seoTitle).length,
      missingDescription: prebuiltPCs.filter(p => !p.seoDescription).length,
      missingKeywords: prebuiltPCs.filter(p => !p.seoKeywords).length,
      missingProductDescription: prebuiltPCs.filter(p => !p.description).length,
      missingImages: prebuiltPCs.filter(p => !p.primaryImage).length,
      missingOpenGraph: prebuiltPCs.filter(p => !p.ogTitle && !p.ogDescription).length,
      missingCanonical: prebuiltPCs.filter(p => !p.canonicalUrl).length,
    };

    const avgPrebuiltSeoScore = prebuiltPCs.length > 0
      ? Math.round(prebuiltPCs.reduce((sum, p) => sum + (p.seoScore || 0), 0) / prebuiltPCs.length)
      : 0;

    // ============================================
    // CATEGORY SEO ANALYSIS
    // ============================================
    const categories = await prisma.category.findMany({
      where: { isVisible: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        seoTitle: true,
        seoDescription: true,
        seoKeywords: true,
        imageUrl: true,
        canonicalUrl: true,
        ogTitle: true,
        ogDescription: true,
        ogImage: true,
        jsonLd: true,
        _count: { select: { products: true } },
      },
    });

    const categoryIssues = {
      missingTitle: categories.filter(c => !c.seoTitle).length,
      missingDescription: categories.filter(c => !c.seoDescription).length,
      missingKeywords: categories.filter(c => !c.seoKeywords).length,
      missingCategoryDescription: categories.filter(c => !c.description).length,
      missingImages: categories.filter(c => !c.imageUrl).length,
      emptyCategories: categories.filter(c => c._count.products === 0).length,
      missingOpenGraph: categories.filter(c => !c.ogTitle && !c.ogDescription).length,
      missingCanonical: categories.filter(c => !c.canonicalUrl).length,
    };

    // ============================================
    // OVERALL PROJECT HEALTH
    // ============================================
    const totalProducts = await prisma.product.count();
    const publishedProducts = await prisma.product.count({ where: { status: "PUBLISHED" } });
    const draftProducts = await prisma.product.count({ where: { status: "DRAFT" } });
    const archivedProducts = await prisma.product.count({ where: { status: "ARCHIVED" } });

    const totalPrebuiltPCs = await prisma.prebuiltPC.count();
    const publishedPrebuiltPCs = await prisma.prebuiltPC.count({ where: { status: "PUBLISHED" } });

    const totalCategories = await prisma.category.count();
    const visibleCategories = await prisma.category.count({ where: { isVisible: true } });

    const totalOrders = await prisma.order.count();
    const totalCustomers = await prisma.user.count({ where: { role: "CUSTOMER" } });
    const totalReviews = await prisma.review.count();
    const approvedReviews = await prisma.review.count({ where: { isApproved: true } });

    // ============================================
    // CONTENT QUALITY METRICS
    // ============================================
    const productsWithFullSeo = products.filter(p =>
      p.seoTitle && p.seoDescription && p.seoKeywords && p.description
    ).length;

    const prebuiltWithFullSeo = prebuiltPCs.filter(p =>
      p.seoTitle && p.seoDescription && p.seoKeywords && p.description
    ).length;

    const categoriesWithFullSeo = categories.filter(c =>
      c.seoTitle && c.seoDescription && c.seoKeywords && c.description
    ).length;

    // ============================================
    // TECHNICAL SEO METRICS
    // ============================================
    const technicalSeo = {
      // Schema.org coverage
      schemaMarkup: {
        products: products.filter(p => p.jsonLd).length,
        prebuiltPCs: prebuiltPCs.filter(p => p.jsonLd).length,
        categories: categories.filter(c => c.jsonLd).length,
        staticPages: STATIC_PAGES.filter(p => p.hasSchemaMarkup).length,
        total: products.filter(p => p.jsonLd).length +
               prebuiltPCs.filter(p => p.jsonLd).length +
               categories.filter(c => c.jsonLd).length +
               STATIC_PAGES.filter(p => p.hasSchemaMarkup).length,
      },
      // Canonical URLs
      canonicalUrls: {
        products: products.filter(p => p.canonicalUrl).length,
        prebuiltPCs: prebuiltPCs.filter(p => p.canonicalUrl).length,
        categories: categories.filter(c => c.canonicalUrl).length,
        staticPages: STATIC_PAGES.filter(p => p.hasCanonical).length,
      },
      // Open Graph coverage
      openGraph: {
        products: products.filter(p => p.ogTitle || p.ogDescription).length,
        prebuiltPCs: prebuiltPCs.filter(p => p.ogTitle || p.ogDescription).length,
        categories: categories.filter(c => c.ogTitle || c.ogDescription).length,
        staticPages: STATIC_PAGES.filter(p => p.hasOpenGraph).length,
      },
      // Twitter Cards
      twitterCards: {
        products: products.filter(p => p.twitterTitle || p.twitterDescription).length,
        prebuiltPCs: prebuiltPCs.filter(p => p.twitterTitle || p.twitterDescription).length,
        staticPages: STATIC_PAGES.filter(p => p.hasTwitterCard).length,
      },
    };

    // ============================================
    // CONTENT LENGTH ANALYSIS
    // ============================================
    const contentAnalysis = {
      products: {
        withLongDescription: products.filter(p => p.description && p.description.length > 300).length,
        withShortDescription: products.filter(p => p.shortDescription).length,
        avgDescriptionLength: products.length > 0
          ? Math.round(products.reduce((sum, p) => sum + (p.description?.length || 0), 0) / products.length)
          : 0,
      },
      prebuiltPCs: {
        withLongDescription: prebuiltPCs.filter(p => p.description && p.description.length > 300).length,
        avgDescriptionLength: prebuiltPCs.length > 0
          ? Math.round(prebuiltPCs.reduce((sum, p) => sum + (p.description?.length || 0), 0) / prebuiltPCs.length)
          : 0,
      },
      categories: {
        withDescription: categories.filter(c => c.description && c.description.length > 50).length,
        avgDescriptionLength: categories.length > 0
          ? Math.round(categories.reduce((sum, c) => sum + (c.description?.length || 0), 0) / categories.length)
          : 0,
      },
    };

    // ============================================
    // IMAGE SEO ANALYSIS
    // ============================================
    const allProductImages = products.flatMap(p => p.images);
    const imageSeo = {
      totalImages: allProductImages.length,
      imagesWithAlt: allProductImages.filter(img => img.alt && img.alt.length > 0).length,
      imagesWithoutAlt: allProductImages.filter(img => !img.alt).length,
      altTextCoverage: allProductImages.length > 0
        ? Math.round((allProductImages.filter(img => img.alt).length / allProductImages.length) * 100)
        : 0,
      productsWithImages: products.filter(p => p.images.length > 0).length,
      productsWithMultipleImages: products.filter(p => p.images.length >= 3).length,
      prebuiltPCsWithImages: prebuiltPCs.filter(p => p.primaryImage).length,
      prebuiltPCsWithGallery: prebuiltPCs.filter(p => {
        const gallery = p.galleryImages as string[] | null;
        return gallery && gallery.length >= 3;
      }).length,
    };

    // ============================================
    // CALCULATE OVERALL SEO SCORE
    // ============================================
    const totalItems = products.length + prebuiltPCs.length + categories.length + indexableStaticPages.length;
    const fullyOptimized = productsWithFullSeo + prebuiltWithFullSeo + categoriesWithFullSeo + staticPagesWithFullSeo;

    const overallSeoScore = totalItems > 0
      ? Math.round((fullyOptimized / totalItems) * 100)
      : 0;

    // ============================================
    // TOP PERFORMING & NEEDS ATTENTION
    // ============================================
    const topProducts = products
      .filter(p => p.seoScore && p.seoScore > 0)
      .sort((a, b) => (b.seoScore || 0) - (a.seoScore || 0))
      .slice(0, 5)
      .map(p => ({
        name: p.name,
        slug: p.slug,
        score: p.seoScore || 0,
        type: "product",
      }));

    const needsAttentionProducts = products
      .sort((a, b) => (a.seoScore || 0) - (b.seoScore || 0))
      .slice(0, 5)
      .map(p => ({
        name: p.name,
        slug: p.slug,
        score: p.seoScore || 0,
        type: "product",
        issues: [
          !p.seoTitle && "Missing SEO title",
          !p.seoDescription && "Missing meta description",
          !p.seoKeywords && "Missing keywords",
          !p.description && "Missing product description",
          p.images.length === 0 && "No images",
        ].filter(Boolean),
      }));

    const topPrebuiltPCs = prebuiltPCs
      .filter(p => p.seoScore && p.seoScore > 0)
      .sort((a, b) => (b.seoScore || 0) - (a.seoScore || 0))
      .slice(0, 5)
      .map(p => ({
        name: p.name,
        slug: p.slug,
        score: p.seoScore || 0,
        type: "prebuilt",
      }));

    // Static pages needing attention
    const staticPagesNeedingAttention = staticPagesWithScore
      .filter(p => !p.noIndex && p.seoScore < 80)
      .sort((a, b) => a.seoScore - b.seoScore)
      .slice(0, 5);

    // ============================================
    // SEO ISSUES SUMMARY (including static pages)
    // ============================================
    const totalIssues =
      productIssues.missingTitle +
      productIssues.missingDescription +
      productIssues.missingKeywords +
      productIssues.missingProductDescription +
      productIssues.missingImages +
      prebuiltIssues.missingTitle +
      prebuiltIssues.missingDescription +
      prebuiltIssues.missingKeywords +
      categoryIssues.missingTitle +
      categoryIssues.missingDescription +
      staticPagesIssues.missingTitle +
      staticPagesIssues.missingDescription;

    const criticalIssues =
      productIssues.missingTitle +
      productIssues.missingDescription +
      prebuiltIssues.missingTitle +
      prebuiltIssues.missingDescription +
      categoryIssues.missingTitle +
      staticPagesIssues.missingTitle +
      staticPagesIssues.missingDescription;

    const warningIssues =
      productIssues.missingKeywords +
      productIssues.missingShortDescription +
      productIssues.missingImageAlt +
      prebuiltIssues.missingKeywords +
      categoryIssues.missingKeywords +
      staticPagesIssues.missingKeywords +
      staticPagesIssues.missingOpenGraph;

    // ============================================
    // PAGE-WISE SEO BREAKDOWN
    // ============================================
    const pageScores = [
      {
        page: "Static Pages",
        score: avgStaticPageScore,
        total: indexableStaticPages.length,
        optimized: staticPagesWithFullSeo,
        issues: Object.values(staticPagesIssues).reduce((a, b) => a + b, 0),
        type: "static-pages",
      },
      {
        page: "Products",
        score: avgProductSeoScore,
        total: products.length,
        optimized: productsWithFullSeo,
        issues: Object.values(productIssues).reduce((a, b) => a + b, 0),
        type: "products",
      },
      {
        page: "Prebuilt PCs",
        score: avgPrebuiltSeoScore,
        total: prebuiltPCs.length,
        optimized: prebuiltWithFullSeo,
        issues: Object.values(prebuiltIssues).reduce((a, b) => a + b, 0),
        type: "prebuilt-pcs",
      },
      {
        page: "Categories",
        score: categories.length > 0
          ? Math.round((categoriesWithFullSeo / categories.length) * 100)
          : 0,
        total: categories.length,
        optimized: categoriesWithFullSeo,
        issues: Object.values(categoryIssues).reduce((a, b) => a + b, 0),
        type: "categories",
      },
    ];

    // ============================================
    // DETAILED ISSUES LIST
    // ============================================
    const issuesList = [
      {
        category: "Static Pages",
        issues: [
          { label: "Missing SEO Title", count: staticPagesIssues.missingTitle, severity: "critical" },
          { label: "Missing Meta Description", count: staticPagesIssues.missingDescription, severity: "critical" },
          { label: "Missing Keywords", count: staticPagesIssues.missingKeywords, severity: "warning" },
          { label: "Missing Open Graph", count: staticPagesIssues.missingOpenGraph, severity: "warning" },
          { label: "Missing Twitter Card", count: staticPagesIssues.missingTwitterCard, severity: "info" },
          { label: "Missing Schema Markup", count: staticPagesIssues.missingSchemaMarkup, severity: "info" },
          { label: "Missing Canonical URL", count: staticPagesIssues.missingCanonical, severity: "info" },
        ].filter(i => i.count > 0),
      },
      {
        category: "Products",
        issues: [
          { label: "Missing SEO Title", count: productIssues.missingTitle, severity: "critical" },
          { label: "Missing Meta Description", count: productIssues.missingDescription, severity: "critical" },
          { label: "Missing Keywords", count: productIssues.missingKeywords, severity: "warning" },
          { label: "Missing Product Description", count: productIssues.missingProductDescription, severity: "warning" },
          { label: "Missing Short Description", count: productIssues.missingShortDescription, severity: "info" },
          { label: "No Product Images", count: productIssues.missingImages, severity: "critical" },
          { label: "Images Without Alt Text", count: productIssues.missingImageAlt, severity: "warning" },
          { label: "Missing Open Graph", count: productIssues.missingOpenGraph, severity: "info" },
          { label: "Missing Canonical URL", count: productIssues.missingCanonical, severity: "info" },
        ].filter(i => i.count > 0),
      },
      {
        category: "Prebuilt PCs",
        issues: [
          { label: "Missing SEO Title", count: prebuiltIssues.missingTitle, severity: "critical" },
          { label: "Missing Meta Description", count: prebuiltIssues.missingDescription, severity: "critical" },
          { label: "Missing Keywords", count: prebuiltIssues.missingKeywords, severity: "warning" },
          { label: "Missing Description", count: prebuiltIssues.missingProductDescription, severity: "warning" },
          { label: "No Primary Image", count: prebuiltIssues.missingImages, severity: "critical" },
          { label: "Missing Open Graph", count: prebuiltIssues.missingOpenGraph, severity: "info" },
          { label: "Missing Canonical URL", count: prebuiltIssues.missingCanonical, severity: "info" },
        ].filter(i => i.count > 0),
      },
      {
        category: "Categories",
        issues: [
          { label: "Missing SEO Title", count: categoryIssues.missingTitle, severity: "critical" },
          { label: "Missing Meta Description", count: categoryIssues.missingDescription, severity: "critical" },
          { label: "Missing Keywords", count: categoryIssues.missingKeywords, severity: "warning" },
          { label: "Missing Description", count: categoryIssues.missingCategoryDescription, severity: "warning" },
          { label: "No Category Image", count: categoryIssues.missingImages, severity: "info" },
          { label: "Empty Categories", count: categoryIssues.emptyCategories, severity: "warning" },
          { label: "Missing Open Graph", count: categoryIssues.missingOpenGraph, severity: "info" },
          { label: "Missing Canonical URL", count: categoryIssues.missingCanonical, severity: "info" },
        ].filter(i => i.count > 0),
      },
    ].filter(c => c.issues.length > 0);

    return NextResponse.json({
      overallScore: overallSeoScore,
      scoreLabel: overallSeoScore >= 80 ? "Good" : overallSeoScore >= 60 ? "Needs Work" : "Poor",

      projectHealth: {
        products: {
          total: totalProducts,
          published: publishedProducts,
          draft: draftProducts,
          archived: archivedProducts,
        },
        prebuiltPCs: {
          total: totalPrebuiltPCs,
          published: publishedPrebuiltPCs,
        },
        categories: {
          total: totalCategories,
          visible: visibleCategories,
        },
        staticPages: {
          total: STATIC_PAGES.length,
          indexable: indexableStaticPages.length,
          noIndex: noIndexStaticPages.length,
        },
        orders: totalOrders,
        customers: totalCustomers,
        reviews: {
          total: totalReviews,
          approved: approvedReviews,
        },
      },

      contentStats: {
        totalIndexablePages: publishedProducts + publishedPrebuiltPCs + visibleCategories + indexableStaticPages.length,
        fullyOptimized,
        partiallyOptimized: totalItems - fullyOptimized,
        optimizationRate: totalItems > 0 ? Math.round((fullyOptimized / totalItems) * 100) : 0,
      },

      issuesSummary: {
        total: totalIssues,
        critical: criticalIssues,
        warnings: warningIssues,
        info: totalIssues - criticalIssues - warningIssues,
      },

      pageScores,
      issuesList,

      // Static pages detailed
      staticPages: {
        pages: staticPagesWithScore,
        avgScore: avgStaticPageScore,
        withFullSeo: staticPagesWithFullSeo,
        total: indexableStaticPages.length,
        issues: staticPagesIssues,
        needingAttention: staticPagesNeedingAttention,
      },

      // Technical SEO
      technicalSeo,

      // Content analysis
      contentAnalysis,

      // Image SEO
      imageSeo,

      topPerforming: [...topProducts, ...topPrebuiltPCs].sort((a, b) => b.score - a.score).slice(0, 5),
      needsAttention: needsAttentionProducts,

      seoBreakdown: {
        staticPages: {
          avgScore: avgStaticPageScore,
          withFullSeo: staticPagesWithFullSeo,
          total: indexableStaticPages.length,
          issues: staticPagesIssues,
        },
        products: {
          avgScore: avgProductSeoScore,
          withFullSeo: productsWithFullSeo,
          total: products.length,
          issues: productIssues,
        },
        prebuiltPCs: {
          avgScore: avgPrebuiltSeoScore,
          withFullSeo: prebuiltWithFullSeo,
          total: prebuiltPCs.length,
          issues: prebuiltIssues,
        },
        categories: {
          withFullSeo: categoriesWithFullSeo,
          total: categories.length,
          issues: categoryIssues,
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching SEO analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch SEO analytics: " + error.message },
      { status: 500 }
    );
  }
}
