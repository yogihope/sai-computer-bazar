"use client";

import Link from "next/link";
import { ArrowRight, Tag, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Ad {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  backgroundColor: string | null;
  textColor: string | null;
  accentColor: string | null;
  buttonText: string | null;
  link: string;
  couponCode?: string;
}

interface AdsSectionProps {
  ads: Ad[];
}

export default function AdsSection({ ads }: AdsSectionProps) {
  if (!ads || ads.length === 0) return null;

  // Track ad click
  const handleAdClick = async (adId: string) => {
    try {
      await fetch(`/api/admin/ads/${adId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "click" }),
      });
    } catch (error) {
      // Silent fail
    }
  };

  return (
    <section className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-lg sm:text-xl font-bold">Special Offers</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {ads.map((ad) => (
          <Link
            key={ad.id}
            href={ad.link}
            onClick={() => handleAdClick(ad.id)}
            className={cn(
              "relative rounded-xl overflow-hidden group cursor-pointer",
              "h-[180px] sm:h-[200px] lg:h-[220px]",
              "border border-border/50 hover:border-primary/50 transition-all duration-300"
            )}
          >
            {/* Background */}
            {ad.imageUrl ? (
              <img
                src={ad.imageUrl}
                alt={ad.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{ backgroundColor: ad.backgroundColor || "#1a1a2e" }}
              />
            )}

            {/* Overlay */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 group-hover:from-black/95 transition-all"
              style={ad.backgroundColor && !ad.imageUrl ? { backgroundColor: ad.backgroundColor + "e6" } : {}}
            />

            {/* Content */}
            <div className="relative h-full flex flex-col justify-end p-3 sm:p-4 z-10">
              {/* Coupon Badge */}
              {ad.couponCode && (
                <div className="absolute top-3 left-3 flex items-center gap-1 bg-primary/90 text-primary-foreground px-2 py-1 rounded text-xs font-bold">
                  <Tag className="w-3 h-3" />
                  {ad.couponCode}
                </div>
              )}

              <span
                className="text-xs font-semibold mb-1"
                style={{ color: ad.accentColor || "#22c55e" }}
              >
                {ad.buttonText || "Shop Now"}
              </span>

              <h3
                className="text-sm sm:text-base font-bold line-clamp-2 mb-1 group-hover:text-primary transition-colors"
                style={{ color: ad.textColor || "#ffffff" }}
              >
                {ad.title}
              </h3>

              {ad.description && (
                <p
                  className="text-xs line-clamp-2 opacity-80"
                  style={{ color: ad.textColor || "#ffffff" }}
                >
                  {ad.description}
                </p>
              )}

              {/* Hover Arrow */}
              <div
                className={cn(
                  "absolute bottom-3 right-3 w-7 h-7 rounded-full",
                  "bg-primary/30 flex items-center justify-center",
                  "opacity-0 group-hover:opacity-100 transition-all duration-300",
                  "translate-x-2 group-hover:translate-x-0"
                )}
              >
                <ArrowRight className="w-3.5 h-3.5 text-primary" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
