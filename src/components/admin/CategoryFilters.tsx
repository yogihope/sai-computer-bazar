import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, RotateCcw, Filter } from "lucide-react";

interface CategoryFiltersProps {
  open: boolean;
  onClose: () => void;
}

export function CategoryFilters({ open, onClose }: CategoryFiltersProps) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[400px] bg-card border-border/50">
        <SheetHeader className="pb-6 border-b border-border/50">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-foreground">
              <Filter className="w-5 h-5 text-violet-400" />
              Filter Categories
            </SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Parent Category */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Parent Category</Label>
            <Select>
              <SelectTrigger className="bg-background/50 border-border/50">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="root">Root Only</SelectItem>
                <SelectItem value="components">Components</SelectItem>
                <SelectItem value="peripherals">Peripherals</SelectItem>
                <SelectItem value="gaming-pcs">Gaming PCs</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Visibility */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Visibility</Label>
            <Select>
              <SelectTrigger className="bg-background/50 border-border/50">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="visible">Visible Only</SelectItem>
                <SelectItem value="hidden">Hidden Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Featured */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Featured Status</Label>
            <Select>
              <SelectTrigger className="bg-background/50 border-border/50">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="featured">Featured Only</SelectItem>
                <SelectItem value="not-featured">Not Featured</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* SEO Score */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">SEO Score</Label>
            <Select>
              <SelectTrigger className="bg-background/50 border-border/50">
                <SelectValue placeholder="All Scores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scores</SelectItem>
                <SelectItem value="excellent">Excellent (80-100)</SelectItem>
                <SelectItem value="good">Good (60-79)</SelectItem>
                <SelectItem value="needs-work">Needs Work (0-59)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Products Count */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Products Count</Label>
            <Select>
              <SelectTrigger className="bg-background/50 border-border/50">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="empty">Empty (0)</SelectItem>
                <SelectItem value="few">Few (1-10)</SelectItem>
                <SelectItem value="moderate">Moderate (11-50)</SelectItem>
                <SelectItem value="many">Many (50+)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quick Toggles */}
          <div className="space-y-4 pt-4 border-t border-border/50">
            <Label className="text-sm font-medium">Quick Filters</Label>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Has Banner</span>
              <Switch />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Has Icon</span>
              <Switch />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Has Subcategories</span>
              <Switch />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-6 border-t border-border/50">
          <Button variant="outline" className="flex-1 border-border/50">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white">
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
