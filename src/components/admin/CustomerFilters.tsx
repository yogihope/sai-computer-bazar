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
import { CalendarIcon, X, RotateCcw, Users, Crown, ShoppingCart, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface CustomerFiltersProps {
  onClose: () => void;
}

export const CustomerFilters = ({ onClose }: CustomerFiltersProps) => {
  const [spendRange, setSpendRange] = useState([0, 100]);
  const [ordersRange, setOrdersRange] = useState([0, 50]);
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  const statuses = [
    { id: "active", label: "Active", count: 2156, color: "text-emerald-400" },
    { id: "pending", label: "Pending", count: 124, color: "text-amber-400" },
    { id: "blocked", label: "Blocked", count: 32, color: "text-red-400" },
    { id: "guest", label: "Guest", count: 144, color: "text-gray-400" },
  ];

  const tags = [
    { id: "vip", label: "VIP", count: 89, icon: Crown, color: "text-purple-400" },
    { id: "gamer", label: "Gamer", count: 234, color: "text-blue-400" },
    { id: "bulk-buyer", label: "Bulk Buyer", count: 67, color: "text-emerald-400" },
    { id: "repeat", label: "Repeat Buyer", count: 456, color: "text-cyan-400" },
    { id: "cod-risk", label: "COD Risk", count: 23, icon: AlertTriangle, color: "text-red-400" },
  ];

  const sources = [
    { id: "website", label: "Website", count: 1842 },
    { id: "referral", label: "Referral", count: 234 },
    { id: "promo", label: "Promotion", count: 189 },
    { id: "manual", label: "Manual", count: 67 },
  ];

  const paymentPreferences = [
    { id: "prepaid", label: "Prepaid", count: 1456 },
    { id: "cod", label: "COD", count: 876 },
    { id: "mixed", label: "Mixed", count: 124 },
  ];

  const cities = [
    { id: "mumbai", label: "Mumbai", count: 456 },
    { id: "delhi", label: "Delhi", count: 389 },
    { id: "bangalore", label: "Bangalore", count: 345 },
    { id: "hyderabad", label: "Hyderabad", count: 234 },
    { id: "chennai", label: "Chennai", count: 198 },
    { id: "pune", label: "Pune", count: 167 },
  ];

  const handleReset = () => {
    setSpendRange([0, 100]);
    setOrdersRange([0, 50]);
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

      {/* Tags Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Tags</Label>
        <div className="space-y-2">
          {tags.map((tag) => {
            const Icon = tag.icon;
            return (
              <div
                key={tag.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Checkbox id={`tag-${tag.id}`} />
                  {Icon && <Icon className={`w-3.5 h-3.5 ${tag.color}`} />}
                  <label htmlFor={`tag-${tag.id}`} className="text-sm cursor-pointer">
                    {tag.label}
                  </label>
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {tag.count}
                </span>
              </div>
            );
          })}
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

      {/* Spend Range */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-foreground">Total Spend (in K)</Label>
          <span className="text-sm text-muted-foreground">
            {spendRange[0]}K - {spendRange[1] === 100 ? "100K+" : `${spendRange[1]}K`}
          </span>
        </div>
        <div className="px-1">
          <Slider
            value={spendRange}
            onValueChange={setSpendRange}
            max={100}
            min={0}
            step={5}
            className="w-full"
          />
        </div>
      </div>

      {/* Orders Range */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-foreground">Order Count</Label>
          <span className="text-sm text-muted-foreground">
            {ordersRange[0]} - {ordersRange[1] === 50 ? "50+" : ordersRange[1]}
          </span>
        </div>
        <div className="px-1">
          <Slider
            value={ordersRange}
            onValueChange={setOrdersRange}
            max={50}
            min={0}
            step={1}
            className="w-full"
          />
        </div>
      </div>

      {/* Payment Preference */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Payment Preference</Label>
        <div className="space-y-2">
          {paymentPreferences.map((pref) => (
            <div
              key={pref.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Checkbox id={`pref-${pref.id}`} />
                <label htmlFor={`pref-${pref.id}`} className="text-sm cursor-pointer">
                  {pref.label}
                </label>
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {pref.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* City Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">City</Label>
        <Select>
          <SelectTrigger className="bg-background/50 border-border/50">
            <SelectValue placeholder="All cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city.id} value={city.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{city.label}</span>
                  <span className="text-xs text-muted-foreground ml-2">({city.count})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Last Active Date */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Last Active</Label>
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
