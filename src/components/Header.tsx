"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Phone,
  Mail,
  User,
  Heart,
  GitCompare,
  ShoppingCart,
  Menu,
  ChevronRight,
  ChevronDown,
  Sun,
  Moon,
  Cpu,
  CircuitBoard,
  MonitorPlay,
  MemoryStick,
  HardDrive,
  Fan,
  Box,
  Zap,
  Monitor,
  Laptop,
  Keyboard,
  Gift,
  X,
  Sparkles,
  Wrench,
  ShoppingBag,
  Package,
  ArrowRight,
  Gamepad2,
  LogOut,
  LayoutDashboard,
  Settings,
  Loader2,
  FileText,
  MonitorSmartphone,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import GoogleTranslate from "./GoogleTranslate";

// User type
interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
  avatar: string | null;
}

// Search result type
interface SearchResult {
  type: "product" | "prebuilt" | "blog";
  id: string;
  name: string;
  slug: string;
  image: string | null;
  price?: number;
  readingTime?: number;
  category: string;
  link: string;
}

// Category type from API
interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  _count: { products: number };
}

// Category product type
interface CategoryProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
}

// Category icons mapping
const categoryIcons: Record<string, React.ElementType> = {
  Processors: Cpu,
  Motherboards: CircuitBoard,
  "Graphics Cards": MonitorPlay,
  RAM: MemoryStick,
  Storage: HardDrive,
  Cooling: Fan,
  Cabinets: Box,
  "Power Supply": Zap,
  Monitors: Monitor,
  Laptops: Laptop,
  Keyboards: Keyboard,
  Accessories: Gift,
};

// Navigation items with mega menu data
interface SubCategory {
  name: string;
  description?: string;
  link?: string;
}

interface NavItem {
  name: string;
  icon: React.ElementType;
  link: string;
  subcategories: SubCategory[];
  featuredCards: {
    title: string;
    subtitle: string;
    image: string;
    link: string;
  }[];
}

const navigationItems: NavItem[] = [
  {
    name: "Gaming Gears",
    icon: Gamepad2,
    link: "/category/gaming-gears",
    subcategories: [
      { name: "Gaming Keyboards", description: "Mechanical & membrane", link: "/category/gaming-keyboards" },
      { name: "Gaming Mouse", description: "High DPI sensors", link: "/category/gaming-mouse" },
      { name: "Gaming Headsets", description: "Surround sound audio", link: "/category/gaming-headsets" },
      { name: "Gaming Chairs", description: "Ergonomic comfort", link: "/category/gaming-chairs" },
      { name: "Controllers", description: "Console & PC", link: "/category/controllers" },
      { name: "Mousepads", description: "Extended & RGB", link: "/category/mousepads" },
    ],
    featuredCards: [
      {
        title: "Pro Gaming Setup",
        subtitle: "Complete peripherals bundle",
        image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&q=80",
        link: "/category/gaming-gears",
      },
      {
        title: "Streaming Essentials",
        subtitle: "Webcam, mic & lighting",
        image: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400&q=80",
        link: "/category/streaming",
      },
      {
        title: "RGB Collection",
        subtitle: "Light up your setup",
        image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400&q=80",
        link: "/category/rgb",
      },
    ],
  },
  {
    name: "Products",
    icon: Cpu,
    link: "/categories",
    subcategories: [
      { name: "Processors", description: "AMD & Intel CPUs", link: "/category/processors" },
      { name: "Motherboards", description: "ATX, mATX, ITX", link: "/category/motherboards" },
      { name: "Graphics Cards", description: "NVIDIA & AMD GPUs", link: "/category/graphics-cards" },
      { name: "RAM", description: "DDR4 & DDR5 Memory", link: "/category/ram" },
      { name: "Storage", description: "SSD & HDD", link: "/category/storage" },
      { name: "Power Supply", description: "Modular PSUs", link: "/category/power-supply" },
      { name: "Cooling", description: "Air & Liquid Coolers", link: "/category/cooling" },
      { name: "Cabinets", description: "ATX & ITX Cases", link: "/category/cabinets" },
    ],
    featuredCards: [
      {
        title: "RTX 5090 Series",
        subtitle: "Next-gen performance",
        image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&q=80",
        link: "/category/graphics-cards",
      },
      {
        title: "AMD Ryzen 9000",
        subtitle: "Zen 5 architecture",
        image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&q=80",
        link: "/category/processors",
      },
      {
        title: "DDR5 Memory",
        subtitle: "Ultra-fast speeds",
        image: "https://images.unsplash.com/photo-1562976540-1502c2145186?w=400&q=80",
        link: "/category/ram",
      },
    ],
  },
  {
    name: "Store",
    icon: ShoppingBag,
    link: "/prebuilt-pcs",
    subcategories: [
      { name: "All Prebuilt PCs", description: "Ready to use systems", link: "/prebuilt-pcs" },
      { name: "Gaming PCs", description: "High-performance rigs", link: "/prebuilt-pcs?type=gaming" },
      { name: "Workstation PCs", description: "For creators & pros", link: "/prebuilt-pcs?type=workstation" },
      { name: "Budget PCs", description: "Great value builds", link: "/prebuilt-pcs?type=budget" },
    ],
    featuredCards: [
      {
        title: "Gaming Beast",
        subtitle: "RTX 4090 powered",
        image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400&q=80",
        link: "/prebuilt-pcs?type=gaming",
      },
      {
        title: "Creator Pro",
        subtitle: "For content creators",
        image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400&q=80",
        link: "/prebuilt-pcs?type=workstation",
      },
      {
        title: "Budget Builds",
        subtitle: "Great value PCs",
        image: "https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=400&q=80",
        link: "/prebuilt-pcs?type=budget",
      },
    ],
  },
  {
    name: "Build PC",
    icon: Wrench,
    link: "/build-pc",
    subcategories: [
      { name: "Start Building", description: "Configure your dream PC", link: "/build-pc" },
      { name: "Saved Builds", description: "Your configurations", link: "/build-pc?tab=saved" },
      { name: "Popular Builds", description: "Community favorites", link: "/build-pc?tab=popular" },
    ],
    featuredCards: [
      {
        title: "PC Builder Tool",
        subtitle: "Build your custom rig",
        image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400&q=80",
        link: "/build-pc",
      },
      {
        title: "Gaming Starter",
        subtitle: "From ₹45,000",
        image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400&q=80",
        link: "/build-pc?preset=gaming-starter",
      },
      {
        title: "Ultimate Rig",
        subtitle: "No compromises",
        image: "https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=400&q=80",
        link: "/build-pc?preset=ultimate",
      },
    ],
  },
  {
    name: "Accessories",
    icon: Package,
    link: "/category/accessories",
    subcategories: [
      { name: "Mobile Covers", description: "Phone protection", link: "/category/mobile-covers" },
      { name: "Bluetooth Speakers", description: "Wireless audio", link: "/category/bluetooth-speakers" },
      { name: "Desk Accessories", description: "Organize your setup", link: "/category/desk-accessories" },
      { name: "Cables & Adapters", description: "Connectivity solutions", link: "/category/cables" },
      { name: "Tech Accessories", description: "Stylish add-ons", link: "/category/tech-accessories" },
    ],
    featuredCards: [
      {
        title: "Desk Setup",
        subtitle: "Complete your workspace",
        image: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=400&q=80",
        link: "/category/desk-accessories",
      },
      {
        title: "Audio Gear",
        subtitle: "Premium sound",
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80",
        link: "/category/bluetooth-speakers",
      },
      {
        title: "Phone Accessories",
        subtitle: "Protect & enhance",
        image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&q=80",
        link: "/category/mobile-covers",
      },
    ],
  },
];

// Default placeholder image for categories
const DEFAULT_CATEGORY_IMAGE = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80";

const Header = () => {
  const router = useRouter();
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string>("");
  const [activeNavItem, setActiveNavItem] = useState<string | null>(null);
  const [hoveredSubcategory, setHoveredSubcategory] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  // Dynamic data states
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<CategoryProduct[]>([]);
  const [isLoadingCategoryProducts, setIsLoadingCategoryProducts] = useState(false);
  const [subcategoryProducts, setSubcategoryProducts] = useState<CategoryProduct[]>([]);
  const [isLoadingSubcategoryProducts, setIsLoadingSubcategoryProducts] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const categoryProductsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subcategoryProductsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cart and Wishlist state
  const { cart, setIsCartOpen } = useCart();
  const { wishlist } = useWishlist();
  const cartCount = cart?.totalItems || 0;
  const wishlistCount = wishlist?.items?.length || 0;

  // Auth state
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const profileRef = useRef<HTMLDivElement>(null);

  // Refs for mega menu hover management
  const categoryMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const categoryButtonRef = useRef<HTMLButtonElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const navMenuRef = useRef<HTMLDivElement>(null);

  // Debounced close handlers for mega menus
  const handleCategoryMenuEnter = () => {
    if (categoryMenuTimeoutRef.current) {
      clearTimeout(categoryMenuTimeoutRef.current);
      categoryMenuTimeoutRef.current = null;
    }
    setShowCategoryMenu(true);
    setActiveNavItem(null);
  };

  const handleCategoryMenuLeave = () => {
    categoryMenuTimeoutRef.current = setTimeout(() => {
      setShowCategoryMenu(false);
    }, 150);
  };

  const handleNavMenuEnter = (itemName: string) => {
    if (navMenuTimeoutRef.current) {
      clearTimeout(navMenuTimeoutRef.current);
      navMenuTimeoutRef.current = null;
    }
    setActiveNavItem(itemName);
    setShowCategoryMenu(false);
    setHoveredSubcategory(0);
  };

  const handleNavMenuLeave = () => {
    navMenuTimeoutRef.current = setTimeout(() => {
      setActiveNavItem(null);
    }, 150);
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (categoryMenuTimeoutRef.current) clearTimeout(categoryMenuTimeoutRef.current);
      if (navMenuTimeoutRef.current) clearTimeout(navMenuTimeoutRef.current);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (categoryProductsTimeoutRef.current) clearTimeout(categoryProductsTimeoutRef.current);
      if (subcategoryProductsTimeoutRef.current) clearTimeout(subcategoryProductsTimeoutRef.current);
    };
  }, []);

  // Fetch products for hovered category
  const fetchCategoryProducts = useCallback(async (categorySlug: string) => {
    if (!categorySlug) return;

    setIsLoadingCategoryProducts(true);
    try {
      const res = await fetch(`/api/public/products?category=${categorySlug}&limit=3`);
      const data = await res.json();
      if (res.ok && data.products) {
        setCategoryProducts(data.products.map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          image: p.images?.[0]?.url || null,
        })));
      }
    } catch (error) {
      console.error("Failed to fetch category products:", error);
      setCategoryProducts([]);
    } finally {
      setIsLoadingCategoryProducts(false);
    }
  }, []);

  // Fetch products when category changes
  useEffect(() => {
    if (!hoveredCategory || !showCategoryMenu) return;

    const category = categories.find(c => c.name === hoveredCategory);
    if (!category) return;

    // Debounce the fetch
    if (categoryProductsTimeoutRef.current) {
      clearTimeout(categoryProductsTimeoutRef.current);
    }

    categoryProductsTimeoutRef.current = setTimeout(() => {
      fetchCategoryProducts(category.slug);
    }, 150);

    return () => {
      if (categoryProductsTimeoutRef.current) {
        clearTimeout(categoryProductsTimeoutRef.current);
      }
    };
  }, [hoveredCategory, showCategoryMenu, categories, fetchCategoryProducts]);

  // Fetch products for hovered subcategory in nav menu
  const fetchSubcategoryProducts = useCallback(async (categorySlug: string) => {
    if (!categorySlug) return;

    setIsLoadingSubcategoryProducts(true);
    try {
      const res = await fetch(`/api/public/products?category=${categorySlug}&limit=3`);
      const data = await res.json();
      if (res.ok && data.products) {
        setSubcategoryProducts(data.products.map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          image: p.images?.[0]?.url || null,
        })));
      }
    } catch (error) {
      console.error("Failed to fetch subcategory products:", error);
      setSubcategoryProducts([]);
    } finally {
      setIsLoadingSubcategoryProducts(false);
    }
  }, []);

  // Fetch products when subcategory changes
  useEffect(() => {
    if (!activeNavItem || hoveredSubcategory === undefined) return;

    const navItem = navigationItems.find(n => n.name === activeNavItem);
    if (!navItem || !navItem.subcategories[hoveredSubcategory]) return;

    const subcategoryLink = navItem.subcategories[hoveredSubcategory].link;
    if (!subcategoryLink) return;

    // Extract category slug from link (e.g., /products?category=processors -> processors)
    const categoryMatch = subcategoryLink.match(/category=([^&]+)/);
    if (!categoryMatch) {
      setSubcategoryProducts([]);
      return;
    }

    const categorySlug = categoryMatch[1];

    // Debounce the fetch
    if (subcategoryProductsTimeoutRef.current) {
      clearTimeout(subcategoryProductsTimeoutRef.current);
    }

    subcategoryProductsTimeoutRef.current = setTimeout(() => {
      fetchSubcategoryProducts(categorySlug);
    }, 150);

    return () => {
      if (subcategoryProductsTimeoutRef.current) {
        clearTimeout(subcategoryProductsTimeoutRef.current);
      }
    };
  }, [activeNavItem, hoveredSubcategory, fetchSubcategoryProducts]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/public/categories?parentOnly=true&limit=10");
        const data = await res.json();
        if (res.ok && data.categories) {
          setCategories(data.categories);
          if (data.categories.length > 0) {
            setHoveredCategory(data.categories[0].name);
          }
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Debounced search function
  const handleSearch = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/public/search?q=${encodeURIComponent(query)}&limit=6`);
      const data = await res.json();
      if (res.ok && data.results) {
        setSearchResults(data.results);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle search query change with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, handleSearch]);

  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();
        if (response.ok && data.success) {
          setUser(data.user);
        }
      } catch {
        // Not logged in, ignore
      } finally {
        setIsLoadingUser(false);
      }
    };
    fetchUser();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setShowProfileDropdown(false);
      toast.success("Logged out successfully");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Failed to logout");
    }
  };

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get current category data
  const currentCategory = categories.find((c) => c.name === hoveredCategory) || categories[0];
  const currentNavItem = navigationItems.find((n) => n.name === activeNavItem);

  // Type badge colors and labels
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "product":
        return { label: "Product", color: "bg-blue-500", icon: Package };
      case "prebuilt":
        return { label: "Prebuilt PC", color: "bg-purple-500", icon: MonitorSmartphone };
      case "blog":
        return { label: "Blog", color: "bg-green-500", icon: FileText };
      default:
        return { label: "Item", color: "bg-gray-500", icon: Package };
    }
  };

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const CategoryIcon = ({ name }: { name: string }) => {
    const Icon = categoryIcons[name] || Gift;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50",
        // Solid backgrounds
        "bg-[#FAFBFC] dark:bg-[#0a0e17]",
        // Subtle bottom shadow for separation
        "shadow-[0_1px_3px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]",
        "border-b border-gray-200/80 dark:border-gray-800/80"
      )}
    >
      {/* Top Bar - Compact Utility Row */}
      <div className="bg-gray-100/80 dark:bg-[#070a10] border-b border-gray-200/60 dark:border-gray-800/60">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-8">
            {/* Left - Contact */}
            <div className="flex items-center gap-5">
              <a
                href="tel:+91XXXXXXXXXX"
                className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <Phone className="w-3 h-3" />
                <span>+91-XXXXXXXXXX</span>
              </a>
              <a
                href="mailto:support@scbazar.in"
                className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <Mail className="w-3 h-3" />
                <span>support@scbazar.in</span>
              </a>
            </div>

            {/* Right - Language & Theme */}
            <div className="flex items-center gap-2">
              {/* Google Translate */}
              <GoogleTranslate />

              {/* Theme Toggle - Compact with Fixed Icon Container */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="relative w-7 h-7 flex items-center justify-center rounded text-gray-500 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-800/60 transition-colors"
                aria-label="Toggle theme"
              >
                <Sun className="absolute w-3.5 h-3.5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute w-3.5 h-3.5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header - Properly Spaced */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-4 sm:gap-6 lg:gap-8">
          {/* LEFT SECTION: Logo + Categories */}
          <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <img
                src="/logo-black.png"
                alt="Sai Computer Bazar"
                className="h-8 sm:h-10 w-auto dark:hidden"
              />
              <img
                src="/logo-white.png"
                alt="Sai Computer Bazar"
                className="h-8 sm:h-10 w-auto hidden dark:block"
              />
            </Link>

            {/* Categories Button - Compact Pill */}
            <button
              ref={categoryButtonRef}
              onMouseEnter={handleCategoryMenuEnter}
              onMouseLeave={handleCategoryMenuLeave}
              className={cn(
                "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                "bg-primary/10 text-primary",
                "hover:bg-primary hover:text-white",
                "dark:bg-primary/20 dark:hover:bg-primary"
              )}
            >
              <Menu className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Categories</span>
            </button>
          </div>

          {/* CENTER SECTION: Navigation - NO WRAPPING */}
          <nav
            ref={navRef}
            className="hidden lg:flex items-center gap-1 flex-1 justify-center"
            onMouseLeave={handleNavMenuLeave}
          >
            {navigationItems.map((item) => (
              <button
                key={item.name}
                onMouseEnter={() => handleNavMenuEnter(item.name)}
                className={cn(
                  "px-4 py-2 text-sm font-medium whitespace-nowrap transition-all",
                  "text-gray-600 dark:text-gray-300",
                  "hover:text-primary dark:hover:text-primary",
                  "relative group",
                  activeNavItem === item.name && "text-primary"
                )}
              >
                {item.name}
                {/* Subtle underline on hover */}
                <span
                  className={cn(
                    "absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full",
                    "scale-x-0 group-hover:scale-x-100 transition-transform origin-center",
                    activeNavItem === item.name && "scale-x-100"
                  )}
                />
              </button>
            ))}
          </nav>

          {/* RIGHT SECTION: Search + Actions */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Search Bar - Compact */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearchSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim().length >= 2) {
                    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                    setShowSearchSuggestions(false);
                  }
                }}
                className={cn(
                  "w-44 lg:w-52 pl-9 pr-3 h-9 text-sm rounded-lg",
                  "bg-gray-100 dark:bg-[#12171f]",
                  "border-transparent focus:border-primary/30",
                  "text-gray-900 dark:text-white",
                  "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                  "focus:ring-1 focus:ring-primary/20"
                )}
              />

              {/* Search Suggestions */}
              {showSearchSuggestions && (searchResults.length > 0 || isSearching || searchQuery.length >= 2) && (
                <div
                  className={cn(
                    "absolute top-full left-0 w-80 mt-2 py-2 rounded-lg overflow-hidden z-[100]",
                    "bg-white dark:bg-[#12171f]",
                    "border border-gray-200 dark:border-gray-700",
                    "shadow-xl",
                    "animate-in fade-in-0 slide-in-from-top-2 duration-150"
                  )}
                >
                  {isSearching ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      <span className="ml-2 text-sm text-gray-500">Searching...</span>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      {searchResults.map((result) => {
                        const badge = getTypeBadge(result.type);
                        const BadgeIcon = badge.icon;
                        return (
                          <Link
                            key={`${result.type}-${result.id}`}
                            href={result.link}
                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                              {result.image ? (
                                <img src={result.image} alt={result.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <BadgeIcon className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{result.name}</p>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded text-white", badge.color)}>
                                  {badge.label}
                                </span>
                                {result.price && (
                                  <span className="text-xs font-semibold text-primary">{formatPrice(result.price)}</span>
                                )}
                                {result.readingTime && (
                                  <span className="text-xs text-gray-500">{result.readingTime} min read</span>
                                )}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                      <div className="border-t border-gray-100 dark:border-gray-800 mt-2 pt-2 px-3">
                        <Link
                          href={`/search?q=${encodeURIComponent(searchQuery)}`}
                          className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                          View all results
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </>
                  ) : searchQuery.length >= 2 ? (
                    <div className="py-6 text-center">
                      <p className="text-sm text-gray-500">No results found for &quot;{searchQuery}&quot;</p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Action Icons - Tight Cluster */}
            <div className="flex items-center gap-1">
              {/* User Profile / Login */}
              {isLoadingUser ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-gray-600 dark:text-gray-300"
                  disabled
                >
                  <User className="w-[18px] h-[18px]" />
                </Button>
              ) : user ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all",
                      "hover:bg-gray-100 dark:hover:bg-gray-800/50",
                      showProfileDropdown && "bg-gray-100 dark:bg-gray-800/50"
                    )}
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-primary">
                          {getUserInitials(user.name)}
                        </span>
                      )}
                    </div>
                    {/* Name - Hidden on mobile */}
                    <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[80px] truncate">
                      {user.name.split(" ")[0]}
                    </span>
                    <ChevronDown
                      className={cn(
                        "hidden sm:block w-4 h-4 text-gray-400 transition-transform",
                        showProfileDropdown && "rotate-180"
                      )}
                    />
                  </button>

                  {/* Profile Dropdown */}
                  {showProfileDropdown && (
                    <div
                      className={cn(
                        "absolute top-full right-0 mt-2 w-56 py-2 rounded-xl overflow-hidden z-[100]",
                        "bg-white dark:bg-[#12171f]",
                        "border border-gray-200 dark:border-gray-700",
                        "shadow-xl dark:shadow-2xl",
                        "animate-in fade-in-0 zoom-in-95 duration-150"
                      )}
                    >
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <Link
                          href={user.role === "ADMIN" ? "/admin/dashboard" : "/account"}
                          onClick={() => setShowProfileDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          {user.role === "ADMIN" ? "Admin Dashboard" : "My Account"}
                        </Link>
                        {user.role === "CUSTOMER" && (
                          <>
                            <Link
                              href="/orders"
                              onClick={() => setShowProfileDropdown(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                              <Package className="w-4 h-4" />
                              My Orders
                            </Link>
                            <Link
                              href="/account/settings"
                              onClick={() => setShowProfileDropdown(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                              <Settings className="w-4 h-4" />
                              Settings
                            </Link>
                          </>
                        )}
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-100 dark:border-gray-800 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800/50"
                  >
                    <User className="w-[18px] h-[18px]" />
                  </Button>
                </Link>
              )}

              <Link href="/wishlist">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800/50 relative"
                >
                  <Heart className="w-[18px] h-[18px]" />
                  {wishlistCount > 0 && (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[9px] flex items-center justify-center text-white font-semibold">
                      {wishlistCount > 9 ? "9+" : wishlistCount}
                    </span>
                  )}
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800/50 relative hidden sm:flex"
              >
                <GitCompare className="w-[18px] h-[18px]" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800/50 relative"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="w-[18px] h-[18px]" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[9px] flex items-center justify-center text-white font-semibold">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Button>

              {/* Mobile Menu */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-9 w-9 text-gray-600 dark:text-gray-300"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mega Menu - Categories */}
      {showCategoryMenu && categories.length > 0 && (
        <div
          ref={categoryMenuRef}
          className="absolute left-0 right-0 top-full z-50"
          onMouseEnter={handleCategoryMenuEnter}
          onMouseLeave={handleCategoryMenuLeave}
        >
          <div className="fixed inset-0 top-[94px] bg-black/30 pointer-events-none" />
          <div className="relative max-w-[1400px] mx-auto px-6 py-4">
            <div
              className={cn(
                "rounded-xl overflow-hidden",
                "bg-white dark:bg-[#0f1419]",
                "border border-gray-200 dark:border-gray-800",
                "shadow-2xl",
                "animate-in fade-in-0 slide-in-from-top-2 duration-200"
              )}
            >
              <div className="flex">
                {/* Left - Categories */}
                <div className="w-64 border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0a0e14]">
                  <div className="p-3">
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/category/${category.slug}`}
                        onMouseEnter={() => setHoveredCategory(category.name)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all",
                          hoveredCategory === category.name
                            ? "bg-primary/10 text-primary"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                        )}
                      >
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            hoveredCategory === category.name
                              ? "bg-primary text-white"
                              : "bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                          )}
                        >
                          <CategoryIcon name={category.name} />
                        </div>
                        <span className="text-sm font-medium">{category.name}</span>
                        <ChevronRight
                          className={cn(
                            "w-4 h-4 ml-auto",
                            hoveredCategory === category.name ? "text-primary" : "text-gray-400"
                          )}
                        />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Right - Content */}
                <div className="flex-1 p-5">
                  {currentCategory && (
                    <>
                      <div className="relative h-40 rounded-lg overflow-hidden mb-5">
                        <img
                          src={currentCategory.imageUrl || DEFAULT_CATEGORY_IMAGE}
                          alt={currentCategory.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                        <div className="absolute inset-0 flex items-center p-6">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="w-4 h-4 text-primary" />
                              <span className="text-xs font-medium text-primary uppercase tracking-wide">Featured</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-1">{currentCategory.name}</h2>
                            <p className="text-white/70 text-sm mb-3">{currentCategory.description || `Explore our ${currentCategory.name} collection`}</p>
                            <Link
                              href={`/category/${currentCategory.slug}`}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
                            >
                              Browse All <ArrowRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {currentCategory._count.products} Products Available
                        </h4>
                        <Link
                          href={`/category/${currentCategory.slug}`}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          View All
                        </Link>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {/* Quick Links */}
                        <Link
                          href={`/category/${currentCategory.slug}&sort=newest`}
                          className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors group"
                        >
                          <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                            New Arrivals
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Latest products</p>
                        </Link>
                        <Link
                          href={`/category/${currentCategory.slug}&sort=popular`}
                          className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors group"
                        >
                          <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                            Best Sellers
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Top rated</p>
                        </Link>
                        <Link
                          href={`/category/${currentCategory.slug}&sort=price_low`}
                          className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors group"
                        >
                          <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                            Budget Picks
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Great value</p>
                        </Link>
                        <Link
                          href={`/category/${currentCategory.slug}&sort=price_high`}
                          className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors group"
                        >
                          <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                            Premium
                          </p>
                          <p className="text-xs text-gray-500 mt-1">High-end options</p>
                        </Link>
                      </div>

                      {/* Products from this category */}
                      {categoryProducts.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Popular in {currentCategory.name}</h4>
                          <div className="grid grid-cols-3 gap-4">
                            {categoryProducts.slice(0, 3).map((product) => (
                              <Link
                                key={product.id}
                                href={`/product/${product.slug}`}
                                className="group relative rounded-lg overflow-hidden h-36"
                              >
                                {product.image ? (
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  />
                                ) : (
                                  <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                    <Package className="w-10 h-10 text-gray-400" />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                <div className="absolute inset-0 p-3 flex flex-col justify-end">
                                  <h5 className="text-sm font-bold text-white group-hover:text-primary transition-colors line-clamp-1">
                                    {product.name}
                                  </h5>
                                  <p className="text-xs text-primary font-semibold">{formatPrice(product.price)}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {isLoadingCategoryProducts && categoryProducts.length === 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center py-4">
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mega Menu - Nav Items */}
      {activeNavItem && currentNavItem && (
        <div
          ref={navMenuRef}
          className="absolute left-0 right-0 top-full z-50"
          onMouseEnter={() => handleNavMenuEnter(activeNavItem)}
          onMouseLeave={handleNavMenuLeave}
        >
          <div className="fixed inset-0 top-[94px] bg-black/30 pointer-events-none" />
          <div className="relative max-w-[1400px] mx-auto px-6 py-4">
            <div
              className={cn(
                "rounded-xl overflow-hidden",
                "bg-white dark:bg-[#0f1419]",
                "border border-gray-200 dark:border-gray-800",
                "shadow-2xl",
                "animate-in fade-in-0 slide-in-from-top-2 duration-200"
              )}
            >
              <div className="flex">
                {/* Left - Subcategories */}
                <div className="w-56 border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0a0e14] p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <currentNavItem.icon className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">{currentNavItem.name}</h3>
                  </div>
                  <div className="space-y-1">
                    {currentNavItem.subcategories.map((sub, idx) => (
                      <Link
                        key={sub.name}
                        href={sub.link || currentNavItem.link}
                        onMouseEnter={() => setHoveredSubcategory(idx)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all",
                          hoveredSubcategory === idx
                            ? "bg-primary/10 text-primary"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                        )}
                      >
                        <span className="text-sm font-medium">{sub.name}</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    ))}
                  </div>
                  <Link
                    href={currentNavItem.link}
                    className="flex items-center gap-2 px-3 py-2 mt-4 text-sm font-medium text-primary hover:text-primary/80"
                  >
                    View All <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Right - Subcategory Content */}
                <div className="flex-1 p-5">
                  {currentNavItem.subcategories[hoveredSubcategory] && (
                    <>
                      {/* Subcategory Header */}
                      <div className="mb-5">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-primary" />
                          <span className="text-xs font-medium text-primary uppercase tracking-wide">
                            {currentNavItem.name}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                          {currentNavItem.subcategories[hoveredSubcategory].name}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          {currentNavItem.subcategories[hoveredSubcategory].description}
                        </p>
                        <Link
                          href={currentNavItem.subcategories[hoveredSubcategory].link || currentNavItem.link}
                          className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
                        >
                          Browse {currentNavItem.subcategories[hoveredSubcategory].name}
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>

                      {/* Products in this subcategory */}
                      {subcategoryProducts.length > 0 && (
                        <div className="grid grid-cols-3 gap-4">
                          {subcategoryProducts.slice(0, 3).map((product) => (
                            <Link
                              key={product.id}
                              href={`/product/${product.slug}`}
                              className="group relative rounded-lg overflow-hidden h-44"
                            >
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                              ) : (
                                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                  <Package className="w-12 h-12 text-gray-400" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                              <div className="absolute inset-0 p-4 flex flex-col justify-end">
                                <h5 className="text-base font-bold text-white group-hover:text-primary transition-colors line-clamp-1">
                                  {product.name}
                                </h5>
                                <p className="text-sm text-primary font-semibold">{formatPrice(product.price)}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}

                      {isLoadingSubcategoryProducts && subcategoryProducts.length === 0 && (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        </div>
                      )}

                      {!isLoadingSubcategoryProducts && subcategoryProducts.length === 0 && (
                        <div className="grid grid-cols-3 gap-4">
                          {currentNavItem.featuredCards.map((card, idx) => (
                            <Link key={idx} href={card.link} className="group relative rounded-lg overflow-hidden h-36">
                              <img
                                src={card.image}
                                alt={card.title}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                              <div className="absolute inset-0 p-3 flex flex-col justify-end">
                                <h5 className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                                  {card.title}
                                </h5>
                                <p className="text-xs text-white/70">{card.subtitle}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute left-0 right-0 top-full z-50 bg-white dark:bg-[#0f1419] border-b border-gray-200 dark:border-gray-800 shadow-xl">
          <div className="max-w-[1400px] mx-auto px-6 py-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search..." className="w-full pl-9 h-10 bg-gray-100 dark:bg-[#12171f] rounded-lg" />
            </div>
            <div className="space-y-1">
              <Link href="/products" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50">
                <Package className="w-5 h-5 text-primary" />
                <span className="font-medium text-gray-900 dark:text-white">All Products</span>
              </Link>
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.link}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
