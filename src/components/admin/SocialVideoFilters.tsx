import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X, RotateCcw, Youtube, Instagram, Play } from "lucide-react";
import { format } from "date-fns";

interface SocialVideoFiltersProps {
  onClose: () => void;
}

export const SocialVideoFilters = ({ onClose }: SocialVideoFiltersProps) => {
  const [viewsRange, setViewsRange] = useState([0, 100]);
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  const statuses = [
    { id: "active", label: "Active", count: 142, color: "text-emerald-400" },
    { id: "draft", label: "Draft", count: 8, color: "text-amber-400" },
    { id: "scheduled", label: "Scheduled", count: 4, color: "text-blue-400" },
    { id: "disabled", label: "Disabled", count: 2, color: "text-gray-400" },
  ];

  const platforms = [
    { id: "youtube", label: "YouTube", count: 68, icon: Youtube, color: "text-red-400" },
    { id: "youtube_shorts", label: "YouTube Shorts", count: 52, icon: Play, color: "text-red-400" },
    { id: "instagram", label: "Instagram Reels", count: 36, icon: Instagram, color: "text-pink-400" },
  ];

  const placements = [
    { id: "home", label: "Home", count: 45 },
    { id: "prebuilt", label: "Prebuilt PCs", count: 38 },
    { id: "product", label: "Product Page", count: 32 },
    { id: "insights", label: "Insights", count: 28 },
    { id: "footer", label: "Footer", count: 12 },
    { id: "global", label: "Global", count: 8 },
  ];

  const videoTypes = [
    { id: "short", label: "Short (< 1 min)", count: 52 },
    { id: "reel", label: "Reel", count: 36 },
    { id: "long", label: "Long Video", count: 68 },
  ];

  const handleReset = () => {
    setViewsRange([0, 100]);
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

      {/* Platform Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Platform</Label>
        <div className="space-y-2">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <div
                key={platform.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Checkbox id={`platform-${platform.id}`} />
                  <Icon className={`w-4 h-4 ${platform.color}`} />
                  <label htmlFor={`platform-${platform.id}`} className="text-sm cursor-pointer">
                    {platform.label}
                  </label>
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {platform.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Placement Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Placement</Label>
        <div className="space-y-2 max-h-[180px] overflow-y-auto">
          {placements.map((placement) => (
            <div
              key={placement.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Checkbox id={`placement-${placement.id}`} />
                <label htmlFor={`placement-${placement.id}`} className="text-sm cursor-pointer">
                  {placement.label}
                </label>
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {placement.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Video Type Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Video Type</Label>
        <Select>
          <SelectTrigger className="bg-background/50 border-border/50">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {videoTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{type.label}</span>
                  <span className="text-xs text-muted-foreground ml-2">({type.count})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Views Range */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-foreground">Views (K)</Label>
          <span className="text-sm text-muted-foreground">
            {viewsRange[0]}K - {viewsRange[1] === 100 ? "100K+" : `${viewsRange[1]}K`}
          </span>
        </div>
        <div className="px-1">
          <Slider
            value={viewsRange}
            onValueChange={setViewsRange}
            max={100}
            min={0}
            step={5}
            className="w-full"
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0</span>
          <span>50K</span>
          <span>100K+</span>
        </div>
      </div>

      {/* Date Range */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Created Date</Label>
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
