import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Cpu, Info, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Component {
  id: string;
  name: string;
  price: number;
  compatibility: "good" | "warning" | "error";
  specs?: string;
}

interface ComponentSelectorProps {
  label: string;
  icon?: React.ReactNode;
  selectedComponent?: Component;
  onSelect: (component: Component) => void;
}

const mockComponents: { [key: string]: Component[] } = {
  cpu: [
    { id: "1", name: "AMD Ryzen 9 7950X", price: 54999, compatibility: "good", specs: "16 Cores, 32 Threads, 5.7GHz Boost" },
    { id: "2", name: "Intel i9-13900K", price: 59999, compatibility: "good", specs: "24 Cores, 32 Threads, 5.8GHz Boost" },
    { id: "3", name: "AMD Ryzen 7 7800X3D", price: 39999, compatibility: "good", specs: "8 Cores, 16 Threads, 5.0GHz Boost, 3D V-Cache" },
  ],
  gpu: [
    { id: "1", name: "RTX 4090", price: 159999, compatibility: "warning", specs: "24GB GDDR6X, 450W TDP" },
    { id: "2", name: "RTX 4080", price: 119999, compatibility: "good", specs: "16GB GDDR6X, 320W TDP" },
    { id: "3", name: "RTX 4070 Ti", price: 79999, compatibility: "good", specs: "12GB GDDR6X, 285W TDP" },
  ],
  ram: [
    { id: "1", name: "32GB DDR5 6000MHz (2x16GB)", price: 12999, compatibility: "good", specs: "CL30, RGB" },
    { id: "2", name: "64GB DDR5 5600MHz (2x32GB)", price: 24999, compatibility: "good", specs: "CL36, Non-RGB" },
    { id: "3", name: "16GB DDR4 3200MHz (2x8GB)", price: 4999, compatibility: "error", specs: "CL16, RGB" },
  ],
};

export const ComponentSelector = ({ label, icon, selectedComponent, onSelect }: ComponentSelectorProps) => {
  const [selected, setSelected] = useState(selectedComponent);
  const components = mockComponents.cpu; // Default to CPU, you can make this dynamic

  const getCompatibilityIcon = (compatibility: string) => {
    switch (compatibility) {
      case "good":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getCompatibilityBadge = (compatibility: string) => {
    switch (compatibility) {
      case "good":
        return <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">Compatible</Badge>;
      case "warning":
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Check PSU</Badge>;
      case "error":
        return <Badge variant="destructive">Incompatible</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3 hover:border-primary/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon || <Cpu className="w-5 h-5 text-primary" />}
          <h4 className="font-semibold text-foreground">{label}</h4>
        </div>
        {selected && getCompatibilityIcon(selected.compatibility)}
      </div>

      <Select onValueChange={(value) => {
        const component = components.find(c => c.id === value);
        if (component) {
          setSelected(component);
          onSelect(component);
        }
      }}>
        <SelectTrigger>
          <SelectValue placeholder={`Select ${label}`} />
        </SelectTrigger>
        <SelectContent>
          {components.map((component) => (
            <SelectItem key={component.id} value={component.id}>
              <div className="flex items-center justify-between w-full">
                <span>{component.name}</span>
                <span className="ml-4 text-muted-foreground">₹{component.price.toLocaleString("en-IN")}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selected && (
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            {getCompatibilityBadge(selected.compatibility)}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Info className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-semibold">{selected.name}</h4>
                  <p className="text-sm text-muted-foreground">{selected.specs}</p>
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium">Price: ₹{selected.price.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="w-3 h-3" />
            Swap
          </Button>
        </div>
      )}
    </div>
  );
};
