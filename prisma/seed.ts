import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

// Import seed data
import { rootCategories, subCategories } from "./seed-data/categories";
import { badges, tags, pcTypes, reviewTags } from "./seed-data/badges-tags";
import { allProducts } from "./seed-data/products";
import { allPeripheralsAndMore } from "./seed-data/products-peripherals";
import { prebuiltPCs } from "./seed-data/prebuilt-pcs";

const prisma = new PrismaClient();

// Placeholder image URLs (you can replace these with real images later)
const getProductImage = (category: string, name: string) => {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `/images/products/${category}/${slug}.webp`;
};

const getCategoryImage = (slug: string) => {
  return `/images/categories/${slug}.webp`;
};

const getPrebuiltImage = (slug: string) => {
  return `/images/prebuilt/${slug}.webp`;
};

async function main() {
  console.log("Starting comprehensive seed...\n");

  // ============================================
  // SEED ADMIN USER
  // ============================================
  console.log("=== Seeding Admin User ===");
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@scb.com" },
  });

  if (existingAdmin) {
    console.log("Admin user already exists, skipping.");
  } else {
    const passwordHash = await bcrypt.hash("admin@scb", 12);
    const admin = await prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@scb.com",
        mobile: "",
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
        emailVerified: true,
      },
    });
    console.log(`Admin created: ${admin.email}`);
  }

  // ============================================
  // SEED BADGES
  // ============================================
  console.log("\n=== Seeding Badges ===");
  for (const badge of badges) {
    const existing = await prisma.badge.findUnique({ where: { slug: badge.slug } });
    if (!existing) {
      await prisma.badge.create({ data: badge });
      console.log(`Badge created: ${badge.name}`);
    }
  }

  // ============================================
  // SEED TAGS
  // ============================================
  console.log("\n=== Seeding Tags ===");
  for (const tag of tags) {
    const existing = await prisma.tag.findUnique({ where: { slug: tag.slug } });
    if (!existing) {
      await prisma.tag.create({ data: tag });
      console.log(`Tag created: ${tag.name}`);
    }
  }

  // ============================================
  // SEED REVIEW TAGS
  // ============================================
  console.log("\n=== Seeding Review Tags ===");
  for (const tag of reviewTags) {
    const existing = await prisma.reviewTag.findUnique({ where: { slug: tag.slug } });
    if (!existing) {
      await prisma.reviewTag.create({ data: tag });
      console.log(`Review Tag created: ${tag.name}`);
    }
  }

  // ============================================
  // SEED PC TYPES
  // ============================================
  console.log("\n=== Seeding PC Types ===");
  for (const pcType of pcTypes) {
    const existing = await prisma.pCType.findUnique({ where: { slug: pcType.slug } });
    if (!existing) {
      await prisma.pCType.create({ data: pcType });
      console.log(`PC Type created: ${pcType.name}`);
    }
  }

  // ============================================
  // SEED ROOT CATEGORIES
  // ============================================
  console.log("\n=== Seeding Categories ===");
  const categoryMap: Record<string, string> = {};

  for (const cat of rootCategories) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (!existing) {
      const created = await prisma.category.create({
        data: {
          ...cat,
          imageUrl: getCategoryImage(cat.slug),
          seoTitle: `${cat.name} | Sai Computer Bazar`,
          seoDescription: cat.description,
        },
      });
      categoryMap[cat.slug] = created.id;
      console.log(`Category created: ${cat.name}`);
    } else {
      categoryMap[cat.slug] = existing.id;
    }
  }

  // ============================================
  // SEED SUB CATEGORIES
  // ============================================
  console.log("\n=== Seeding Sub Categories ===");
  for (const [parentSlug, subs] of Object.entries(subCategories)) {
    const parentId = categoryMap[parentSlug];
    if (!parentId) {
      const parent = await prisma.category.findUnique({ where: { slug: parentSlug } });
      if (parent) {
        categoryMap[parentSlug] = parent.id;
      }
    }

    for (const sub of subs) {
      const existing = await prisma.category.findUnique({ where: { slug: sub.slug } });
      if (!existing) {
        const parent = await prisma.category.findUnique({ where: { slug: parentSlug } });
        if (parent) {
          const created = await prisma.category.create({
            data: {
              ...sub,
              parentId: parent.id,
              imageUrl: getCategoryImage(sub.slug),
              seoTitle: `${sub.name} | Sai Computer Bazar`,
              seoDescription: `Shop ${sub.name} at best prices in India.`,
            },
          });
          categoryMap[sub.slug] = created.id;
          console.log(`  Sub-category created: ${sub.name} (under ${parentSlug})`);
        }
      } else {
        categoryMap[sub.slug] = existing.id;
      }
    }
  }

  // ============================================
  // SEED PRODUCTS
  // ============================================
  console.log("\n=== Seeding Products ===");
  const allProductsData = [...allProducts, ...allPeripheralsAndMore];
  let productCount = 0;
  const productMap: Record<string, string> = {};

  for (const product of allProductsData) {
    const existing = await prisma.product.findUnique({ where: { slug: product.slug } });
    if (existing) {
      productMap[product.slug] = existing.id;
      continue;
    }

    // Get category ID
    let categoryId = categoryMap[product.category];
    if (!categoryId) {
      const cat = await prisma.category.findUnique({ where: { slug: product.category } });
      if (cat) {
        categoryId = cat.id;
        categoryMap[product.category] = cat.id;
      } else {
        console.log(`  Warning: Category not found for ${product.name}: ${product.category}`);
        continue;
      }
    }

    // Create product
    const createdProduct = await prisma.product.create({
      data: {
        name: product.name,
        slug: product.slug,
        shortDescription: product.shortDescription,
        description: `${product.shortDescription}. ${product.brand} ${product.model || ""} - Quality guaranteed.`,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        brand: product.brand,
        model: product.model,
        primaryCategoryId: categoryId,
        status: "PUBLISHED",
        visibility: "PUBLIC",
        isInStock: true,
        stockQuantity: Math.floor(Math.random() * 50) + 10,
        isFeatured: product.isFeatured || false,
        seoTitle: `${product.name} | Buy Online at Best Price`,
        seoDescription: product.shortDescription,
        seoScore: 75 + Math.floor(Math.random() * 25),
      },
    });

    productMap[product.slug] = createdProduct.id;
    productCount++;

    // Add product image
    await prisma.productImage.create({
      data: {
        productId: createdProduct.id,
        url: getProductImage(product.category, product.slug),
        alt: product.name,
        isPrimary: true,
        sortOrder: 0,
      },
    });

    // Add product specs
    for (let i = 0; i < product.specs.length; i++) {
      await prisma.productSpec.create({
        data: {
          productId: createdProduct.id,
          key: product.specs[i].key,
          value: product.specs[i].value,
          sortOrder: i,
        },
      });
    }

    // Add tags
    if (product.tags) {
      for (const tagSlug of product.tags) {
        const tag = await prisma.tag.findUnique({ where: { slug: tagSlug } });
        if (tag) {
          await prisma.productTag.create({
            data: {
              productId: createdProduct.id,
              tagId: tag.id,
            },
          }).catch(() => {}); // Ignore duplicates
        }
      }
    }

    // Add badges
    if (product.badges) {
      for (const badgeSlug of product.badges) {
        const badge = await prisma.badge.findUnique({ where: { slug: badgeSlug } });
        if (badge) {
          await prisma.productBadge.create({
            data: {
              productId: createdProduct.id,
              badgeId: badge.id,
            },
          }).catch(() => {}); // Ignore duplicates
        }
      }
    }

    console.log(`Product created: ${product.name}`);
  }
  console.log(`\nTotal products created: ${productCount}`);

  // ============================================
  // SEED PREBUILT PCs
  // ============================================
  console.log("\n=== Seeding Prebuilt PCs ===");
  let prebuiltCount = 0;

  for (const pc of prebuiltPCs) {
    const existing = await prisma.prebuiltPC.findUnique({ where: { slug: pc.slug } });
    if (existing) {
      continue;
    }

    // Get PC Type
    const pcType = await prisma.pCType.findUnique({ where: { slug: pc.pcType } });

    // Create prebuilt PC
    const createdPC = await prisma.prebuiltPC.create({
      data: {
        name: pc.name,
        slug: pc.slug,
        shortDescription: pc.shortDescription,
        description: pc.description,
        totalPrice: pc.totalPrice,
        sellingPrice: pc.sellingPrice,
        compareAtPrice: pc.compareAtPrice,
        pcTypeId: pcType?.id,
        targetUse: pc.targetUse,
        status: "PUBLISHED",
        visibility: "PUBLIC",
        isFeatured: pc.isFeatured || false,
        isInStock: !pc.isComingSoon,
        isComingSoon: pc.isComingSoon || false,
        launchDate: pc.launchDate,
        primaryImage: getPrebuiltImage(pc.slug),
        seoTitle: `${pc.name} | Buy Custom PC Online`,
        seoDescription: pc.shortDescription,
        seoScore: 80 + Math.floor(Math.random() * 20),
      },
    });

    prebuiltCount++;

    // Add components
    let componentOrder = 0;
    for (const component of pc.components) {
      let productId = productMap[component.productSlug];
      if (!productId) {
        const product = await prisma.product.findUnique({ where: { slug: component.productSlug } });
        if (product) {
          productId = product.id;
          productMap[component.productSlug] = product.id;
        } else {
          console.log(`  Warning: Product not found: ${component.productSlug}`);
          continue;
        }
      }

      await prisma.prebuiltPCComponent.create({
        data: {
          prebuiltPCId: createdPC.id,
          productId: productId,
          componentType: component.componentType,
          quantity: component.quantity,
          sortOrder: componentOrder++,
        },
      }).catch(() => {}); // Ignore duplicates
    }

    // Add tags
    if (pc.tags) {
      for (const tagSlug of pc.tags) {
        const tag = await prisma.tag.findUnique({ where: { slug: tagSlug } });
        if (tag) {
          await prisma.prebuiltPCTag.create({
            data: {
              prebuiltPCId: createdPC.id,
              tagId: tag.id,
            },
          }).catch(() => {}); // Ignore duplicates
        }
      }
    }

    // Add badges
    if (pc.badges) {
      for (const badgeSlug of pc.badges) {
        const badge = await prisma.badge.findUnique({ where: { slug: badgeSlug } });
        if (badge) {
          await prisma.prebuiltPCBadge.create({
            data: {
              prebuiltPCId: createdPC.id,
              badgeId: badge.id,
            },
          }).catch(() => {}); // Ignore duplicates
        }
      }
    }

    console.log(`Prebuilt PC created: ${pc.name}`);
  }
  console.log(`\nTotal prebuilt PCs created: ${prebuiltCount}`);

  // ============================================
  // SEED ADMIN NOTIFICATIONS
  // ============================================
  console.log("\n=== Seeding Admin Notifications ===");

  // Delete existing notifications first
  await prisma.adminNotification.deleteMany({});

  const notifications = [
    {
      type: "NEW_ORDER" as const,
      title: "New Order Received",
      message: "Order #SCB123456 from Rahul Sharma - RTX 4090 Gaming PC worth ₹2,45,000",
      priority: "HIGH" as const,
      entityType: "order",
      entityId: "sample-order-1",
      actionUrl: "/admin/orders",
      metadata: { orderNumber: "SCB123456", total: 245000 },
    },
    {
      type: "NEW_USER" as const,
      title: "New Customer Registered",
      message: "Priya Singh (priya.singh@gmail.com) just signed up",
      priority: "NORMAL" as const,
      entityType: "user",
      entityId: "sample-user-1",
      actionUrl: "/admin/customers",
      metadata: { name: "Priya Singh", email: "priya.singh@gmail.com" },
    },
    {
      type: "NEW_INQUIRY" as const,
      title: "New Inquiry Received",
      message: "Amit Kumar (9876543210) - Looking for budget gaming PC under ₹50,000",
      priority: "HIGH" as const,
      entityType: "inquiry",
      entityId: "sample-inquiry-1",
      actionUrl: "/admin/inquiries",
      metadata: { name: "Amit Kumar", mobile: "9876543210" },
    },
    {
      type: "NEW_REVIEW" as const,
      title: "New Review Submitted",
      message: "Vikram Patel rated \"NVIDIA RTX 4080 Super\" 5/5 stars - Great GPU, excellent performance!",
      priority: "NORMAL" as const,
      entityType: "review",
      entityId: "sample-review-1",
      actionUrl: "/admin/reviews",
      metadata: { productName: "NVIDIA RTX 4080 Super", rating: 5 },
    },
    {
      type: "LOW_STOCK" as const,
      title: "Low Stock Alert",
      message: "\"AMD Ryzen 9 7950X\" has only 3 units left in stock",
      priority: "URGENT" as const,
      entityType: "product",
      entityId: "sample-product-1",
      actionUrl: "/admin/products",
      metadata: { productName: "AMD Ryzen 9 7950X", stock: 3 },
    },
    {
      type: "ORDER_STATUS" as const,
      title: "Order Status Updated",
      message: "Order #SCB789012 changed from PROCESSING to SHIPPED",
      priority: "NORMAL" as const,
      entityType: "order",
      entityId: "sample-order-2",
      actionUrl: "/admin/orders",
      metadata: { orderNumber: "SCB789012", oldStatus: "PROCESSING", newStatus: "SHIPPED" },
    },
    {
      type: "MILESTONE_REVENUE" as const,
      title: "Revenue Milestone Reached!",
      message: "Congratulations! You've crossed ₹10 Lakh in total revenue!",
      priority: "HIGH" as const,
      entityType: null,
      entityId: null,
      actionUrl: "/admin/dashboard",
      metadata: { milestone: 1000000, period: "all_time" },
    },
    {
      type: "MILESTONE_USERS" as const,
      title: "Customer Milestone Reached!",
      message: "Your store now has 500+ registered customers!",
      priority: "HIGH" as const,
      entityType: null,
      entityId: null,
      actionUrl: "/admin/customers",
      metadata: { milestone: 500, period: "all_time" },
    },
    {
      type: "MILESTONE_ORDERS" as const,
      title: "Order Milestone Reached!",
      message: "You've successfully completed 100 orders this month!",
      priority: "HIGH" as const,
      entityType: null,
      entityId: null,
      actionUrl: "/admin/orders",
      metadata: { milestone: 100, period: "monthly" },
    },
    {
      type: "MILESTONE_VISITS" as const,
      title: "Traffic Milestone Reached!",
      message: "Your store received 10,000 visits this week!",
      priority: "NORMAL" as const,
      entityType: null,
      entityId: null,
      actionUrl: "/admin/seo-analytics",
      metadata: { milestone: 10000, period: "weekly" },
    },
    {
      type: "SYSTEM" as const,
      title: "System Update",
      message: "New notification system has been enabled for your admin panel",
      priority: "LOW" as const,
      entityType: null,
      entityId: null,
      actionUrl: "/admin/notifications",
      metadata: { feature: "notifications" },
    },
  ];

  // Create notifications with different timestamps
  for (let i = 0; i < notifications.length; i++) {
    const notif = notifications[i];
    const createdAt = new Date();
    createdAt.setMinutes(createdAt.getMinutes() - (i * 30)); // 30 min apart each

    await prisma.adminNotification.create({
      data: {
        ...notif,
        isRead: i > 4, // First 5 are unread
        readAt: i > 4 ? new Date() : null,
        createdAt,
      },
    });
  }
  console.log(`Created ${notifications.length} sample notifications`);

  // ============================================
  // SEED HERO BANNERS
  // ============================================
  console.log("\n=== Seeding Hero Banners ===");

  // Delete existing hero banners first
  await prisma.heroBanner.deleteMany({});

  const heroBanners = [
    // Home Page Banners (4)
    {
      location: "HOME" as const,
      title: "Build Your Dream PC",
      subtitle: "Premium Components at Best Prices",
      description: "Discover the latest GPUs, CPUs, and custom-built gaming rigs. Free assembly with every order above ₹50,000.",
      imageUrl: "/images/banners/home-hero-1.webp",
      buttonText: "Shop Now",
      buttonLink: "/categories",
      textColor: "#ffffff",
      overlayColor: "rgba(0,0,0,0.4)",
      textAlign: "left",
      badgeText: "New Arrivals",
      badgeColor: "#ef4444",
      isActive: true,
      sortOrder: 0,
    },
    {
      location: "HOME" as const,
      title: "RTX 40 Series In Stock",
      subtitle: "Next-Gen Gaming Performance",
      description: "Experience unmatched ray tracing and DLSS 3.0. From RTX 4060 to RTX 4090, we have them all.",
      imageUrl: "/images/banners/home-hero-2.webp",
      buttonText: "View GPUs",
      buttonLink: "/category/graphics-cards",
      textColor: "#ffffff",
      overlayColor: "rgba(0,0,0,0.5)",
      textAlign: "center",
      badgeText: "Hot Deal",
      badgeColor: "#f97316",
      isActive: true,
      sortOrder: 1,
    },
    {
      location: "HOME" as const,
      title: "Intel 14th Gen Processors",
      subtitle: "Raptor Lake Refresh Is Here",
      description: "Up to 6.0 GHz boost clock. Dominate gaming and content creation with the latest Intel Core processors.",
      imageUrl: "/images/banners/home-hero-3.webp",
      buttonText: "Explore CPUs",
      buttonLink: "/category/processors",
      textColor: "#ffffff",
      overlayColor: "rgba(0,0,0,0.45)",
      textAlign: "left",
      badgeText: "Latest",
      badgeColor: "#3b82f6",
      isActive: true,
      sortOrder: 2,
    },
    {
      location: "HOME" as const,
      title: "Monsoon Sale - Up to 30% Off",
      subtitle: "Limited Time Offer",
      description: "Grab amazing deals on gaming peripherals, monitors, and accessories. Sale ends soon!",
      imageUrl: "/images/banners/home-hero-4.webp",
      buttonText: "Shop Sale",
      buttonLink: "/offers",
      textColor: "#ffffff",
      overlayColor: "rgba(0,0,0,0.4)",
      textAlign: "right",
      badgeText: "Sale",
      badgeColor: "#10b981",
      isActive: true,
      sortOrder: 3,
    },

    // Prebuilt PC Page Banners (4)
    {
      location: "PREBUILT_PC" as const,
      title: "Ready-to-Play Gaming PCs",
      subtitle: "Professionally Built & Tested",
      description: "Skip the hassle. Our expert-built gaming PCs come with warranty, cable management, and free delivery.",
      imageUrl: "/images/banners/prebuilt-hero-1.webp",
      buttonText: "View All PCs",
      buttonLink: "/prebuilt-pcs",
      textColor: "#ffffff",
      overlayColor: "rgba(0,0,0,0.5)",
      textAlign: "left",
      badgeText: "Featured",
      badgeColor: "#8b5cf6",
      isActive: true,
      sortOrder: 0,
    },
    {
      location: "PREBUILT_PC" as const,
      title: "Budget Gaming Builds",
      subtitle: "Starting at ₹35,000",
      description: "Perfect for esports titles. Play Valorant, CS2, and more at 100+ FPS without breaking the bank.",
      imageUrl: "/images/banners/prebuilt-hero-2.webp",
      buttonText: "Budget PCs",
      buttonLink: "/prebuilt-pcs?type=budget",
      textColor: "#ffffff",
      overlayColor: "rgba(0,0,0,0.45)",
      textAlign: "center",
      badgeText: "Value",
      badgeColor: "#06b6d4",
      isActive: true,
      sortOrder: 1,
    },
    {
      location: "PREBUILT_PC" as const,
      title: "Creator Workstations",
      subtitle: "For Professionals",
      description: "Optimized for video editing, 3D rendering, and streaming. Multi-threaded performance that delivers.",
      imageUrl: "/images/banners/prebuilt-hero-3.webp",
      buttonText: "View Workstations",
      buttonLink: "/prebuilt-pcs?type=workstation",
      textColor: "#ffffff",
      overlayColor: "rgba(0,0,0,0.4)",
      textAlign: "left",
      badgeText: "Pro",
      badgeColor: "#6366f1",
      isActive: true,
      sortOrder: 2,
    },
    {
      location: "PREBUILT_PC" as const,
      title: "Custom Build Service",
      subtitle: "Your Vision, Our Expertise",
      description: "Want something unique? Tell us your requirements and budget. We'll build the perfect PC for you.",
      imageUrl: "/images/banners/prebuilt-hero-4.webp",
      buttonText: "Request Quote",
      buttonLink: "/build-pc",
      textColor: "#ffffff",
      overlayColor: "rgba(0,0,0,0.5)",
      textAlign: "right",
      badgeText: "Custom",
      badgeColor: "#ec4899",
      isActive: true,
      sortOrder: 3,
    },
  ];

  for (const banner of heroBanners) {
    await prisma.heroBanner.create({ data: banner });
  }
  console.log(`Created ${heroBanners.length} hero banners (4 Home + 4 Prebuilt PC)`);

  // ============================================
  // SEED ADVERTISEMENTS
  // ============================================
  console.log("\n=== Seeding Advertisements ===");

  // Delete existing ads first
  await prisma.advertisement.deleteMany({});

  // Get some references for ads
  const sampleCoupon = await prisma.coupon.findFirst();
  const sampleProduct = await prisma.product.findFirst({ where: { isFeatured: true } });
  const sampleCategory = await prisma.category.findFirst({ where: { parentId: null } });
  const samplePrebuiltPC = await prisma.prebuiltPC.findFirst({ where: { isFeatured: true } });
  const sampleBlog = await prisma.blog.findFirst();

  const advertisements = [
    {
      name: "Summer Sale Coupon Ad",
      title: "Get 15% Off!",
      description: "Use code SUMMER15 on your next order. Limited time offer on all components!",
      adType: "COUPON" as const,
      couponId: sampleCoupon?.id || null,
      imageUrl: "/images/ads/coupon-ad.webp",
      backgroundColor: "#fef3c7",
      textColor: "#92400e",
      accentColor: "#f59e0b",
      position: "SIDEBAR" as const,
      showOnPages: JSON.stringify(["home", "category", "product"]),
      buttonText: "Apply Code",
      priority: 10,
      isActive: true,
    },
    {
      name: "Featured GPU Ad",
      title: "RTX 4080 Super",
      description: "The ultimate gaming GPU. In stock now with free shipping!",
      adType: "PRODUCT" as const,
      productId: sampleProduct?.id || null,
      imageUrl: "/images/ads/gpu-ad.webp",
      backgroundColor: "#1e1b4b",
      textColor: "#ffffff",
      accentColor: "#76a9fa",
      position: "SIDEBAR" as const,
      showOnPages: JSON.stringify(["home", "category"]),
      buttonText: "View Product",
      priority: 8,
      isActive: true,
    },
    {
      name: "Gaming Category Promo",
      title: "Gaming Peripherals",
      description: "Keyboards, mice, headsets & more. Upgrade your setup today!",
      adType: "CATEGORY" as const,
      categoryId: sampleCategory?.id || null,
      imageUrl: "/images/ads/peripherals-ad.webp",
      backgroundColor: "#ecfdf5",
      textColor: "#065f46",
      accentColor: "#10b981",
      position: "SIDEBAR" as const,
      showOnPages: JSON.stringify(["home", "product"]),
      buttonText: "Shop Now",
      priority: 6,
      isActive: true,
    },
    {
      name: "Featured Prebuilt PC Ad",
      title: "Ready to Game?",
      description: "Check out our top-selling prebuilt gaming PC. Built by experts, tested for performance.",
      adType: "PREBUILT_PC" as const,
      prebuiltPCId: samplePrebuiltPC?.id || null,
      imageUrl: "/images/ads/prebuilt-ad.webp",
      backgroundColor: "#fdf2f8",
      textColor: "#9d174d",
      accentColor: "#ec4899",
      position: "SIDEBAR" as const,
      showOnPages: JSON.stringify(["home", "build-pc"]),
      buttonText: "View PC",
      priority: 7,
      isActive: true,
    },
    {
      name: "Custom Link - WhatsApp Support",
      title: "Need Help?",
      description: "Chat with our experts on WhatsApp for instant support and custom build advice!",
      adType: "CUSTOM" as const,
      customLink: "https://wa.me/919876543210",
      imageUrl: "/images/ads/support-ad.webp",
      backgroundColor: "#dcfce7",
      textColor: "#166534",
      accentColor: "#22c55e",
      position: "SIDEBAR" as const,
      showOnPages: JSON.stringify(["home", "category", "product", "build-pc"]),
      buttonText: "Chat Now",
      priority: 5,
      isActive: true,
    },
  ];

  for (const ad of advertisements) {
    await prisma.advertisement.create({ data: ad });
  }
  console.log(`Created ${advertisements.length} advertisements`);

  // ============================================
  // SUMMARY
  // ============================================
  console.log("\n========================================");
  console.log("SEED COMPLETED SUCCESSFULLY!");
  console.log("========================================");
  console.log(`Categories: ${Object.keys(categoryMap).length}`);
  console.log(`Products: ${productCount}`);
  console.log(`Prebuilt PCs: ${prebuiltCount}`);
  console.log(`Tags: ${tags.length}`);
  console.log(`Badges: ${badges.length}`);
  console.log(`PC Types: ${pcTypes.length}`);
  console.log(`Notifications: ${notifications.length}`);
  console.log(`Hero Banners: ${heroBanners.length} (4 Home + 4 Prebuilt PC)`);
  console.log(`Advertisements: ${advertisements.length}`);
  console.log("========================================\n");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
