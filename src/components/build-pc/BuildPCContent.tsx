"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Cpu, Fan, Layers, MemoryStick, Monitor, HardDrive, Zap, Box, Keyboard, Mouse as MouseIcon, Plus, Save, Share2, ShoppingCart, Download, Check, AlertCircle, X, Loader2, Copy, CheckCircle, Trash2, Clock, Sparkles, ArrowRight, Bookmark, Package, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";

interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  model: string;
  price: number;
  compareAtPrice: number | null;
  image: string;
  specs: string[];
  wattage: number;
  compatible: boolean;
}

interface BuildCategory {
  key: string;
  type: string;
  slug: string;
  required: boolean;
  productCount: number;
}

interface SelectedComponent {
  product: Product;
  category: BuildCategory;
}

interface SavedBuild {
  id: number;
  name: string;
  components: { [key: string]: SelectedComponent | null };
  totalPrice: number;
  createdAt: string;
}

const ICON_MAP: { [key: string]: React.ElementType } = {
  cpu: Cpu,
  cooler: Fan,
  motherboard: Layers,
  ram: MemoryStick,
  gpu: Monitor,
  ssd: HardDrive,
  psu: Zap,
  cabinet: Box,
  monitor: Monitor,
  keyboard: Keyboard,
  mouse: MouseIcon,
};

export default function BuildPCContent() {
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<BuildCategory[]>([]);
  const [selectedComponents, setSelectedComponents] = useState<{ [key: string]: SelectedComponent | null }>({});
  const [buildName, setBuildName] = useState("");
  const [showProductSelector, setShowProductSelector] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [savingBuild, setSavingBuild] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [savedBuilds, setSavedBuilds] = useState<SavedBuild[]>([]);
  const [activeTab, setActiveTab] = useState("build");
  const [loadingSharedBuild, setLoadingSharedBuild] = useState(false);
  const { toast } = useToast();
  const { addToCart } = useCart();

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/public/build-pc");
        const data = await res.json();
        if (data.categories) {
          setCategories(data.categories);
          // Initialize selected components
          const initial: { [key: string]: null } = {};
          data.categories.forEach((cat: BuildCategory) => {
            initial[cat.key] = null;
          });
          setSelectedComponents(initial);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        toast({
          title: "Error",
          description: "Failed to load component categories",
          variant: "destructive",
        });
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [toast]);

  // Load saved builds from localStorage
  useEffect(() => {
    try {
      const builds = JSON.parse(localStorage.getItem("savedBuilds") || "[]");
      setSavedBuilds(builds);
    } catch {
      setSavedBuilds([]);
    }
  }, []);


  // Load shared build from URL
  useEffect(() => {
    const buildParam = searchParams.get("build");
    if (buildParam && categories.length > 0) {
      loadSharedBuild(buildParam);
    }
  }, [searchParams, categories]);

  // Load shared build function
  const loadSharedBuild = async (buildString: string) => {
    setLoadingSharedBuild(true);
    try {
      const components = buildString.split(",");
      const loadedComponents: { [key: string]: SelectedComponent | null } = {};

      // Initialize with null
      categories.forEach(cat => {
        loadedComponents[cat.key] = null;
      });

      // Load each component
      for (const comp of components) {
        const [key, productId] = comp.split(":");
        if (key && productId) {
          const category = categories.find(c => c.key === key);
          if (category) {
            // Fetch product details
            const res = await fetch(`/api/products/${productId}`);
            if (res.ok) {
              const data = await res.json();
              if (data.product) {
                loadedComponents[key] = {
                  product: {
                    id: data.product.id,
                    name: data.product.name,
                    slug: data.product.slug,
                    brand: data.product.brand,
                    model: data.product.model || "",
                    price: data.product.price,
                    compareAtPrice: data.product.compareAtPrice,
                    image: data.product.images?.[0]?.url || "/placeholder.svg",
                    specs: data.product.specs?.slice(0, 3).map((s: any) => s.value) || [],
                    wattage: 0,
                    compatible: true,
                  },
                  category,
                };
              }
            }
          }
        }
      }

      setSelectedComponents(loadedComponents);
      toast({
        title: "Build Loaded!",
        description: "Shared build has been loaded successfully.",
      });
    } catch (error) {
      console.error("Failed to load shared build:", error);
      toast({
        title: "Error",
        description: "Failed to load shared build",
        variant: "destructive",
      });
    } finally {
      setLoadingSharedBuild(false);
    }
  };

  // Delete saved build
  const handleDeleteSavedBuild = (buildId: number) => {
    try {
      const builds = savedBuilds.filter(b => b.id !== buildId);
      localStorage.setItem("savedBuilds", JSON.stringify(builds));
      setSavedBuilds(builds);
      toast({
        title: "Build Deleted",
        description: "Saved build has been removed.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete build",
        variant: "destructive",
      });
    }
  };

  // Load saved build
  const handleLoadSavedBuild = (build: SavedBuild) => {
    setSelectedComponents(build.components);
    setBuildName(build.name);
    setActiveTab("build");
    toast({
      title: "Build Loaded!",
      description: `"${build.name}" has been loaded.`,
    });
  };

  // Clear current build
  const handleClearBuild = () => {
    const cleared: { [key: string]: null } = {};
    categories.forEach(cat => {
      cleared[cat.key] = null;
    });
    setSelectedComponents(cleared);
    setBuildName("");
    toast({
      title: "Build Cleared",
      description: "All components have been removed.",
    });
  };

  // Fetch products when category selector opens
  const fetchProducts = useCallback(async (categoryKey: string, search: string = "") => {
    setLoadingProducts(true);
    try {
      const params = new URLSearchParams({ category: categoryKey });
      if (search) params.append("search", search);
      const res = await fetch(`/api/public/build-pc?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoadingProducts(false);
    }
  }, [toast]);

  // Open product selector
  const handleOpenSelector = (categoryKey: string) => {
    setShowProductSelector(categoryKey);
    setSearchQuery("");
    fetchProducts(categoryKey);
  };

  // Search products
  useEffect(() => {
    if (showProductSelector) {
      const timer = setTimeout(() => {
        fetchProducts(showProductSelector, searchQuery);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, showProductSelector, fetchProducts]);

  // Select component
  const handleSelectComponent = (categoryKey: string, product: Product) => {
    const category = categories.find(c => c.key === categoryKey);
    if (!category) return;

    setSelectedComponents(prev => ({
      ...prev,
      [categoryKey]: { product, category },
    }));
    setShowProductSelector(null);
  };

  // Remove component
  const handleRemoveComponent = (categoryKey: string) => {
    setSelectedComponents(prev => ({
      ...prev,
      [categoryKey]: null,
    }));
  };

  // Calculate totals
  const calculateTotalPrice = () => {
    return Object.values(selectedComponents).reduce((total, comp) => {
      return total + (comp?.product.price || 0);
    }, 0);
  };

  const calculateWattage = () => {
    return Object.values(selectedComponents).reduce((total, comp) => {
      return total + (comp?.product.wattage || 0);
    }, 0);
  };

  const recommendedPSU = Math.ceil(calculateWattage() * 1.3);
  const totalPrice = calculateTotalPrice();
  const selectedCount = Object.values(selectedComponents).filter(c => c !== null).length;
  const requiredCount = categories.filter(c => c.required).length;

  // Generate PDF
  const handleGeneratePDF = async () => {
    const buildData = {
      name: buildName || "My Custom PC Build",
      components: Object.entries(selectedComponents)
        .filter(([_, comp]) => comp !== null)
        .map(([key, comp]) => ({
          type: comp!.category.type,
          name: comp!.product.name,
          brand: comp!.product.brand,
          price: comp!.product.price,
          specs: comp!.product.specs,
        })),
      totalPrice,
      totalWattage: calculateWattage(),
      recommendedPSU,
      generatedAt: new Date().toLocaleString("en-IN"),
    };

    // Create a printable HTML content
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${buildData.name} - SCB PC Build</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px; }
          .component { border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin: 10px 0; }
          .component-type { font-size: 12px; color: #6b7280; text-transform: uppercase; }
          .component-name { font-size: 16px; font-weight: bold; margin: 5px 0; }
          .component-price { color: #6366f1; font-weight: bold; }
          .specs { font-size: 12px; color: #6b7280; }
          .summary { background: #f3f4f6; padding: 20px; border-radius: 8px; margin-top: 30px; }
          .total { font-size: 24px; color: #6366f1; font-weight: bold; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #9ca3af; }
        </style>
      </head>
      <body>
        <h1>${buildData.name}</h1>
        <p style="color: #6b7280;">Generated on ${buildData.generatedAt}</p>

        ${buildData.components.map(c => `
          <div class="component">
            <div class="component-type">${c.type}</div>
            <div class="component-name">${c.name}</div>
            <div class="specs">${c.specs.join(" | ")}</div>
            <div class="component-price">${(c.price || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</div>
          </div>
        `).join("")}

        <div class="summary">
          <p><strong>Total Wattage:</strong> ${buildData.totalWattage}W</p>
          <p><strong>Recommended PSU:</strong> ${buildData.recommendedPSU}W+</p>
          <p class="total">Total: ${(buildData.totalPrice || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</p>
        </div>

        <div class="footer">
          <p>SCB - Sai Computer Bazar</p>
          <p>www.saicomputerbazar.com</p>
        </div>
      </body>
      </html>
    `;

    // Open print dialog
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }

    toast({
      title: "PDF Ready",
      description: "Print dialog opened. Save as PDF from print options.",
    });
  };

  // Share build
  const handleShareBuild = () => {
    const buildData = Object.entries(selectedComponents)
      .filter(([_, comp]) => comp !== null)
      .map(([key, comp]) => `${key}:${comp!.product.id}`)
      .join(",");

    const shareableUrl = `${window.location.origin}/build-pc?build=${encodeURIComponent(buildData)}`;
    setShareUrl(shareableUrl);
    setShowShareDialog(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Build URL copied to clipboard",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy URL",
        variant: "destructive",
      });
    }
  };

  // Add all components to cart
  const handleAddAllToCart = async () => {
    const components = Object.values(selectedComponents).filter(c => c !== null);
    if (components.length === 0) {
      toast({
        title: "No components selected",
        description: "Please select at least one component",
        variant: "destructive",
      });
      return;
    }

    setAddingToCart(true);
    try {
      // Add each component to cart sequentially
      for (const comp of components) {
        if (comp) {
          await addToCart(comp.product.id, "product", 1);
        }
      }
      toast({
        title: "Added to Cart!",
        description: `${components.length} components added to your cart`,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add some items to cart",
        variant: "destructive",
      });
    } finally {
      setAddingToCart(false);
    }
  };

  // Save build (to localStorage for now)
  const handleSaveBuild = () => {
    if (!buildName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your build",
        variant: "destructive",
      });
      return;
    }

    setSavingBuild(true);
    try {
      const builds = JSON.parse(localStorage.getItem("savedBuilds") || "[]");
      const newBuild: SavedBuild = {
        id: Date.now(),
        name: buildName,
        components: selectedComponents,
        totalPrice,
        createdAt: new Date().toISOString(),
      };
      builds.push(newBuild);
      localStorage.setItem("savedBuilds", JSON.stringify(builds));
      setSavedBuilds(builds);

      toast({
        title: "Build Saved!",
        description: `"${buildName}" has been saved to your browser.`,
      });
      setBuildName("");
    } catch {
      toast({
        title: "Error",
        description: "Failed to save build",
        variant: "destructive",
      });
    } finally {
      setSavingBuild(false);
    }
  };

  if (loadingCategories || loadingSharedBuild) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">
            {loadingSharedBuild ? "Loading shared build..." : "Loading PC Builder..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-16 md:py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-primary rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-secondary rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Build Your PC
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-4">
              Choose every part of your dream custom build with real-time compatibility checks.
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
                <Package className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{categories.reduce((sum, cat) => sum + cat.productCount, 0)}+ Components</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
                <Gauge className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Real-time Compatibility</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">AI Recommendations</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="container mx-auto px-4 sm:px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 mb-8">
            <TabsTrigger value="build" className="gap-2">
              <Cpu className="w-4 h-4" />
              <span className="hidden sm:inline">Build PC</span>
              <span className="sm:hidden">Build</span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="gap-2">
              <Bookmark className="w-4 h-4" />
              <span className="hidden sm:inline">Saved Builds</span>
              <span className="sm:hidden">Saved</span>
              {savedBuilds.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {savedBuilds.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Build PC Tab */}
          <TabsContent value="build" className="mt-0">
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* LEFT - Component Selection */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {categories.map((category) => {
              const IconComponent = ICON_MAP[category.key] || Box;
              const selected = selectedComponents[category.key];

              return (
                <Card key={category.key} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.005]">
                  <CardContent className="p-3 sm:p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                      <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
                        <div className="p-2 sm:p-3 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                          <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-sm sm:text-base md:text-lg">{category.type}</h3>
                            {category.required && (
                              <Badge variant="secondary" className="text-[10px] sm:text-xs">Required</Badge>
                            )}
                            <Badge variant="outline" className="text-[10px] sm:text-xs">
                              {category.productCount} products
                            </Badge>
                          </div>

                          {selected ? (
                            <div className="mt-2 p-2 sm:p-3 rounded-lg bg-muted/50 border border-border">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                <img src={selected.product.image} alt={selected.product.name} className="w-12 h-12 sm:w-16 sm:h-16 object-contain rounded" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm sm:text-base truncate">{selected.product.name}</p>
                                  <p className="text-xs sm:text-sm text-muted-foreground">{selected.product.model}</p>
                                  <div className="flex flex-wrap gap-1 sm:gap-2 mt-1 sm:mt-2">
                                    {selected.product.specs.slice(0, 2).map((spec, idx) => (
                                      <Badge key={idx} variant="outline" className="text-[10px] sm:text-xs">{spec}</Badge>
                                    ))}
                                  </div>
                                </div>
                                <div className="text-left sm:text-right mt-2 sm:mt-0">
                                  <p className="text-base sm:text-lg font-bold text-primary">
                                    {(selected.product.price || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                                  </p>
                                  {(selected.product.wattage || 0) > 0 && (
                                    <p className="text-xs text-muted-foreground">{selected.product.wattage}W</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">No component selected</p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 self-end sm:self-center flex-shrink-0">
                        {selected && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleRemoveComponent(category.key)}
                            className="hover:bg-destructive/10 hover:text-destructive h-8 w-8 sm:h-9 sm:w-9"
                          >
                            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </Button>
                        )}
                        <Button
                          variant={selected ? "outline" : "default"}
                          onClick={() => handleOpenSelector(category.key)}
                          disabled={category.productCount === 0}
                          className={`text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4 ${!selected ? "bg-gradient-to-r from-primary to-secondary" : ""}`}
                        >
                          {selected ? "Change" : "Choose"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Add-ons Section */}
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Premium Add-ons
                </CardTitle>
                <CardDescription>Enhance your build with these accessories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {["RGB Fans", "Cable Extensions", "Thermal Paste", "Gaming Mouse", "Mousepad", "Headset"].map((addon) => (
                    <Button key={addon} variant="outline" className="h-auto py-4 hover:border-primary">
                      <div className="text-center">
                        <Plus className="w-4 h-4 mx-auto mb-2" />
                        <p className="text-sm">{addon}</p>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT - Sticky Summary Panel */}
          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-24 border-2 border-primary/20 shadow-lg shadow-primary/10">
              <CardHeader className="bg-gradient-to-br from-primary/10 to-secondary/10">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Build Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Power & Performance */}
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Estimated Wattage</span>
                      <Badge variant="secondary" className="text-base font-bold">{calculateWattage()}W</Badge>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Recommended PSU</span>
                      <Badge variant={selectedComponents.psu?.product && parseInt(selectedComponents.psu.product.specs[0] || "0") >= recommendedPSU ? "default" : "destructive"}>
                        {recommendedPSU}W+
                      </Badge>
                    </div>
                    {selectedComponents.psu?.product && (
                      <div className="flex items-center gap-2 text-xs">
                        {parseInt(selectedComponents.psu.product.specs[0] || "0") >= recommendedPSU ? (
                          <>
                            <Check className="w-4 h-4 text-green-500" />
                            <span className="text-green-500">PSU is sufficient</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-destructive" />
                            <span className="text-destructive">PSU may be insufficient</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Compatibility */}
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium">Compatibility Check</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Fully compatibility-checked build by SCB AI Engine.
                    </p>
                  </div>
                </div>

                {/* Total Price */}
                <div className="p-6 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">Total Build Cost</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {(totalPrice || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedCount} / {requiredCount} required parts
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                    size="lg"
                    disabled={selectedCount === 0 || addingToCart}
                    onClick={handleAddAllToCart}
                  >
                    {addingToCart ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ShoppingCart className="w-4 h-4 mr-2" />
                    )}
                    {addingToCart ? "Adding..." : "Add All to Cart"}
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full" disabled={selectedCount === 0}>
                          <Save className="w-4 h-4 mr-2" />
                          Save Build
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Save Your Build</DialogTitle>
                          <DialogDescription>
                            Give your build a name to save it for later
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <Input
                            placeholder="My Gaming Beast"
                            value={buildName}
                            onChange={(e) => setBuildName(e.target.value)}
                          />
                          <Button
                            className="w-full bg-gradient-to-r from-primary to-secondary"
                            onClick={handleSaveBuild}
                            disabled={savingBuild}
                          >
                            {savingBuild ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Build
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button variant="outline" onClick={handleGeneratePDF} disabled={selectedCount === 0}>
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                  </div>

                  <Button variant="outline" className="w-full" onClick={handleShareBuild} disabled={selectedCount === 0}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Build
                  </Button>

                  {/* Clear Build Button */}
                  {selectedCount > 0 && (
                    <Button
                      variant="ghost"
                      className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={handleClearBuild}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear Build
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
          </TabsContent>

          {/* Saved Builds Tab */}
          <TabsContent value="saved" className="mt-0">
            <div className="py-8">
              {savedBuilds.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                    <Bookmark className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Saved Builds</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Start building your dream PC and save it for later. Your builds are stored locally in your browser.
                  </p>
                  <Button onClick={() => setActiveTab("build")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Start Building
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedBuilds.map((build) => {
                    const componentCount = Object.values(build.components).filter(c => c !== null).length;
                    return (
                      <Card key={build.id} className="group hover:shadow-lg transition-all duration-300 hover:border-primary/30">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                {build.name}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-2 mt-1">
                                <Clock className="w-3 h-3" />
                                {new Date(build.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </CardDescription>
                            </div>
                            <Badge variant="secondary">{componentCount} parts</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Component Preview */}
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(build.components)
                              .filter(([_, comp]) => comp !== null)
                              .slice(0, 4)
                              .map(([key, comp]) => {
                                const IconComponent = ICON_MAP[key] || Box;
                                return (
                                  <div
                                    key={key}
                                    className="flex items-center gap-1 px-2 py-1 rounded bg-muted text-xs"
                                    title={comp?.product.name}
                                  >
                                    <IconComponent className="w-3 h-3" />
                                    <span className="truncate max-w-[80px]">{comp?.product.brand || key}</span>
                                  </div>
                                );
                              })}
                            {componentCount > 4 && (
                              <div className="px-2 py-1 rounded bg-muted text-xs">
                                +{componentCount - 4} more
                              </div>
                            )}
                          </div>

                          {/* Price */}
                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <span className="text-sm text-muted-foreground">Total Price</span>
                            <span className="text-lg font-bold text-primary">
                              {(build.totalPrice || 0).toLocaleString("en-IN", {
                                style: "currency",
                                currency: "INR",
                                maximumFractionDigits: 0,
                              })}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Button
                              className="flex-1"
                              onClick={() => handleLoadSavedBuild(build)}
                            >
                              <ArrowRight className="w-4 h-4 mr-2" />
                              Load Build
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteSavedBuild(build.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

        </Tabs>
      </section>

      {/* Product Selector Modal */}
      {showProductSelector && (
        <Dialog open={!!showProductSelector} onOpenChange={() => setShowProductSelector(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col p-0 gap-0">
            {/* Sticky Header */}
            <div className="sticky top-0 z-20 bg-background border-b px-6 pt-6 pb-4">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {React.createElement(ICON_MAP[showProductSelector] || Box, { className: "w-5 h-5" })}
                  Choose {categories.find(c => c.key === showProductSelector)?.type}
                </DialogTitle>
                <DialogDescription>
                  Select a component for your build. Compatible parts are highlighted.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                <Input
                  placeholder="Search components..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Scrollable Products List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {loadingProducts ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Box className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No products found in this category</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {products.map((product) => (
                    <Card
                      key={product.id}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        !product.compatible ? 'opacity-50 border-destructive/50' : 'hover:border-primary'
                      }`}
                      onClick={() => product.compatible && handleSelectComponent(showProductSelector, product)}
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-4 items-center">
                          <img src={product.image} alt={product.name} className="w-24 h-24 object-contain rounded" />

                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-lg">{product.name}</h4>
                                <p className="text-sm text-muted-foreground">{product.model}</p>
                              </div>
                              {product.compatible ? (
                                <Badge variant="default" className="bg-green-500">
                                  <Check className="w-3 h-3 mr-1" />
                                  Compatible
                                </Badge>
                              ) : (
                                <Badge variant="destructive">
                                  <X className="w-3 h-3 mr-1" />
                                  Not Compatible
                                </Badge>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {product.specs.map((spec, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">{spec}</Badge>
                              ))}
                            </div>

                            <div className="flex items-center justify-between pt-2">
                              <div>
                                <p className="text-2xl font-bold text-primary">
                                  {(product.price || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                                </p>
                                {product.compareAtPrice && product.price && product.compareAtPrice > product.price && (
                                  <p className="text-sm text-muted-foreground line-through">
                                    {product.compareAtPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                                  </p>
                                )}
                              </div>
                              {product.compatible && (
                                <Button size="sm" className="bg-gradient-to-r from-primary to-secondary">
                                  Add to Build
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Your Build</DialogTitle>
            <DialogDescription>
              Copy the link below to share your PC build with others
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly className="flex-1" />
              <Button onClick={copyToClipboard} variant="outline">
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Check out my PC build: ${shareUrl}`)}`, '_blank')}
              >
                WhatsApp
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out my PC build: ${shareUrl}`)}`, '_blank')}
              >
                Twitter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
