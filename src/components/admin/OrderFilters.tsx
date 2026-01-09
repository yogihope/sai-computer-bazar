import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  X,
  Calendar as CalendarIcon,
  CreditCard,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCcw,
  Monitor,
  Cpu,
  ShoppingBag,
} from "lucide-react";
import { format } from "date-fns";

interface OrderFiltersProps {
  onClose: () => void;
}

export function OrderFilters({ onClose }: OrderFiltersProps) {
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  const paymentStatuses = [
    { id: "paid", label: "Paid", icon: CheckCircle2, color: "text-emerald-400" },
    { id: "pending", label: "Pending", icon: Clock, color: "text-amber-400" },
    { id: "failed", label: "Failed", icon: XCircle, color: "text-red-400" },
    { id: "cod", label: "COD", icon: CreditCard, color: "text-blue-400" },
    { id: "refunded", label: "Refunded", icon: RefreshCcw, color: "text-purple-400" },
  ];

  const orderStatuses = [
    { id: "processing", label: "Processing", icon: Clock, color: "text-blue-400" },
    { id: "building", label: "Build In Progress", icon: Cpu, color: "text-violet-400" },
    { id: "shipped", label: "Shipped", icon: Truck, color: "text-cyan-400" },
    { id: "delivered", label: "Delivered", icon: CheckCircle2, color: "text-emerald-400" },
    { id: "cancelled", label: "Cancelled", icon: XCircle, color: "text-red-400" },
    { id: "returned", label: "Returned", icon: RefreshCcw, color: "text-orange-400" },
  ];

  const orderTypes = [
    { id: "product", label: "Product Order", icon: ShoppingBag },
    { id: "prebuilt", label: "Prebuilt PC", icon: Monitor },
    { id: "custom", label: "Custom Build", icon: Cpu },
  ];

  const paymentMethods = [
    { id: "upi", label: "UPI" },
    { id: "card", label: "Credit/Debit Card" },
    { id: "cod", label: "Cash on Delivery" },
    { id: "emi", label: "EMI" },
    { id: "netbanking", label: "Net Banking" },
  ];

  const formatPrice = (price: number) => {
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L`;
    }
    return `₹${(price / 1000).toFixed(0)}K`;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between pb-4 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">Filter Orders</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto py-6 space-y-6">
        {/* Payment Status */}
        <div>
          <Label className="text-white font-medium mb-3 block">Payment Status</Label>
          <div className="space-y-2">
            {paymentStatuses.map((status) => (
              <label
                key={status.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-colors"
              >
                <Checkbox className="border-gray-600" />
                <status.icon className={`h-4 w-4 ${status.color}`} />
                <span className="text-gray-300">{status.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Order Status */}
        <div>
          <Label className="text-white font-medium mb-3 block">Order Status</Label>
          <div className="space-y-2">
            {orderStatuses.map((status) => (
              <label
                key={status.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-colors"
              >
                <Checkbox className="border-gray-600" />
                <status.icon className={`h-4 w-4 ${status.color}`} />
                <span className="text-gray-300">{status.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Order Type */}
        <div>
          <Label className="text-white font-medium mb-3 block">Order Type</Label>
          <div className="space-y-2">
            {orderTypes.map((type) => (
              <label
                key={type.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-colors"
              >
                <Checkbox className="border-gray-600" />
                <type.icon className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <Label className="text-white font-medium mb-3 block">Payment Method</Label>
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <label
                key={method.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-colors"
              >
                <Checkbox className="border-gray-600" />
                <span className="text-gray-300">{method.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <Label className="text-white font-medium mb-3 block">Order Amount Range</Label>
          <div className="px-2">
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={500000}
              min={0}
              step={5000}
              className="my-4"
            />
            <div className="flex justify-between text-sm">
              <span className="text-cyan-400 font-medium">{formatPrice(priceRange[0])}</span>
              <span className="text-cyan-400 font-medium">{formatPrice(priceRange[1])}</span>
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div>
          <Label className="text-white font-medium mb-3 block">Date Range</Label>
          <div className="grid grid-cols-2 gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left bg-[#0a0f1a] border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "PP") : "From"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#0a0f1a] border-gray-800">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  className="bg-[#0a0f1a]"
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left bg-[#0a0f1a] border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "PP") : "To"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#0a0f1a] border-gray-800">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                  className="bg-[#0a0f1a]"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-4 border-t border-gray-800 flex gap-3">
        <Button
          variant="outline"
          className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
          onClick={onClose}
        >
          Reset All
        </Button>
        <Button
          className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
          onClick={onClose}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
