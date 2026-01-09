"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, Heart, GitCompare, MapPin, ShoppingCart, Plus, Minus, Play, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import ProductCard from "@/components/ProductCard";
import { getProductById, Product } from "@/lib/api";

interface ProductDetailContentProps {
  productId: number;
}

const ProductDetailContent = ({ productId }: ProductDetailContentProps) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [mainImage, setMainImage] = useState("/placeholder.svg");
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      const data = await getProductById(productId);
      if (data) {
        setProduct(data);
        setMainImage(data.image);
      }
    };
    loadProduct();
  }, [productId]);

  const thumbnails = product
    ? [product.image, product.hoverImage || product.image, product.image, product.image]
    : ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg", "/placeholder.svg"];

  const specifications = [
    { label: "Brand", value: product?.brand || "N/A" },
    { label: "Model", value: product?.name?.split(" ")[0] || "N/A" },
    { label: "Category", value: product?.category?.replace(/-/g, " ") || "N/A" },
    { label: "SKU", value: `SCB-${product?.id || "0000"}` },
    { label: "Warranty", value: "2 Years" },
  ];

  const reviews = [
    {
      id: 1,
      name: "Rajesh Kumar",
      rating: 5,
      date: "2025-01-10",
      text: "Excellent product! Exactly as described and fast delivery.",
      helpful: 24,
    },
    {
      id: 2,
      name: "Priya Sharma",
      rating: 4,
      date: "2025-01-08",
      text: "Great quality, but packaging could be better. Otherwise, excellent performance.",
      helpful: 12,
    },
  ];

  const relatedProducts = [
    {
      id: 1,
      name: "Logitech G Pro X Superlight",
      brand: "Logitech",
      price: 12999,
      originalPrice: 14999,
      discount: 13,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop",
    },
    {
      id: 2,
      name: "Razer DeathAdder V3",
      brand: "Razer",
      price: 8999,
      originalPrice: 10999,
      discount: 18,
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400&h=400&fit=crop",
    },
    {
      id: 3,
      name: "SteelSeries Rival 3",
      brand: "SteelSeries",
      price: 2999,
      originalPrice: 3999,
      discount: 25,
      rating: 4.5,
      image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop",
    },
    {
      id: 4,
      name: "Corsair Dark Core RGB Pro",
      brand: "Corsair",
      price: 9999,
      originalPrice: 11999,
      discount: 17,
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400&h=400&fit=crop",
    },
  ];

  if (!product) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted rounded-2xl"></div>
            <div className="space-y-4">
              <div className="h-10 bg-muted rounded w-3/4"></div>
              <div className="h-6 bg-muted rounded w-1/4"></div>
              <div className="h-12 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const discountPercentage = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm mb-4 sm:mb-6 overflow-x-auto">
        <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
        <Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors">
          Products
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
        <Link
          href={`/category/${product.category}`}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {product.category.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
        <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Product Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
        {/* Left Column - Image Gallery */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
          {/* Thumbnails */}
          <div className="flex sm:flex-col gap-2 sm:gap-3 overflow-x-auto sm:overflow-visible">
            {thumbnails.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setMainImage(img)}
                className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg glass-panel border-2 border-transparent hover:border-primary transition-all overflow-hidden"
              >
                <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Main Image */}
          <div className="flex-1 rounded-xl sm:rounded-2xl glass-panel p-4 sm:p-6 group relative overflow-hidden">
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
        </div>

        {/* Right Column - Product Details */}
        <div className="space-y-4 sm:space-y-6">
          <div>
            <div className="inline-block px-2 sm:px-3 py-1 bg-primary/20 text-primary rounded-full text-xs sm:text-sm font-semibold mb-2 sm:mb-3">
              {product.brand}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">{product.name}</h1>
            <p className="text-sm sm:text-base text-muted-foreground">SKU: SCB-{product.id}</p>
          </div>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(product.rating!)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className="text-muted-foreground">
                ({product.rating} / 5 from {product.reviewCount?.toLocaleString("en-IN")} reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
            <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-lg sm:text-xl lg:text-2xl text-muted-foreground line-through">
                  ₹{product.originalPrice.toLocaleString("en-IN")}
                </span>
                <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-destructive/20 text-destructive rounded-full text-xs sm:text-sm font-semibold">
                  {discountPercentage}% OFF
                </span>
              </>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2">
            {product.inStock ? (
              <>
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="font-semibold text-green-600 dark:text-green-500">In Stock</span>
              </>
            ) : (
              <>
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="font-semibold text-red-600 dark:text-red-500">Out of Stock</span>
              </>
            )}
          </div>

          {/* Key Highlights */}
          <div className="glass-panel p-3 sm:p-4 rounded-lg space-y-2">
            <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">Key Features</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Premium quality from {product.brand}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>2 Year manufacturer warranty</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Fast delivery across India</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>7-day easy returns</span>
              </li>
            </ul>
          </div>

          {/* Quantity & Actions */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="font-semibold text-sm sm:text-base">Quantity:</span>
              <div className="flex items-center gap-2 sm:gap-3 glass-panel rounded-lg p-1.5 sm:p-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <span className="w-8 sm:w-12 text-center font-semibold text-sm sm:text-base">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3">
              <Button
                className="flex-1 h-10 sm:h-12 text-sm sm:text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90"
                disabled={!product.inStock}
              >
                <ShoppingCart className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Add to Cart
              </Button>
              <Button variant="outline" size="icon" className="h-10 w-10 sm:h-12 sm:w-12">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button variant="outline" size="icon" className="h-10 w-10 sm:h-12 sm:w-12 hidden sm:flex">
                <GitCompare className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>

            <Button
              className="w-full h-10 sm:h-12 text-sm sm:text-lg font-semibold bg-gradient-to-r from-accent to-primary hover:opacity-90"
              disabled={!product.inStock}
            >
              Buy Now
            </Button>
          </div>

          {/* Delivery Checker */}
          <div className="glass-panel p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="font-semibold">Check Delivery</span>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Enter Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="flex-1"
              />
              <Button>Check</Button>
            </div>
          </div>

          {/* Seller Info */}
          <div className="glass-panel p-4 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 text-primary mb-2">
              <span className="font-semibold">✓ SCB Assured</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Genuine product • Fast shipping • 7-day easy returns
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mb-12">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="w-full justify-start h-auto p-1 glass-panel">
            <TabsTrigger value="description" className="text-base px-6 py-3">
              Description
            </TabsTrigger>
            <TabsTrigger value="specifications" className="text-base px-6 py-3">
              Specifications
            </TabsTrigger>
            <TabsTrigger value="reviews" className="text-base px-6 py-3">
              Reviews
            </TabsTrigger>
          </TabsList>

          {/* Description Tab */}
          <TabsContent value="description" className="mt-6">
            <div className="glass-panel p-8 rounded-xl space-y-6">
              <h2 className="text-2xl font-bold">Product Description</h2>
              <p className="text-muted-foreground leading-relaxed">
                {product.description ||
                  `The ${product.name} from ${product.brand} is a premium quality product designed for exceptional performance. Built with the latest technology and highest quality materials, this product delivers outstanding results.`}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-panel p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{product.brand}</div>
                  <div className="text-sm text-muted-foreground">Brand</div>
                </div>
                <div className="glass-panel p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-primary mb-2">2 Years</div>
                  <div className="text-sm text-muted-foreground">Warranty</div>
                </div>
                <div className="glass-panel p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-primary mb-2">COD</div>
                  <div className="text-sm text-muted-foreground">Payment Available</div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Specifications Tab */}
          <TabsContent value="specifications" className="mt-6">
            <div className="glass-panel p-8 rounded-xl">
              <h2 className="text-2xl font-bold mb-6">Technical Specifications</h2>
              <div className="grid grid-cols-1 gap-1">
                {specifications.map((spec, idx) => (
                  <div
                    key={idx}
                    className={`grid grid-cols-2 p-4 rounded-lg ${
                      idx % 2 === 0 ? "bg-muted/20" : ""
                    }`}
                  >
                    <span className="font-semibold">{spec.label}</span>
                    <span className="text-muted-foreground capitalize">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left - Write Review (Sticky) */}
              <div className="lg:col-span-1">
                <div className="glass-panel p-6 rounded-xl sticky top-24 space-y-4">
                  <h3 className="text-xl font-bold">Write a Review</h3>

                  {/* Rating Stars */}
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Your Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} className="hover:scale-110 transition-transform">
                          <Star className="h-6 w-6 text-muted-foreground hover:text-yellow-400 hover:fill-yellow-400" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block">Name</label>
                    <Input placeholder="Your name" />
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block">Email</label>
                    <Input type="email" placeholder="your@email.com" />
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block">Your Review</label>
                    <Textarea placeholder="Share your experience with this product..." rows={4} />
                  </div>

                  <Button className="w-full bg-gradient-to-r from-primary to-accent">
                    Submit Review
                  </Button>
                </div>
              </div>

              {/* Right - Reviews List */}
              <div className="lg:col-span-2 space-y-6">
                {/* Overall Rating */}
                <div className="glass-panel p-6 rounded-xl">
                  <div className="flex items-center gap-6 mb-4">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-primary">
                        {product.rating || "N/A"}
                      </div>
                      <div className="flex gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              product.rating && star <= Math.round(product.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {product.reviewCount?.toLocaleString("en-IN") || 0} reviews
                      </p>
                    </div>
                  </div>
                </div>

                {/* Individual Reviews */}
                {reviews.map((review) => (
                  <div key={review.id} className="glass-panel p-6 rounded-xl space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{review.name}</h4>
                        <div className="flex gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{review.date}</span>
                    </div>
                    <p className="text-muted-foreground">{review.text}</p>
                    <div className="flex items-center gap-4 pt-2">
                      <button className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        Helpful ({review.helpful})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      <div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">You May Also Like</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {relatedProducts.map((relProduct) => (
            <ProductCard key={relProduct.id} {...relProduct} />
          ))}
        </div>
      </div>
    </main>
  );
};

export default ProductDetailContent;
