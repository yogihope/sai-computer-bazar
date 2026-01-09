"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
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
  Package,
  Loader2,
  LucideIcon,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: { products: number };
}

// Icon mapping for categories
const categoryIcons: Record<string, LucideIcon> = {
  processors: Cpu,
  motherboards: CircuitBoard,
  "graphics-cards": MonitorPlay,
  ram: MemoryStick,
  storage: HardDrive,
  "internal-ssd": HardDrive,
  "nvme-ssd": HardDrive,
  "cpu-coolers": Fan,
  cooling: Fan,
  "pc-cases": Box,
  cabinets: Box,
  "power-supplies": Zap,
  monitors: Monitor,
  laptops: Laptop,
  keyboards: Keyboard,
  peripherals: Package,
  components: Cpu,
  networking: Package,
  audio: Package,
  gaming: Package,
  office: Package,
};

// Subtitle mapping for categories
const categorySubtitles: Record<string, string> = {
  processors: "AMD & Intel CPUs",
  motherboards: "Gaming & Workstation",
  "graphics-cards": "NVIDIA & AMD GPUs",
  ram: "DDR4 / DDR5 Memory",
  storage: "NVMe & SATA Drives",
  "cpu-coolers": "Air & Liquid Coolers",
  cooling: "Air & Liquid Coolers",
  "pc-cases": "ATX & ITX Cases",
  cabinets: "ATX & ITX Cases",
  "power-supplies": "Modular PSUs",
  monitors: "Gaming & Professional",
  laptops: "Gaming & Business",
  keyboards: "Mechanical & Membrane",
  peripherals: "Keyboards, Mice & More",
  components: "PC Parts & Hardware",
  networking: "Routers & Switches",
  audio: "Headphones & Speakers",
  gaming: "Gaming Accessories",
  office: "Office Equipment",
};

const TopCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/public/categories?featured=true&limit=12");
        const data = await res.json();
        if (data.categories) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
              Top Categories
            </h2>
            <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
              Browse our curated collection of premium PC components and accessories
            </p>
          </div>
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
            Top Categories
          </h2>
          <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            Browse our curated collection of premium PC components and accessories
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
          {categories.map((category, index) => {
            const IconComponent = categoryIcons[category.slug] || Package;
            const subtitle = categorySubtitles[category.slug] || `${category._count.products} products`;
            const isHovered = hoveredCategory === index;

            return (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="group relative"
                onMouseEnter={() => setHoveredCategory(index)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                {/* Category Card */}
                <div
                  className={`
                    relative overflow-hidden rounded-xl cursor-pointer
                    transition-all duration-300 ease-out
                    bg-card border border-border
                    hover:border-primary/30
                    ${isHovered
                      ? "shadow-lg dark:shadow-primary/10 -translate-y-1 scale-[1.02]"
                      : "shadow-sm hover:shadow-md"
                    }
                  `}
                >
                  {/* Card Content */}
                  <div className="p-5 md:p-6 flex flex-col items-center text-center">
                    {/* Icon Container */}
                    <div
                      className={`
                        w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center
                        transition-all duration-300 ease-out mb-3 md:mb-4
                        ${isHovered
                          ? "bg-primary/10 dark:bg-primary/15"
                          : "bg-muted dark:bg-muted/50"
                        }
                      `}
                    >
                      <IconComponent
                        className={`
                          w-6 h-6 md:w-7 md:h-7 stroke-[1.5]
                          transition-all duration-300 ease-out
                          ${isHovered
                            ? "text-primary scale-110"
                            : "text-foreground/70 dark:text-foreground/60"
                          }
                        `}
                      />
                    </div>

                    {/* Category Name */}
                    <h3
                      className={`
                        text-sm md:text-base font-medium tracking-tight
                        transition-colors duration-300
                        ${isHovered ? "text-foreground" : "text-foreground/80"}
                      `}
                    >
                      {category.name}
                    </h3>

                    {/* Subtitle - Visible on hover with smooth animation */}
                    <div
                      className={`
                        overflow-hidden transition-all duration-300 ease-out
                        ${isHovered ? "max-h-8 opacity-100 mt-1.5" : "max-h-0 opacity-0 mt-0"}
                      `}
                    >
                      <p className="text-xs text-muted-foreground whitespace-nowrap">
                        {subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Subtle hover gradient overlay */}
                  <div
                    className={`
                      absolute inset-0 pointer-events-none
                      transition-opacity duration-300
                      bg-gradient-to-t from-primary/[0.03] to-transparent
                      ${isHovered ? "opacity-100" : "opacity-0"}
                    `}
                  />

                  {/* Bottom accent line on hover */}
                  <div
                    className={`
                      absolute bottom-0 left-0 right-0 h-0.5
                      bg-gradient-to-r from-transparent via-primary to-transparent
                      transition-all duration-300 ease-out
                      ${isHovered ? "opacity-100" : "opacity-0"}
                    `}
                  />
                </div>
              </Link>
            );
          })}
        </div>

        {/* View All Link */}
        <div className="mt-10 md:mt-12 text-center">
          <Link
            href="/categories"
            className="
              inline-flex items-center gap-2 px-6 py-2.5
              text-sm font-medium text-foreground/70
              border border-border rounded-full
              transition-all duration-300
              hover:text-primary hover:border-primary/50 hover:bg-primary/5
            "
          >
            View All Categories
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TopCategories;
