import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface PrebuiltPCFiltersProps {
  onClose: () => void;
}

export const PrebuiltPCFilters = ({ onClose }: PrebuiltPCFiltersProps) => {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Filters</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Price Range */}
        <div className="space-y-3">
          <Label>Price Range</Label>
          <div className="pt-2">
            <Slider defaultValue={[0, 300000]} max={500000} step={10000} />
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>₹0</span>
            <span>₹5,00,000</span>
          </div>
        </div>

        {/* CPU Type */}
        <div className="space-y-3">
          <Label>CPU Type</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="All CPUs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All CPUs</SelectItem>
              <SelectItem value="intel">Intel</SelectItem>
              <SelectItem value="amd">AMD</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* GPU Type */}
        <div className="space-y-3">
          <Label>GPU Type</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="All GPUs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All GPUs</SelectItem>
              <SelectItem value="nvidia">NVIDIA</SelectItem>
              <SelectItem value="amd">AMD</SelectItem>
              <SelectItem value="integrated">Integrated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* RAM Size */}
        <div className="space-y-3">
          <Label>RAM Size</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="All RAM" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All RAM</SelectItem>
              <SelectItem value="8gb">8GB</SelectItem>
              <SelectItem value="16gb">16GB</SelectItem>
              <SelectItem value="32gb">32GB</SelectItem>
              <SelectItem value="64gb">64GB+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Storage Type */}
        <div className="space-y-3">
          <Label>Storage Type</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="All Storage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Storage</SelectItem>
              <SelectItem value="ssd">SSD</SelectItem>
              <SelectItem value="nvme">NVMe</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        <div className="space-y-3">
          <Label>Category</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="gaming" />
              <label htmlFor="gaming" className="text-sm">Gaming</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="editing" />
              <label htmlFor="editing" className="text-sm">Editing</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="office" />
              <label htmlFor="office" className="text-sm">Office</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="budget" />
              <label htmlFor="budget" className="text-sm">Budget</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="scb-special" />
              <label htmlFor="scb-special" className="text-sm">SCB Special</label>
            </div>
          </div>
        </div>

        {/* Stock Status */}
        <div className="space-y-3">
          <Label>Stock Status</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="in-stock" defaultChecked />
              <label htmlFor="in-stock" className="text-sm">In Stock</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="low-stock" defaultChecked />
              <label htmlFor="low-stock" className="text-sm">Low Stock</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="out-stock" />
              <label htmlFor="out-stock" className="text-sm">Out of Stock</label>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="space-y-3">
          <Label>Publication Status</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="published" defaultChecked />
              <label htmlFor="published" className="text-sm">Published</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="draft" defaultChecked />
              <label htmlFor="draft" className="text-sm">Draft</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="hidden" />
              <label htmlFor="hidden" className="text-sm">Hidden</label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t">
        <Button variant="outline" onClick={onClose}>
          Reset Filters
        </Button>
        <Button onClick={onClose}>Apply Filters</Button>
      </div>
    </div>
  );
};
