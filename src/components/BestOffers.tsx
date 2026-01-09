"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface PrebuiltPC {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  sellingPrice: number;
  compareAtPrice: number | null;
  discount: number;
  primaryImage: string | null;
  badges: { name: string; slug: string; color: string | null }[];
  specs: {
    cpu?: string;
    gpu?: string;
    ram?: string;
    storage?: string;
  };
  pcType: { name: string; slug: string } | null;
}

// Badge emoji mapping
const getBadgeEmoji = (slug: string): string => {
  const emojiMap: Record<string, string> = {
    "gaming": "🎮",
    "workstation": "💼",
    "streaming": "🎥",
    "budget": "💰",
    "premium": "👑",
    "rgb": "🌈",
    "cooling": "❄️",
    "storage": "💾",
    "creator": "🎨",
    "esports": "🏆",
  };
  return emojiMap[slug] || "🖥️";
};

const BestOffers = () => {
  const [prebuiltPCs, setPrebuiltPCs] = useState<PrebuiltPC[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrebuiltPCs = async () => {
      try {
        const res = await fetch("/api/public/prebuilt-pcs?featured=true&limit=6");
        const data = await res.json();
        if (data.prebuiltPCs) {
          setPrebuiltPCs(data.prebuiltPCs);
        }
      } catch (error) {
        console.error("Error fetching prebuilt PCs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrebuiltPCs();
  }, []);

  if (loading) {
    return (
      <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-glow-teal">Best Offers & Bundles</h2>
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (prebuiltPCs.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-glow-teal">Best Offers & Bundles</h2>
        <Link href="/prebuilt-pcs" className="text-primary hover:text-secondary transition-colors text-sm sm:text-base">
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {prebuiltPCs.map((pc) => {
          const badge = pc.badges[0];
          const badgeText = badge
            ? `${getBadgeEmoji(badge.slug)} ${badge.name}`
            : pc.pcType
            ? `${getBadgeEmoji(pc.pcType.slug)} ${pc.pcType.name}`
            : "🖥️ PC Build";

          return (
            <Link
              key={pc.id}
              href={`/prebuilt-pcs/${pc.slug}`}
              className="glass-panel rounded-xl p-4 sm:p-6 hover-scale cursor-pointer group relative overflow-hidden"
            >
              {/* Floating discount bubble */}
              {pc.discount > 0 && (
                <div className="absolute -top-2 -right-2 bg-destructive w-14 h-14 sm:w-20 sm:h-20 rounded-full flex items-center justify-center font-bold text-sm sm:text-lg glow-red">
                  -{pc.discount}%
                </div>
              )}

              {/* Badge */}
              <div className="inline-block bg-accent/90 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold text-accent-foreground mb-3 sm:mb-4">
                {badgeText}
              </div>

              {/* Content */}
              <h3 className="text-base sm:text-xl font-bold mb-2 group-hover:text-primary transition-colors pr-8 sm:pr-12">
                {pc.name}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-3">
                {pc.shortDescription || (pc.specs.cpu && pc.specs.gpu
                  ? `${pc.specs.cpu.split(' ').slice(0, 3).join(' ')} + ${pc.specs.gpu.split(' ').slice(0, 3).join(' ')}`
                  : "Custom Build")}
              </p>

              {/* Price */}
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <span className="text-lg sm:text-xl font-bold text-primary">₹{formatPrice(pc.sellingPrice)}</span>
                {pc.compareAtPrice && pc.compareAtPrice > pc.sellingPrice && (
                  <span className="text-xs sm:text-sm text-muted-foreground line-through">
                    ₹{formatPrice(pc.compareAtPrice)}
                  </span>
                )}
              </div>

              <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                View Details →
              </Button>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default BestOffers;
