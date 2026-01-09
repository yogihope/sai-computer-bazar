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
import { CalendarIcon, X, RotateCcw } from "lucide-react";
import { format } from "date-fns";

interface BlogFiltersProps {
  onClose: () => void;
}

export const BlogFilters = ({ onClose }: BlogFiltersProps) => {
  const [seoRange, setSeoRange] = useState([0, 100]);
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  const statuses = [
    { id: "published", label: "Published", count: 142 },
    { id: "draft", label: "Draft", count: 8 },
    { id: "scheduled", label: "Scheduled", count: 4 },
    { id: "archived", label: "Archived", count: 2 },
  ];

  const categories = [
    { id: "buying-guides", label: "Buying Guides", count: 32 },
    { id: "comparisons", label: "Comparisons", count: 28 },
    { id: "tutorials", label: "Tutorials", count: 45 },
    { id: "reviews", label: "Reviews", count: 38 },
    { id: "news", label: "News", count: 13 },
  ];

  const authors = [
    { id: "rahul", name: "Rahul Sharma", count: 42 },
    { id: "priya", name: "Priya Patel", count: 38 },
    { id: "amit", name: "Amit Kumar", count: 35 },
    { id: "sneha", name: "Sneha Reddy", count: 28 },
    { id: "vijay", name: "Vijay Singh", count: 13 },
  ];

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
                <Checkbox id={status.id} />
                <label htmlFor={status.id} className="text-sm cursor-pointer">
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

      {/* Category Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Category</Label>
        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Checkbox id={category.id} />
                <label htmlFor={category.id} className="text-sm cursor-pointer">
                  {category.label}
                </label>
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {category.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Author Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Author</Label>
        <Select>
          <SelectTrigger className="bg-background/50 border-border/50">
            <SelectValue placeholder="Select author" />
          </SelectTrigger>
          <SelectContent>
            {authors.map((author) => (
              <SelectItem key={author.id} value={author.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{author.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">({author.count})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* SEO Score Range */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-foreground">SEO Score</Label>
          <span className="text-sm text-muted-foreground">
            {seoRange[0]} - {seoRange[1]}
          </span>
        </div>
        <div className="px-1">
          <Slider
            value={seoRange}
            onValueChange={setSeoRange}
            max={100}
            min={0}
            step={5}
            className="w-full"
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0 (Poor)</span>
          <span>50 (Average)</span>
          <span>100 (Excellent)</span>
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
        <Button variant="outline" className="flex-1 gap-2 border-border/50">
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
