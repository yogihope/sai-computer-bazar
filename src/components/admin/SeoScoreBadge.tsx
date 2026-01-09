"use client";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SeoScoreBadgeProps {
  score: number;
  showLabel?: boolean;
  showScore?: boolean;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export function SeoScoreBadge({
  score,
  showLabel = true,
  showScore = true,
  size = "md",
  showTooltip = true,
}: SeoScoreBadgeProps) {
  // Determine color and status based on score
  const getScoreInfo = (score: number) => {
    if (score >= 80) {
      return {
        color: "from-emerald-500 to-green-500",
        bgColor: "bg-emerald-500/10",
        textColor: "text-emerald-500",
        borderColor: "border-emerald-500/30",
        ringColor: "ring-emerald-500/20",
        label: "Excellent",
        icon: TrendingUp,
        description: "Great SEO! Your content is well-optimized.",
      };
    } else if (score >= 60) {
      return {
        color: "from-amber-500 to-orange-500",
        bgColor: "bg-amber-500/10",
        textColor: "text-amber-500",
        borderColor: "border-amber-500/30",
        ringColor: "ring-amber-500/20",
        label: "Good",
        icon: Minus,
        description: "Decent SEO. Some improvements can be made.",
      };
    } else if (score >= 40) {
      return {
        color: "from-orange-500 to-red-400",
        bgColor: "bg-orange-500/10",
        textColor: "text-orange-500",
        borderColor: "border-orange-500/30",
        ringColor: "ring-orange-500/20",
        label: "Fair",
        icon: Minus,
        description: "SEO needs work. Add missing meta tags.",
      };
    } else {
      return {
        color: "from-red-500 to-rose-600",
        bgColor: "bg-red-500/10",
        textColor: "text-red-500",
        borderColor: "border-red-500/30",
        ringColor: "ring-red-500/20",
        label: "Poor",
        icon: TrendingDown,
        description: "Poor SEO. Significant improvements needed.",
      };
    }
  };

  const info = getScoreInfo(score);
  const Icon = info.icon;

  // Size variants
  const sizeStyles = {
    sm: {
      container: "h-7 min-w-[70px] px-2 gap-1.5",
      text: "text-xs font-semibold",
      icon: "w-3 h-3",
      ring: "w-5 h-5",
      ringText: "text-[10px]",
    },
    md: {
      container: "h-9 min-w-[90px] px-3 gap-2",
      text: "text-sm font-semibold",
      icon: "w-3.5 h-3.5",
      ring: "w-7 h-7",
      ringText: "text-xs",
    },
    lg: {
      container: "h-11 min-w-[110px] px-4 gap-2.5",
      text: "text-base font-semibold",
      icon: "w-4 h-4",
      ring: "w-9 h-9",
      ringText: "text-sm",
    },
  };

  const styles = sizeStyles[size];

  const badge = (
    <div
      className={cn(
        "inline-flex items-center rounded-full",
        "border backdrop-blur-sm",
        "transition-all duration-300 hover:scale-105",
        info.bgColor,
        info.borderColor,
        styles.container
      )}
    >
      {/* Circular Score Ring */}
      {showScore && (
        <div className="relative">
          <div
            className={cn(
              "rounded-full flex items-center justify-center",
              "bg-gradient-to-br shadow-inner",
              info.color,
              styles.ring
            )}
          >
            <span className={cn("font-bold text-white", styles.ringText)}>
              {score}
            </span>
          </div>
          {/* Glow effect */}
          <div
            className={cn(
              "absolute inset-0 rounded-full blur-sm opacity-40",
              "bg-gradient-to-br",
              info.color
            )}
          />
        </div>
      )}

      {/* Label */}
      {showLabel && (
        <div className="flex items-center gap-1">
          <Icon className={cn(styles.icon, info.textColor)} />
          <span className={cn(styles.text, info.textColor)}>{info.label}</span>
        </div>
      )}
    </div>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent
          side="top"
          className="bg-popover/95 backdrop-blur-xl border-border/50"
        >
          <div className="flex flex-col gap-1 max-w-[200px]">
            <div className="flex items-center gap-2">
              <span className={cn("font-semibold", info.textColor)}>
                SEO Score: {score}/100
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{info.description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Mini version for compact displays
export function SeoScoreMini({ score }: { score: number }) {
  const getColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 cursor-help">
            <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  getColor(score)
                )}
                style={{ width: `${score}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground font-medium min-w-[28px]">
              {score}%
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>SEO Score: {score}/100</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
