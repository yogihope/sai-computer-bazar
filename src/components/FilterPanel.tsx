"use client";

import { useState } from "react";
import { Search, ChevronDown, RotateCcw } from "lucide-react";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Button } from "./ui/button";
import { cn, formatPrice } from "@/lib/utils";

interface FilterPanelProps {
  onFilterChange?: (filters: any) => void;
}

const FilterPanel = ({ onFilterChange }: FilterPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [stockFilter, setStockFilter] = useState<string[]>(["in-stock"]);

  // Section open states
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);
  const [brandsOpen, setBrandsOpen] = useState(true);
  const [stockOpen, setStockOpen] = useState(true);

  // Universal categories (not gaming-specific)
  const categories = [
    { id: "processors", label: "Processors", count: 45 },
    { id: "motherboards", label: "Motherboards", count: 38 },
    { id: "graphics-cards", label: "Graphics Cards", count: 52 },
    { id: "ram", label: "RAM / Memory", count: 67 },
    { id: "storage", label: "Storage (SSD/HDD)", count: 89 },
    { id: "power-supply", label: "Power Supply", count: 34 },
    { id: "cooling", label: "Cooling Solutions", count: 41 },
    { id: "cabinets", label: "Cabinets / Cases", count: 28 },
    { id: "monitors", label: "Monitors", count: 56 },
    { id: "peripherals", label: "Peripherals", count: 124 },
    { id: "laptops", label: "Laptops", count: 73 },
    { id: "accessories", label: "Accessories", count: 156 },
  ];

  // Universal brands
  const brands = [
    { id: "amd", label: "AMD", count: 89 },
    { id: "intel", label: "Intel", count: 76 },
    { id: "nvidia", label: "NVIDIA", count: 45 },
    { id: "asus", label: "ASUS", count: 112 },
    { id: "msi", label: "MSI", count: 98 },
    { id: "corsair", label: "Corsair", count: 87 },
    { id: "logitech", label: "Logitech", count: 65 },
    { id: "samsung", label: "Samsung", count: 54 },
    { id: "lg", label: "LG", count: 42 },
    { id: "gigabyte", label: "Gigabyte", count: 78 },
  ];

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const updated = checked
      ? [...selectedCategories, categoryId]
      : selectedCategories.filter((id) => id !== categoryId);
    setSelectedCategories(updated);
  };

  const handleBrandChange = (brandId: string, checked: boolean) => {
    const updated = checked
      ? [...selectedBrands, brandId]
      : selectedBrands.filter((id) => id !== brandId);
    setSelectedBrands(updated);
  };

  const handleStockChange = (stockId: string, checked: boolean) => {
    const updated = checked
      ? [...stockFilter, stockId]
      : stockFilter.filter((id) => id !== stockId);
    setStockFilter(updated);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setPriceRange([0, 200000]);
    setSelectedCategories([]);
    setSelectedBrands([]);
    setStockFilter(["in-stock"]);
  };

  const hasActiveFilters =
    searchQuery ||
    priceRange[0] > 0 ||
    priceRange[1] < 200000 ||
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    stockFilter.length !== 1 ||
    !stockFilter.includes("in-stock");

  const formatPriceLabel = (value: number) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    return `₹${formatPrice(value)}`;
  };

  return (
    <div className="space-y-1">
      {/* Header with Reset */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Filters
        </h2>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>

      {/* Search */}
      <div className="pb-4 mb-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/30"
          />
        </div>
      </div>

      {/* Categories */}
      <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-3 group">
          <span className="text-sm font-medium text-foreground">Categories</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              categoriesOpen && "rotate-180"
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pb-4 border-b border-border">
          <div className="space-y-2.5 max-h-52 overflow-y-auto pr-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center gap-2">
                <Checkbox
                  id={`cat-${category.id}`}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={(checked) =>
                    handleCategoryChange(category.id, checked as boolean)
                  }
                  className="h-4 w-4"
                />
                <Label
                  htmlFor={`cat-${category.id}`}
                  className="flex-1 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                >
                  {category.label}
                </Label>
                <span className="text-xs text-muted-foreground/60">
                  {category.count}
                </span>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Price Range */}
      <Collapsible open={priceOpen} onOpenChange={setPriceOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-3 group">
          <span className="text-sm font-medium text-foreground">Price Range</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              priceOpen && "rotate-180"
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pb-4 border-b border-border">
          <div className="pt-2 px-1">
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              min={0}
              max={200000}
              step={1000}
              className="mb-4"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Min:</span>
                <span className="text-sm font-medium text-foreground">
                  {formatPriceLabel(priceRange[0])}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Max:</span>
                <span className="text-sm font-medium text-foreground">
                  {formatPriceLabel(priceRange[1])}
                </span>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Brands */}
      <Collapsible open={brandsOpen} onOpenChange={setBrandsOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-3 group">
          <span className="text-sm font-medium text-foreground">Brands</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              brandsOpen && "rotate-180"
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pb-4 border-b border-border">
          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-2">
            {brands.map((brand) => (
              <div key={brand.id} className="flex items-center gap-2">
                <Checkbox
                  id={`brand-${brand.id}`}
                  checked={selectedBrands.includes(brand.id)}
                  onCheckedChange={(checked) =>
                    handleBrandChange(brand.id, checked as boolean)
                  }
                  className="h-4 w-4"
                />
                <Label
                  htmlFor={`brand-${brand.id}`}
                  className="flex-1 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                >
                  {brand.label}
                </Label>
                <span className="text-xs text-muted-foreground/60">
                  {brand.count}
                </span>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Availability */}
      <Collapsible open={stockOpen} onOpenChange={setStockOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-3 group">
          <span className="text-sm font-medium text-foreground">Availability</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              stockOpen && "rotate-180"
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pb-4">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <Checkbox
                id="in-stock"
                checked={stockFilter.includes("in-stock")}
                onCheckedChange={(checked) =>
                  handleStockChange("in-stock", checked as boolean)
                }
                className="h-4 w-4"
              />
              <Label
                htmlFor="in-stock"
                className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              >
                In Stock
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="out-of-stock"
                checked={stockFilter.includes("out-of-stock")}
                onCheckedChange={(checked) =>
                  handleStockChange("out-of-stock", checked as boolean)
                }
                className="h-4 w-4"
              />
              <Label
                htmlFor="out-of-stock"
                className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              >
                Out of Stock
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="pre-order"
                checked={stockFilter.includes("pre-order")}
                onCheckedChange={(checked) =>
                  handleStockChange("pre-order", checked as boolean)
                }
                className="h-4 w-4"
              />
              <Label
                htmlFor="pre-order"
                className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              >
                Pre-order
              </Label>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Apply Filters Button (for mobile) */}
      <div className="pt-4 lg:hidden">
        <Button className="w-full" size="sm">
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default FilterPanel;
