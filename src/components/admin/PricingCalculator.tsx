import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, Zap } from "lucide-react";

interface PricingCalculatorProps {
  components: {
    cpu?: number;
    gpu?: number;
    ram?: number;
    motherboard?: number;
    storage?: number;
    psu?: number;
    cabinet?: number;
    cooling?: number;
  };
}

export const PricingCalculator = ({ components }: PricingCalculatorProps) => {
  const componentPrices = {
    cpu: components.cpu || 0,
    gpu: components.gpu || 0,
    ram: components.ram || 0,
    motherboard: components.motherboard || 0,
    storage: components.storage || 0,
    psu: components.psu || 0,
    cabinet: components.cabinet || 0,
    cooling: components.cooling || 0,
  };

  const subtotal = Object.values(componentPrices).reduce((sum, price) => sum + price, 0);
  const discount = 0; // Can be made dynamic
  const total = subtotal - discount;
  const margin = subtotal > 0 ? Math.round((discount / subtotal) * 100) : 0;

  // Mock power consumption (can be calculated based on actual components)
  const powerConsumption = 650;

  // Mock performance rating
  const performanceRating = 4.5;

  return (
    <Card className="p-6 space-y-6 sticky top-20">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Pricing Calculator
        </h3>

        {/* Component Breakdown */}
        <div className="space-y-3">
          {Object.entries(componentPrices).map(([key, price]) => (
            price > 0 && (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground capitalize">{key}</span>
                <span className="font-medium">₹{price.toLocaleString("en-IN")}</span>
              </div>
            )
          ))}
        </div>

        <Separator className="my-4" />

        {/* Subtotal */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-semibold">₹{subtotal.toLocaleString("en-IN")}</span>
        </div>

        {/* Discount */}
        <div className="mt-3">
          <Label className="text-sm">Discount Amount</Label>
          <Input
            type="number"
            placeholder="0"
            className="mt-1.5"
          />
        </div>

        <Separator className="my-4" />

        {/* Total */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-foreground">Final Price</span>
          <span className="text-2xl font-bold text-primary">
            ₹{total.toLocaleString("en-IN")}
          </span>
        </div>

        {/* Margin */}
        {margin > 0 && (
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-muted-foreground">Margin</span>
            <Badge variant="secondary">{margin}%</Badge>
          </div>
        )}
      </div>

      <Separator />

      {/* Performance Rating */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Performance Rating</span>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(performanceRating)
                    ? "fill-yellow-500 text-yellow-500"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Power Consumption */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-foreground">Power Draw</span>
          </div>
          <Badge variant="outline">{powerConsumption}W</Badge>
        </div>

        {/* Recommended PSU */}
        <div className="rounded-lg bg-muted/50 p-3 mt-2">
          <p className="text-xs text-muted-foreground">Recommended PSU</p>
          <p className="text-sm font-medium text-foreground mt-1">
            {Math.ceil(powerConsumption / 100) * 100 + 150}W or higher
          </p>
        </div>
      </div>

      <Separator />

      {/* Build Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-primary/5 p-3 border border-primary/10">
          <p className="text-xs text-muted-foreground">Gaming Score</p>
          <p className="text-xl font-bold text-primary mt-1">95/100</p>
        </div>
        <div className="rounded-lg bg-primary/5 p-3 border border-primary/10">
          <p className="text-xs text-muted-foreground">Value Score</p>
          <p className="text-xl font-bold text-primary mt-1">88/100</p>
        </div>
      </div>
    </Card>
  );
};
