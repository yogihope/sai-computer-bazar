import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const AdminPagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className,
}: AdminPaginationProps) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border/50",
        className
      )}
    >
      <p className="text-sm text-muted-foreground">
        Showing {startItem}-{endItem} of {totalItems.toLocaleString()} items
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="border-border/50"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {getVisiblePages().map((page, index) =>
          page === "..." ? (
            <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant="outline"
              size="sm"
              className={cn(
                "border-border/50",
                currentPage === page &&
                  "bg-primary/10 border-primary/50 text-primary hover:bg-primary/20"
              )}
              onClick={() => onPageChange(page as number)}
            >
              {page}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="sm"
          className="border-border/50"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
