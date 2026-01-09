import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AdminCardProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const AdminCard = ({
  children,
  className,
  noPadding = false,
}: AdminCardProps) => {
  return (
    <div
      className={cn(
        "bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden",
        !noPadding && "p-6",
        className
      )}
    >
      {children}
    </div>
  );
};

interface AdminTableWrapperProps {
  children: ReactNode;
  className?: string;
}

export const AdminTableWrapper = ({
  children,
  className,
}: AdminTableWrapperProps) => {
  return (
    <div
      className={cn(
        "bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden",
        className
      )}
    >
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
};

interface StatsCardProps {
  label: string;
  value: string | number;
  change?: string;
  icon?: ReactNode;
  iconColor?: string;
  iconBg?: string;
  onClick?: () => void;
}

export const StatsCard = ({
  label,
  value,
  change,
  icon,
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
  onClick,
}: StatsCardProps) => {
  return (
    <div
      className={cn(
        "bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-5",
        "hover:border-primary/30 transition-all duration-300",
        "hover:shadow-lg hover:shadow-primary/5 group",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {change && (
            <p className={cn("text-xs mt-1", iconColor)}>{change}</p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              "group-hover:scale-110 transition-transform duration-300",
              iconBg
            )}
          >
            <div className={iconColor}>{icon}</div>
          </div>
        )}
      </div>
    </div>
  );
};
