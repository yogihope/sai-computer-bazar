"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, Play, TrendingUp, Clock, Shield, Truck, Award, Zap, Cpu, HardDrive, Monitor, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

interface PrebuiltPC {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  sellingPrice: number;
  compareAtPrice: number | null;
  totalPrice: number;
  discount: number;
  primaryImage: string | null;
  isInStock: boolean;
  isFeatured: boolean;
  isComingSoon: boolean;
  launchDate: string | null;
  targetUse: string | null;
  badges: { name: string; slug: string; color: string | null }[];
  specs: {
    cpu?: string;
    gpu?: string;
    ram?: string;
    storage?: string;
  };
  pcType: { id: string; name: string; slug: string } | null;
  reviewCount: number;
}

interface PCType {
  id: string;
  name: string;
  slug: string;
}

interface SocialReel {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  platform: string;
}

interface HeroBanner {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  imageUrl: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  badgeText: string | null;
}

export default function PrebuiltPCsContent() {
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [prebuiltPCs, setPrebuiltPCs] = useState<PrebuiltPC[]>([]);
  const [comingSoonPCs, setComingSoonPCs] = useState<PrebuiltPC[]>([]);
  const [pcTypes, setPcTypes] = useState<PCType[]>([]);
  const [reels, setReels] = useState<SocialReel[]>([]);
  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrebuiltPCs = async () => {
      try {
        const res = await fetch("/api/public/prebuilt-pcs?limit=20");
        const data = await res.json();
        if (data.prebuiltPCs) {
          setPrebuiltPCs(data.prebuiltPCs);
        }
        if (data.filters?.pcTypes) {
          setPcTypes(data.filters.pcTypes);
        }
      } catch (error) {
        console.error("Error fetching prebuilt PCs:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchComingSoonPCs = async () => {
      try {
        const res = await fetch("/api/public/prebuilt-pcs?comingSoon=true&limit=6");
        const data = await res.json();
        if (data.prebuiltPCs) {
          setComingSoonPCs(data.prebuiltPCs);
        }
      } catch (error) {
        console.error("Error fetching coming soon PCs:", error);
      }
    };

    const fetchReels = async () => {
      try {
        const res = await fetch("/api/public/social-videos?type=SHORT&limit=10");
        const data = await res.json();
        if (data.success && data.videos) {
          setReels(
            data.videos.map((v: any) => ({
              id: v.id,
              title: v.title,
              thumbnail: v.thumbnail,
              videoUrl: v.videoUrl,
              platform: v.platform,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching reels:", error);
      }
    };

    const fetchHeroBanners = async () => {
      try {
        const res = await fetch("/api/public/hero-banners?location=PREBUILT_PC");
        const data = await res.json();
        if (data.banners?.length > 0) {
          setHeroBanners(data.banners);
        }
      } catch (error) {
        console.error("Error fetching hero banners:", error);
      }
    };

    fetchPrebuiltPCs();
    fetchComingSoonPCs();
    fetchReels();
    fetchHeroBanners();
  }, []);

  // Filter PCs by type
  const budgetPCs = prebuiltPCs.filter(pc =>
    pc.sellingPrice < 60000 ||
    pc.pcType?.slug === "budget-gaming" ||
    pc.pcType?.slug === "office-productivity"
  ).slice(0, 4);

  const featuredPCs = prebuiltPCs.filter(pc => pc.isFeatured).slice(0, 3);

  const mostSoldPCs = prebuiltPCs
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 4);

  const popularPCs = prebuiltPCs
    .filter(pc => pc.reviewCount > 0)
    .slice(0, 4);

  // Calculate days until launch
  const getDaysUntilLaunch = (launchDate: string | null): string => {
    if (!launchDate) return "Coming Soon";
    const launch = new Date(launchDate);
    const now = new Date();
    const diffTime = launch.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "Launching Soon";
    if (diffDays === 1) return "1 Day";
    return `${diffDays} Days`;
  };

  // Generate hero slides from dynamic banners, featured PCs, or use defaults
  const heroSlides = heroBanners.length > 0
    ? heroBanners.map((banner) => ({
        title: banner.title,
        subtitle: banner.subtitle || "Expert Built Gaming PC",
        offer: banner.badgeText || "Premium Build - SCB Assured",
        image: banner.imageUrl || "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=1920&q=80",
        buttonText: banner.buttonText || "Shop Now",
        buttonLink: banner.buttonLink || "/prebuilt-pcs",
      }))
    : featuredPCs.length > 0
    ? featuredPCs.slice(0, 3).map((pc) => ({
        title: pc.name,
        subtitle: pc.shortDescription || pc.targetUse || "Expert Built Gaming PC",
        offer: pc.discount > 0 ? `Save ${pc.discount}% - Limited Offer!` : "Premium Build - SCB Assured",
        image: pc.primaryImage || "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=1920&q=80",
        buttonText: "Shop Now",
        buttonLink: `/prebuilt-pc/${pc.slug}`,
      }))
    : [
        {
          title: "The Best Prebuilt Gaming PCs 2025",
          subtitle: "Built by Experts - Fully Tested - SCB Assurance",
          offer: "Get up to 25% OFF + Extra Coupons",
          image: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=1920&q=80",
          buttonText: "Shop Now",
          buttonLink: "/prebuilt-pcs",
        },
        {
          title: "Festival Discounts",
          subtitle: "Limited Time Mega Sale",
          offer: "Save Big on Premium Builds",
          image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=1920&q=80",
          buttonText: "Shop Now",
          buttonLink: "/prebuilt-pcs",
        },
        {
          title: "Creator Builds Sale",
          subtitle: "Professional Workstations",
          offer: "Up to 30% OFF on Select Builds",
          image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=1920&q=80",
          buttonText: "Shop Now",
          buttonLink: "/prebuilt-pcs",
        }
      ];

  // Auto-rotate hero slides
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] sm:h-[500px] lg:h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroSlides[currentHeroSlide].image}
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/30" />
        </div>

        <div className="container px-4 sm:px-6 relative h-full flex items-center">
          <div className="max-w-2xl space-y-4 sm:space-y-6">
            <Badge className="text-sm sm:text-lg px-3 sm:px-4 py-1.5 sm:py-2">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              {heroSlides[currentHeroSlide].offer}
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary">
              {heroSlides[currentHeroSlide].title}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
              {heroSlides[currentHeroSlide].subtitle}
            </p>
            <div className="flex gap-3 sm:gap-4">
              <Link href={heroSlides[currentHeroSlide].buttonLink || "/prebuilt-pcs"}>
                <Button size="lg" className="text-sm sm:text-base h-10 sm:h-11">
                  {heroSlides[currentHeroSlide].buttonText || "Shop Now"}
                </Button>
              </Link>
              <Link href="/prebuilt-pcs">
                <Button size="lg" variant="outline" className="text-sm sm:text-base h-10 sm:h-11">Compare Builds</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Navigation Dots */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentHeroSlide(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentHeroSlide ? "w-6 sm:w-8 bg-primary" : "w-2 bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Social Reels Section */}
      {reels.length > 0 && (
        <section className="py-8 sm:py-12 md:py-16 border-t border-border/50">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8 text-center">
              Watch our Latest Builds in 30 Seconds!
            </h2>
            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {reels.map((reel) => (
                <Card
                  key={reel.id}
                  className="flex-shrink-0 w-[140px] sm:w-[170px] md:w-[200px] overflow-hidden group cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => window.open(reel.videoUrl, "_blank")}
                >
                  <div className="relative aspect-[9/16]">
                    <img src={reel.thumbnail} alt={reel.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="h-12 w-12 text-white" fill="white" />
                    </div>
                    {/* Platform Badge */}
                    <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold text-white ${
                      reel.platform === "YOUTUBE" ? "bg-red-600" :
                      reel.platform === "INSTAGRAM" ? "bg-gradient-to-r from-purple-500 to-pink-500" :
                      "bg-blue-600"
                    }`}>
                      {reel.platform === "YOUTUBE" ? "YT" : reel.platform === "INSTAGRAM" ? "IG" : "FB"}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-white text-sm font-medium line-clamp-2">{reel.title}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Budget Friendly PCs */}
      {budgetPCs.length > 0 && (
        <section className="py-8 sm:py-12 md:py-16 bg-muted/30 dark:bg-muted/10">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Budget-Friendly Powerhouses</h2>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg">Premium performance without breaking the bank</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {budgetPCs.map((pc) => (
                <Link key={pc.id} href={`/prebuilt-pcs/${pc.slug}`}>
                  <Card className="group hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 overflow-hidden h-full">
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={pc.primaryImage || "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&q=80"}
                        alt={pc.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
                        {pc.pcType?.name || "Budget Build"}
                      </Badge>
                      {pc.reviewCount > 0 && (
                        <div className="absolute top-3 right-3 bg-card/50 backdrop-blur-xl border border-border/50 px-3 py-1 rounded-full text-xs">
                          {pc.reviewCount} Reviews
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-3 line-clamp-1">{pc.name}</h3>
                      <div className="space-y-1 mb-4 text-sm text-muted-foreground">
                        {pc.specs.cpu && (
                          <div className="flex items-center gap-2">
                            <Cpu className="h-3 w-3" />
                            <span className="line-clamp-1">{pc.specs.cpu}</span>
                          </div>
                        )}
                        {pc.specs.gpu && (
                          <div className="flex items-center gap-2">
                            <Monitor className="h-3 w-3" />
                            <span className="line-clamp-1">{pc.specs.gpu}</span>
                          </div>
                        )}
                        {(pc.specs.ram || pc.specs.storage) && (
                          <div className="flex items-center gap-2">
                            <HardDrive className="h-3 w-3" />
                            <span className="line-clamp-1">{pc.specs.ram} - {pc.specs.storage}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-2xl font-bold text-primary">&#8377;{formatPrice(pc.sellingPrice)}</span>
                        {pc.compareAtPrice && pc.compareAtPrice > pc.sellingPrice && (
                          <span className="text-sm text-muted-foreground line-through">&#8377;{formatPrice(pc.compareAtPrice)}</span>
                        )}
                      </div>
                      <Button className="w-full">View Build</Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sai Computers Specials */}
      {featuredPCs.length > 0 && (
        <section className="py-8 sm:py-12 md:py-16">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12">
              <Badge className="mb-3 sm:mb-4 text-sm sm:text-lg px-3 sm:px-4 py-1.5 sm:py-2">
                <Award className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                SCB Exclusive
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Sai Computers Specials</h2>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg">Hand-picked premium builds curated by our experts</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {featuredPCs.map((pc) => (
                <Link key={pc.id} href={`/prebuilt-pcs/${pc.slug}`}>
                  <Card className="group overflow-hidden border-2 border-primary/20 hover:border-primary/60 transition-all h-full">
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={pc.primaryImage || "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&q=80"}
                        alt={pc.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-primary text-primary-foreground">
                          {pc.badges[0]?.name || "Featured"}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-bold text-xl mb-4">{pc.name}</h3>
                      <div className="space-y-2 mb-4">
                        {pc.specs.cpu && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Star className="h-3 w-3 text-primary fill-primary" />
                            <span>{pc.specs.cpu}</span>
                          </div>
                        )}
                        {pc.specs.gpu && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Star className="h-3 w-3 text-primary fill-primary" />
                            <span>{pc.specs.gpu}</span>
                          </div>
                        )}
                        {pc.specs.ram && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Star className="h-3 w-3 text-primary fill-primary" />
                            <span>{pc.specs.ram}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-3xl font-bold text-primary mb-4">&#8377;{formatPrice(pc.sellingPrice)}</div>
                      <Button className="w-full">Explore Build</Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Most Sold PCs */}
      {mostSoldPCs.length > 0 && (
        <section className="py-8 sm:py-12 md:py-16 bg-muted/30 dark:bg-muted/10">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                <TrendingUp className="inline h-6 w-6 sm:h-8 sm:w-8 mr-2 text-primary" />
                Most Popular PCs
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg">Top trending builds loved by thousands</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {mostSoldPCs.map((pc, index) => (
                <Link key={pc.id} href={`/prebuilt-pcs/${pc.slug}`}>
                  <Card className="group hover:scale-105 transition-all overflow-hidden relative h-full">
                    <div className="absolute top-4 left-4 z-10">
                      <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                        {index + 1}
                      </div>
                    </div>
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={pc.primaryImage || "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&q=80"}
                        alt={pc.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-2 line-clamp-1">{pc.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 text-primary fill-primary" />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">(5.0)</span>
                      </div>
                      {pc.reviewCount > 0 && (
                        <div className="bg-card/50 backdrop-blur-xl border border-border/50 px-3 py-1 rounded-full text-xs mb-3 inline-block">
                          {pc.reviewCount} Reviews
                        </div>
                      )}
                      <div className="text-2xl font-bold text-primary mb-3">&#8377;{formatPrice(pc.sellingPrice)}</div>
                      <Button className="w-full" variant="outline">View Details</Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Coming Soon Deals */}
      {comingSoonPCs.length > 0 && (
        <section className="py-8 sm:py-12 md:py-16">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                <Clock className="inline h-6 w-6 sm:h-8 sm:w-8 mr-2 text-primary" />
                Future Coming Deals
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg">Get ready for these upcoming premium builds</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {comingSoonPCs.map((pc) => (
                <Card key={pc.id} className="bg-card/50 backdrop-blur-xl border border-border/50 overflow-hidden group hover:border-primary/50 transition-all">
                  <div className="relative aspect-square bg-gradient-to-br from-primary/10 via-muted/50 to-secondary/10 dark:from-primary/20 dark:via-muted/30 dark:to-secondary/20 flex items-center justify-center overflow-hidden">
                    {pc.primaryImage ? (
                      <>
                        <img
                          src={pc.primaryImage}
                          alt={pc.name}
                          className="w-full h-full object-cover opacity-30 blur-sm group-hover:blur-none group-hover:opacity-50 transition-all duration-500"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Badge className="text-lg px-4 py-2 bg-primary/90">COMING SOON</Badge>
                        </div>
                      </>
                    ) : (
                      <div className="text-center space-y-4">
                        <div className="text-6xl font-bold text-primary/20">?</div>
                        <Badge className="text-lg px-4 py-2">COMING SOON</Badge>
                      </div>
                    )}
                    {/* Countdown Badge */}
                    <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-primary/30">
                      <div className="flex items-center gap-1.5 text-sm font-medium">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>{getDaysUntilLaunch(pc.launchDate)}</span>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6 text-center">
                    <h3 className="font-bold text-xl mb-2">{pc.name}</h3>
                    <p className="text-muted-foreground text-sm mb-2">{pc.shortDescription}</p>
                    <p className="text-2xl font-bold text-primary mb-4">
                      &#8377;{formatPrice(pc.sellingPrice)}
                    </p>
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      Notify Me
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popular PCs */}
      {popularPCs.length > 0 && (
        <section className="py-8 sm:py-12 md:py-16 bg-muted/30 dark:bg-muted/10">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 sm:mb-12 text-center">Popular PCs</h2>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {popularPCs.map((pc) => (
                <Link key={pc.id} href={`/prebuilt-pcs/${pc.slug}`}>
                  <Card className="group overflow-hidden hover:scale-105 transition-all h-full">
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={pc.primaryImage || "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&q=80"}
                        alt={pc.name}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
                        {pc.pcType?.name || "Popular"}
                      </Badge>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <div className="text-white space-y-2 w-full">
                          <p className="text-sm">{pc.specs.cpu} - {pc.specs.gpu} - {pc.specs.ram}</p>
                          <Button className="w-full" size="sm">Quick View</Button>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold mb-2 line-clamp-1">{pc.name}</h3>
                      <div className="text-2xl font-bold text-primary">&#8377;{formatPrice(pc.sellingPrice)}</div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PC Finder Wizard */}
      <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-br from-primary/5 via-muted/30 to-primary/5 dark:from-primary/10 dark:via-muted/10 dark:to-primary/10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <Card className="max-w-3xl mx-auto bg-card/80 dark:bg-card/50 backdrop-blur-xl border border-border/50">
            <CardContent className="p-6 sm:p-8 md:p-12 text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">Find Your Perfect PC</h2>
              <p className="text-muted-foreground text-sm sm:text-base mb-6 sm:mb-8">Answer 3 quick questions and we&apos;ll recommend the ideal build</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
                <div className="bg-muted/50 dark:bg-muted/30 border border-border/50 p-3 sm:p-4 rounded-lg">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Budget</p>
                  <p className="font-bold text-sm sm:text-base">What&apos;s your budget?</p>
                </div>
                <div className="bg-muted/50 dark:bg-muted/30 border border-border/50 p-3 sm:p-4 rounded-lg">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Purpose</p>
                  <p className="font-bold text-sm sm:text-base">Your purpose?</p>
                </div>
                <div className="bg-muted/50 dark:bg-muted/30 border border-border/50 p-3 sm:p-4 rounded-lg">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Brand</p>
                  <p className="font-bold text-sm sm:text-base">Preferred brand?</p>
                </div>
              </div>
              <Button size="lg">Find My Perfect PC</Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Build Quality Seal */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">SCB Build Quality Seal</h2>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg">Every build goes through our rigorous testing</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            <Card className="text-center p-4 sm:p-6 bg-card/80 dark:bg-card/50 backdrop-blur-xl border border-border/50">
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">48-Hour Burn Test</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Stability tested for 48 hours</p>
            </Card>
            <Card className="text-center p-4 sm:p-6 bg-card/80 dark:bg-card/50 backdrop-blur-xl border border-border/50">
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">Cable Management</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Professional cable routing</p>
            </Card>
            <Card className="text-center p-4 sm:p-6 bg-card/80 dark:bg-card/50 backdrop-blur-xl border border-border/50">
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">Anti-Static Pack</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Secure packaging</p>
            </Card>
            <Card className="text-center p-4 sm:p-6 bg-card/80 dark:bg-card/50 backdrop-blur-xl border border-border/50">
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Award className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">Lifetime Support</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Free expert assistance</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Warranty Banner */}
      <section className="py-8 sm:py-12 md:py-16 bg-muted/30 dark:bg-muted/10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <Card className="bg-card/80 dark:bg-card/50 backdrop-blur-xl border-2 border-primary/30">
            <CardContent className="p-6 sm:p-8 md:p-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 text-center">
                <div>
                  <Shield className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-primary mx-auto mb-2 sm:mb-4" />
                  <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">2-Year Warranty</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Comprehensive coverage</p>
                </div>
                <div>
                  <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-primary mx-auto mb-2 sm:mb-4" />
                  <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">Easy Returns</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">7-day return policy</p>
                </div>
                <div>
                  <Truck className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-primary mx-auto mb-2 sm:mb-4" />
                  <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">Fast Delivery</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">2-3 business days</p>
                </div>
                <div>
                  <Cpu className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-primary mx-auto mb-2 sm:mb-4" />
                  <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">AI Compatibility</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Automated testing</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
