import { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Download, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminToolbarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onFilterClick?: () => void;
  onExportClick?: () => void;
  showFilters?: boolean;
  showExport?: boolean;
  showSort?: boolean;
  onSortClick?: () => void;
  actions?: ReactNode;
  className?: string;
}

export const AdminToolbar = ({
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  onFilterClick,
  onExportClick,
  showFilters = true,
  showExport = true,
  showSort = false,
  onSortClick,
  actions,
  className,
}: AdminToolbarProps) => {
  return (
    <div
      className={cn(
        "bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4 mb-6",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-10 bg-background/50 border-border/50 focus:border-primary/50"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {showFilters && (
            <Button
              variant="outline"
              className="gap-2 border-border/50 hover:border-primary/50 hover:bg-primary/5"
              onClick={onFilterClick}
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          )}

          {showSort && (
            <Button
              variant="outline"
              className="gap-2 border-border/50 hover:border-primary/50 hover:bg-primary/5"
              onClick={onSortClick}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Sort
            </Button>
          )}

          {showExport && (
            <Button
              variant="outline"
              className="gap-2 border-border/50 hover:border-primary/50 hover:bg-primary/5"
              onClick={onExportClick}
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          )}

          {actions}
        </div>
      </div>
    </div>
  );
};
