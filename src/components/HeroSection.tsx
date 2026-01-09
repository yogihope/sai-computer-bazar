"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight, Zap, Shield } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface HeroBanner {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  imageUrl: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  textColor: string | null;
  badgeText: string | null;
  badgeColor: string | null;
}

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const heroRef = useRef<HTMLDivElement>(null);

  // Fetch hero banners
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch("/api/public/hero-banners?location=HOME");
        const data = await res.json();
        if (data.banners?.length > 0) {
          setBanners(data.banners);
        }
      } catch (error) {
        console.error("Error fetching hero banners:", error);
      }
    };

    fetchBanners();
  }, []);

  // Fallback banners if no data
  const allBanners = banners.length > 0
    ? banners.map((b) => ({
        title: b.title,
        subtitle: b.subtitle || "Premium Quality Products",
        description: b.description || "",
        cta: b.buttonText || "Shop Now",
        ctaLink: b.buttonLink || "/products",
        image: b.imageUrl || "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1200&q=80",
        badge: b.badgeText || "Featured",
        badgeColor: b.badgeColor || null,
        textColor: b.textColor || "#ffffff",
      }))
    : [
        {
          title: "RTX 5090 Series",
          subtitle: "Next-Gen Gaming Unleashed",
          description: "Experience unprecedented performance with NVIDIA's latest flagship GPU.",
          cta: "Shop Now",
          ctaLink: "/products",
          image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1200&q=80",
          badge: "New Arrival",
          badgeColor: null,
          textColor: "#ffffff",
        },
        {
          title: "Premium Gaming PCs",
          subtitle: "Built for Champions",
          description: "Handcrafted gaming rigs with RTX 4080/4090 and Intel 14th Gen.",
          cta: "Explore Builds",
          ctaLink: "/prebuilt-pcs",
          image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=1200&q=80",
          badge: "Best Seller",
          badgeColor: null,
          textColor: "#ffffff",
        },
        {
          title: "Workstation Series",
          subtitle: "Power Your Creativity",
          description: "Professional-grade workstations for 3D rendering and video editing.",
          cta: "View Collection",
          ctaLink: "/products",
          image: "https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=1200&q=80",
          badge: "Pro Series",
          badgeColor: null,
          textColor: "#ffffff",
        },
      ];

  // Side banners = last 2 banners (right side cards)
  // Main slider = all remaining banners (left side slider)
  const sideBanners = allBanners.length > 2
    ? allBanners.slice(-2)  // Last 2 banners
    : allBanners.length === 2
      ? [allBanners[1]]  // Only 1 side banner if total is 2
      : [];  // No side banners if only 1 total

  const mainBanners = allBanners.length > 2
    ? allBanners.slice(0, -2)  // All except last 2
    : allBanners.length >= 1
      ? [allBanners[0]]  // First banner only
      : [];

  // Auto-rotate slides (if main has multiple)
  useEffect(() => {
    if (isHovered || mainBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % mainBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isHovered, mainBanners.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % mainBanners.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + mainBanners.length) % mainBanners.length);

  const currentBanner = mainBanners[currentSlide];

  return (
    <section className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
      <div className="grid lg:grid-cols-12 gap-3 sm:gap-4">
        {/* Main Banner - Left Side */}
        <div
          className={cn("relative group", sideBanners.length > 0 ? "lg:col-span-9" : "lg:col-span-12")}
          ref={heroRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            className={cn(
              "rounded-xl sm:rounded-2xl overflow-hidden h-[300px] sm:h-[380px] lg:h-[480px] relative",
              "bg-card border border-border"
            )}
          >
            {/* Background Images with Transitions */}
            {mainBanners.map((banner, index) => (
              <div
                key={index}
                className={cn(
                  "absolute inset-0 transition-all duration-1000 ease-out",
                  index === currentSlide
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-105"
                )}
              >
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
              </div>
            ))}

            {/* Content */}
            <div className="relative h-full flex flex-col justify-center p-4 sm:p-8 lg:p-12 pb-16 sm:pb-20 z-10 max-w-2xl">
              {/* Badge */}
              <div
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 w-fit",
                  "bg-primary/20 backdrop-blur-sm border border-primary/30"
                )}
                style={currentBanner.badgeColor ? { backgroundColor: `${currentBanner.badgeColor}30`, borderColor: `${currentBanner.badgeColor}50` } : {}}
              >
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" style={currentBanner.badgeColor ? { backgroundColor: currentBanner.badgeColor } : {}} />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider" style={currentBanner.badgeColor ? { color: currentBanner.badgeColor } : {}}>
                  {currentBanner.badge}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-1 sm:mb-2 tracking-tight" style={{ color: currentBanner.textColor }}>
                {currentBanner.title}
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base lg:text-xl text-white/90 font-medium mb-2" style={{ color: `${currentBanner.textColor}e6` }}>
                {currentBanner.subtitle}
              </p>

              {/* Description - hidden on mobile */}
              <p className="hidden sm:block text-xs sm:text-sm lg:text-base text-white/70 mb-4 leading-relaxed max-w-lg line-clamp-2" style={{ color: `${currentBanner.textColor}b3` }}>
                {currentBanner.description}
              </p>

              {/* CTAs */}
              <div className="flex items-center gap-2 sm:gap-3">
                <Link href={currentBanner.ctaLink}>
                  <Button
                    size="lg"
                    className={cn(
                      "h-9 sm:h-11 px-4 sm:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold",
                      "bg-primary hover:bg-primary/90 text-primary-foreground",
                      "shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30",
                      "transition-all duration-300 group"
                    )}
                  >
                    {currentBanner.cta}
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Navigation Arrows (only if multiple slides) */}
            {mainBanners.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2 z-20",
                    "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center",
                    "bg-black/30 hover:bg-black/50 backdrop-blur-sm border border-white/10",
                    "text-white/70 hover:text-white transition-all duration-200",
                    "opacity-0 group-hover:opacity-100"
                  )}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextSlide}
                  className={cn(
                    "absolute right-3 top-1/2 -translate-y-1/2 z-20",
                    "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center",
                    "bg-black/30 hover:bg-black/50 backdrop-blur-sm border border-white/10",
                    "text-white/70 hover:text-white transition-all duration-200",
                    "opacity-0 group-hover:opacity-100"
                  )}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Slide Indicators - Fixed at bottom center */}
            {mainBanners.length > 1 && (
              <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
                {mainBanners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      index === currentSlide
                        ? "w-6 bg-primary"
                        : "w-1.5 bg-white/50 hover:bg-white/70"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Side Banners - Right Side (2nd and 3rd hero banners) */}
        {sideBanners.length > 0 && (
          <div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
            {sideBanners.map((banner, index) => (
              <Link
                key={index}
                href={banner.ctaLink}
                className={cn(
                  "relative rounded-lg sm:rounded-xl overflow-hidden",
                  sideBanners.length === 1 ? "h-[140px] sm:h-[180px] lg:h-[480px]" : "h-[140px] sm:h-[180px] lg:h-[232px]",
                  "group cursor-pointer block"
                )}
              >
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30 group-hover:from-black/95 transition-all duration-300" />
                <div className="relative h-full flex flex-col justify-end p-4 sm:p-5 z-10">
                  {banner.badge && (
                    <span
                      className="text-xs font-medium text-primary mb-1"
                      style={banner.badgeColor ? { color: banner.badgeColor } : {}}
                    >
                      {banner.badge}
                    </span>
                  )}
                  <h3
                    className="text-base sm:text-lg font-bold text-white mb-0.5 group-hover:text-primary transition-colors"
                    style={{ color: banner.textColor }}
                  >
                    {banner.title}
                  </h3>
                  <p className="text-xs text-white/70 line-clamp-2">
                    {banner.subtitle}
                  </p>
                  <div
                    className={cn(
                      "absolute bottom-4 right-4 w-8 h-8 rounded-full",
                      "bg-primary/20 flex items-center justify-center",
                      "opacity-0 group-hover:opacity-100 transition-all duration-300",
                      "translate-x-2 group-hover:translate-x-0"
                    )}
                  >
                    <ArrowRight className="w-4 h-4 text-primary" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
