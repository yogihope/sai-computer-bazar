"use client";

import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { Loader2 } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  discount: number;
  images: { url: string; alt: string | null; isPrimary: boolean }[];
}

const BestSellers = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/public/products?featured=true&limit=6");
        const data = await res.json();
        if (data.products) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error("Error fetching best sellers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold">Best Sellers</h2>
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
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold">Best Sellers</h2>
        <Link href="/products" className="text-primary hover:text-secondary transition-colors">
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            slug={product.slug}
            name={product.name}
            image={product.images[0]?.url || "/placeholder-product.png"}
            price={product.price}
            originalPrice={product.compareAtPrice || product.price}
            discount={product.discount}
          />
        ))}
      </div>
    </section>
  );
};

export default BestSellers;
