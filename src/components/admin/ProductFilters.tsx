import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface ProductFiltersProps {
  open: boolean;
  onClose: () => void;
}

export function ProductFilters({ open, onClose }: ProductFiltersProps) {
  const categories = [
    "Graphics Cards",
    "Processors",
    "Memory",
    "Storage",
    "Motherboards",
    "Cases",
    "Power Supply",
    "Cooling",
  ];

  const statuses = ["Active", "Draft", "Hidden", "Out of Stock"];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[400px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filter Products</SheetTitle>
          <SheetDescription>
            Refine your product list with advanced filters
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Categories */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Categories</Label>
            <div className="space-y-2">
              {categories.map((category) => (
                <label
                  key={category}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-sm">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Price Range (₹)</Label>
            <div className="space-y-4">
              <Slider
                defaultValue={[0, 200000]}
                max={200000}
                step={1000}
                className="my-4"
              />
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">Min</Label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background text-sm"
                  />
                </div>
                <span className="text-muted-foreground mt-5">—</span>
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">Max</Label>
                  <input
                    type="number"
                    placeholder="200000"
                    className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stock Status */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Stock Status</Label>
            <div className="space-y-2">
              {["In Stock", "Low Stock (≤5)", "Out of Stock"].map((status) => (
                <label
                  key={status}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-sm">{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Product Status */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Product Status</Label>
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <Badge
                  key={status}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10 hover:border-primary/30"
                >
                  {status}
                </Badge>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Minimum Rating</Label>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <label
                  key={rating}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="rating"
                    className="w-4 h-4 rounded-full border-border"
                  />
                  <div className="flex items-center gap-1">
                    {Array.from({ length: rating }).map((_, i) => (
                      <span key={i} className="text-accent text-sm">★</span>
                    ))}
                    <span className="text-sm text-muted-foreground ml-1">
                      & up
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* SEO Score */}
          <div>
            <Label className="text-base font-semibold mb-3 block">SEO Score</Label>
            <Slider
              defaultValue={[0]}
              max={100}
              step={5}
              className="my-4"
            />
            <p className="text-sm text-muted-foreground">
              Minimum score: <span className="font-semibold">0</span>
            </p>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Reset Filters
          </Button>
          <Button className="flex-1 glow-teal" onClick={onClose}>
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
