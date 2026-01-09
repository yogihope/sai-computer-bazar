"use client";

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  discount: number;
  images: { url: string; alt: string | null; isPrimary: boolean }[];
  badges: { name: string; slug: string; color: string | null }[];
  isFeatured: boolean;
}

// Tag mapping for products based on category or badges
const getProductTag = (product: Product): string => {
  const badge = product.badges[0];
  if (badge) {
    const tagMap: Record<string, string> = {
      "best-seller": "⭐ Best Seller",
      "hot-deal": "🔥 Hot",
      "new-arrival": "✨ New",
      "limited-stock": "⚡ Limited",
      "top-rated": "🏆 Top Rated",
      "editors-choice": "💎 Choice",
      "value-pick": "💰 Value",
      "premium": "👑 Premium",
    };
    return tagMap[badge.slug] || `🏷️ ${badge.name}`;
  }
  if (product.isFeatured) return "⭐ Featured";
  if (product.discount >= 30) return "💎 Deal";
  if (product.discount >= 20) return "🔥 Hot";
  return "🛒 Shop";
};

const MostSoldProducts = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/public/products?sortBy=popularity&limit=8");
        const data = await res.json();
        if (data.products) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-glow-teal">Most Sold Products</h2>
        </div>
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-glow-teal">Most Sold Products</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => scroll('left')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => scroll('right')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => {
          const imageUrl = product.images[0]?.url || "/placeholder-product.png";
          const tag = getProductTag(product);

          return (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className="flex-shrink-0 w-[240px] sm:w-[280px] md:w-[300px] glass-panel rounded-xl p-3 sm:p-4 hover-scale group cursor-pointer"
            >
              <div className="relative mb-4">
                <div className="h-48 bg-muted/20 rounded-lg flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-300">
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder-product.png";
                    }}
                  />
                </div>
                {product.discount > 0 && (
                  <div className="absolute top-2 left-2 bg-destructive px-2 py-1 rounded text-xs font-bold">
                    -{product.discount}%
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-accent/90 px-2 py-1 rounded text-xs font-bold text-accent-foreground">
                  {tag}
                </div>
              </div>

              <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {product.name}
              </h3>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl font-bold text-primary">₹{formatPrice(product.price)}</span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-sm text-muted-foreground line-through">
                    ₹{formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>

              <Button variant="destructive" className="w-full glow-red">
                BUY NOW
              </Button>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default MostSoldProducts;
