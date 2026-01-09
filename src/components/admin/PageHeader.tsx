import { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
  backUrl?: string;
}

export const PageHeader = ({
  title,
  subtitle,
  actions,
  className,
  backUrl,
}: PageHeaderProps) => {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6",
        className
      )}
    >
      <div className="flex items-start gap-4">
        {backUrl && (
          <Link href={backUrl}>
            <Button variant="ghost" size="icon" className="mt-1">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        )}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-3">{actions}</div>
      )}
    </div>
  );
};
