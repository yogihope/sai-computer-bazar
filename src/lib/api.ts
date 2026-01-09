// Service layer for data fetching
// This can be swapped to Prisma/API later

export interface Product {
  id: number;
  brand: string;
  name: string;
  slug?: string;
  image: string;
  hoverImage?: string;
  price: number;
  originalPrice: number;
  discount: number;
  inStock: boolean;
  category: string;
  description?: string;
  specifications?: Record<string, string>;
  rating?: number;
  reviewCount?: number;
}

export interface Category {
  id: string;
  label: string;
  slug: string;
  description?: string;
  image?: string;
  productCount?: number;
}

// Mock Products Data
const mockProducts: Product[] = [
  {
    id: 1,
    brand: "Logitech",
    name: "G502 HERO High Performance Gaming Mouse",
    slug: "logitech-g502-hero-gaming-mouse",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400&h=400&fit=crop",
    price: 3499,
    originalPrice: 4999,
    discount: 30,
    inStock: true,
    category: "gaming-mouse",
    description: "High-performance gaming mouse with HERO 25K sensor",
    rating: 4.8,
    reviewCount: 1250,
  },
  {
    id: 2,
    brand: "Razer",
    name: "BlackWidow V3 Mechanical Gaming Keyboard",
    slug: "razer-blackwidow-v3-keyboard",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=400&h=400&fit=crop",
    price: 8999,
    originalPrice: 12999,
    discount: 31,
    inStock: true,
    category: "gaming-keyboards",
    rating: 4.7,
    reviewCount: 890,
  },
  {
    id: 3,
    brand: "HyperX",
    name: "Cloud II Gaming Headset - 7.1 Surround Sound",
    slug: "hyperx-cloud-ii-gaming-headset",
    image: "https://images.unsplash.com/photo-1599669454699-248893623440?w=400&h=400&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1545127398-14699f92334b?w=400&h=400&fit=crop",
    price: 6999,
    originalPrice: 9999,
    discount: 30,
    inStock: true,
    category: "gaming-headsets",
    rating: 4.6,
    reviewCount: 2100,
  },
  {
    id: 4,
    brand: "AMD",
    name: "Ryzen 9 7950X 16-Core Processor",
    slug: "amd-ryzen-9-7950x-processor",
    image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=400&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400&h=400&fit=crop",
    price: 54999,
    originalPrice: 64999,
    discount: 15,
    inStock: true,
    category: "processors",
    rating: 4.9,
    reviewCount: 456,
  },
  {
    id: 5,
    brand: "NVIDIA",
    name: "GeForce RTX 4090 24GB Graphics Card",
    slug: "nvidia-geforce-rtx-4090",
    image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=400&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400&h=400&fit=crop",
    price: 159999,
    originalPrice: 179999,
    discount: 11,
    inStock: true,
    category: "graphics-cards",
    rating: 4.9,
    reviewCount: 320,
  },
  {
    id: 6,
    brand: "Corsair",
    name: "Vengeance DDR5 32GB RAM Kit",
    slug: "corsair-vengeance-ddr5-32gb",
    image: "https://images.unsplash.com/photo-1562976540-1502c2145186?w=400&h=400&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=400&fit=crop",
    price: 12999,
    originalPrice: 15999,
    discount: 19,
    inStock: true,
    category: "ram",
    rating: 4.7,
    reviewCount: 678,
  },
  {
    id: 7,
    brand: "Samsung",
    name: "990 PRO 2TB NVMe SSD",
    slug: "samsung-990-pro-2tb-ssd",
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=400&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=400&h=400&fit=crop",
    price: 18999,
    originalPrice: 22999,
    discount: 17,
    inStock: true,
    category: "storage",
    rating: 4.8,
    reviewCount: 1100,
  },
  {
    id: 8,
    brand: "ASUS",
    name: "ROG Strix X670E-E Gaming Motherboard",
    slug: "asus-rog-strix-x670e-motherboard",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=400&h=400&fit=crop",
    price: 42999,
    originalPrice: 48999,
    discount: 12,
    inStock: true,
    category: "motherboards",
    rating: 4.8,
    reviewCount: 234,
  },
  {
    id: 9,
    brand: "Secretlab",
    name: "TITAN Evo 2022 Gaming Chair",
    slug: "secretlab-titan-evo-2022",
    image: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400&h=400&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400&h=400&fit=crop",
    price: 34999,
    originalPrice: 45999,
    discount: 24,
    inStock: true,
    category: "gaming-chairs",
    rating: 4.7,
    reviewCount: 567,
  },
  {
    id: 10,
    brand: "LG",
    name: "27GP950-B 4K 144Hz Gaming Monitor",
    slug: "lg-27gp950-b-gaming-monitor",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=400&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=400&h=400&fit=crop",
    price: 64999,
    originalPrice: 79999,
    discount: 19,
    inStock: true,
    category: "monitors",
    rating: 4.6,
    reviewCount: 389,
  },
  {
    id: 11,
    brand: "Corsair",
    name: "RM1000x 1000W Modular PSU",
    slug: "corsair-rm1000x-psu",
    image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400&h=400&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400&h=400&fit=crop",
    price: 16999,
    originalPrice: 19999,
    discount: 15,
    inStock: false,
    category: "power-supply",
    rating: 4.8,
    reviewCount: 445,
  },
  {
    id: 12,
    brand: "NZXT",
    name: "Kraken Z73 360mm AIO Liquid Cooler",
    slug: "nzxt-kraken-z73-cooler",
    image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400&h=400&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=400&h=400&fit=crop",
    price: 28999,
    originalPrice: 32999,
    discount: 12,
    inStock: true,
    category: "cooling",
    rating: 4.7,
    reviewCount: 289,
  },
];

// Mock Categories Data
const mockCategories: Category[] = [
  { id: "all", label: "All Products", slug: "", productCount: 1250 },
  { id: "processors", label: "Processors", slug: "processors", productCount: 45 },
  { id: "motherboards", label: "Motherboards", slug: "motherboards", productCount: 38 },
  { id: "graphics-cards", label: "Graphics Cards", slug: "graphics-cards", productCount: 52 },
  { id: "ram", label: "RAM", slug: "ram", productCount: 67 },
  { id: "storage", label: "Storage", slug: "storage", productCount: 89 },
  { id: "power-supply", label: "Power Supply", slug: "power-supply", productCount: 34 },
  { id: "cooling", label: "Cooling", slug: "cooling", productCount: 41 },
  { id: "cabinets", label: "Cabinets", slug: "cabinets", productCount: 28 },
  { id: "monitors", label: "Monitors", slug: "monitors", productCount: 56 },
  { id: "laptops", label: "Laptops", slug: "laptops", productCount: 73 },
  { id: "gaming-keyboards", label: "Gaming Keyboards", slug: "gaming-keyboards", productCount: 35 },
  { id: "gaming-mouse", label: "Gaming Mouse", slug: "gaming-mouse", productCount: 42 },
  { id: "gaming-headsets", label: "Gaming Headsets", slug: "gaming-headsets", productCount: 29 },
  { id: "gaming-chairs", label: "Gaming Chairs", slug: "gaming-chairs", productCount: 18 },
  { id: "accessories", label: "Accessories", slug: "accessories", productCount: 156 },
];

// API Functions

export async function getProducts(category?: string): Promise<Product[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  if (!category || category === "") {
    return mockProducts;
  }

  return mockProducts.filter((p) => p.category === category);
}

export async function getProductById(id: number): Promise<Product | null> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return mockProducts.find((p) => p.id === id) || null;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return mockProducts.find((p) => p.slug === slug) || null;
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return mockProducts.slice(0, limit);
}

export async function getBestSellingProducts(limit = 8): Promise<Product[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return [...mockProducts]
    .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
    .slice(0, limit);
}

export async function getCategories(): Promise<Category[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return mockCategories;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return mockCategories.find((c) => c.slug === slug) || null;
}

export async function searchProducts(query: string): Promise<Product[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const lowerQuery = query.toLowerCase();
  return mockProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.brand.toLowerCase().includes(lowerQuery) ||
      p.category.toLowerCase().includes(lowerQuery)
  );
}

// For SSG - get all product IDs
export async function getAllProductIds(): Promise<number[]> {
  return mockProducts.map((p) => p.id);
}

// For SSG - get all category slugs
export async function getAllCategorySlugs(): Promise<string[]> {
  return mockCategories.filter((c) => c.slug).map((c) => c.slug);
}
