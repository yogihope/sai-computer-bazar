import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X, RotateCcw, Star, Image, Video, Shield, AlertTriangle, Bookmark } from "lucide-react";
import { format } from "date-fns";

interface ReviewFiltersProps {
  onClose: () => void;
}

export const ReviewFilters = ({ onClose }: ReviewFiltersProps) => {
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  const statuses = [
    { id: "pending", label: "Pending", count: 23, color: "text-amber-400" },
    { id: "approved", label: "Approved", count: 156, color: "text-emerald-400" },
    { id: "rejected", label: "Rejected", count: 12, color: "text-red-400" },
    { id: "hidden", label: "Hidden", count: 5, color: "text-gray-400" },
  ];

  const ratings = [
    { id: "5", label: "5 Stars", count: 89 },
    { id: "4", label: "4 Stars", count: 45 },
    { id: "3", label: "3 Stars", count: 23 },
    { id: "2", label: "2 Stars", count: 12 },
    { id: "1", label: "1 Star", count: 8 },
  ];

  const mediaOptions = [
    { id: "with-images", label: "With Images", count: 67, icon: Image },
    { id: "with-videos", label: "With Videos", count: 12, icon: Video },
    { id: "text-only", label: "Text Only", count: 98 },
  ];

  const sources = [
    { id: "website", label: "Website", count: 156 },
    { id: "whatsapp", label: "WhatsApp", count: 23 },
    { id: "manual", label: "Manual", count: 8 },
  ];

  const spamLevels = [
    { id: "low", label: "Low Risk", count: 167, color: "text-emerald-400" },
    { id: "medium", label: "Medium Risk", count: 15, color: "text-amber-400" },
    { id: "high", label: "High Risk", count: 5, color: "text-red-400" },
  ];

  const savedFilters = [
    { id: "pending-today", label: "Pending Today" },
    { id: "1-star-urgent", label: "1-Star Urgent" },
    { id: "top-5star-photos", label: "Top 5-star with photos" },
    { id: "potential-spam", label: "Potential spam" },
  ];

  const handleReset = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Saved Filter Presets */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Bookmark className="w-4 h-4" />
          Quick Filters
        </Label>
        <div className="flex flex-wrap gap-2">
          {savedFilters.map((filter) => (
            <Button
              key={filter.id}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Status Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Status</Label>
        <div className="space-y-2">
          {statuses.map((status) => (
            <div
              key={status.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Checkbox id={`status-${status.id}`} />
                <label htmlFor={`status-${status.id}`} className={`text-sm cursor-pointer ${status.color}`}>
                  {status.label}
                </label>
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {status.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Rating Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Star className="w-4 h-4" />
          Rating
        </Label>
        <div className="space-y-2">
          {ratings.map((rating) => (
            <div
              key={rating.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Checkbox id={`rating-${rating.id}`} />
                <label htmlFor={`rating-${rating.id}`} className="text-sm cursor-pointer flex items-center gap-1">
                  {[...Array(parseInt(rating.id))].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  {[...Array(5 - parseInt(rating.id))].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-muted text-muted" />
                  ))}
                </label>
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {rating.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Media Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Media</Label>
        <div className="space-y-2">
          {mediaOptions.map((option) => {
            const Icon = option.icon;
            return (
              <div
                key={option.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Checkbox id={`media-${option.id}`} />
                  {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground" />}
                  <label htmlFor={`media-${option.id}`} className="text-sm cursor-pointer">
                    {option.label}
                  </label>
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {option.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Verified Purchase */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium">Verified Purchase Only</span>
          </div>
          <Checkbox id="verified-only" />
        </div>
      </div>

      {/* Source Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Source</Label>
        <Select>
          <SelectTrigger className="bg-background/50 border-border/50">
            <SelectValue placeholder="All sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {sources.map((source) => (
              <SelectItem key={source.id} value={source.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{source.label}</span>
                  <span className="text-xs text-muted-foreground ml-2">({source.count})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Product Category</Label>
        <Select>
          <SelectTrigger className="bg-background/50 border-border/50">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="graphics-cards">Graphics Cards</SelectItem>
            <SelectItem value="processors">Processors</SelectItem>
            <SelectItem value="motherboards">Motherboards</SelectItem>
            <SelectItem value="ram">RAM</SelectItem>
            <SelectItem value="storage">Storage</SelectItem>
            <SelectItem value="peripherals">Peripherals</SelectItem>
            <SelectItem value="monitors">Monitors</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Spam Score Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Spam Risk Level
        </Label>
        <div className="space-y-2">
          {spamLevels.map((level) => (
            <div
              key={level.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Checkbox id={`spam-${level.id}`} />
                <label htmlFor={`spam-${level.id}`} className={`text-sm cursor-pointer ${level.color}`}>
                  {level.label}
                </label>
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {level.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* High Impact Filter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/30">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <div>
              <p className="text-sm font-medium">High Impact</p>
              <p className="text-xs text-muted-foreground">1-star + verified + recent</p>
            </div>
          </div>
          <Checkbox id="high-impact" />
        </div>
      </div>

      {/* Date Range */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Date Range</Label>
        <div className="grid grid-cols-2 gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-start text-left font-normal border-border/50 bg-background/50"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFrom ? format(dateFrom, "PP") : "From"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-start text-left font-normal border-border/50 bg-background/50"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateTo ? format(dateTo, "PP") : "To"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={dateTo} onSelect={setDateTo} />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t border-border/50">
        <Button
          variant="outline"
          className="flex-1 gap-2 border-border/50"
          onClick={handleReset}
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
        <Button
          className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
          onClick={onClose}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
};
