import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Separator } from "./ui/separator";
import { formatPrice } from "@/lib/utils";

interface MiniCartProps {
  items: any[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity: (id: number, quantity: number) => void;
}

const MiniCart = ({ items, isOpen, onClose, onUpdateQuantity }: MiniCartProps) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-bold flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-primary" />
              Shopping Cart
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"} in your cart
          </p>
        </SheetHeader>

        <Separator />

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">Your cart is empty</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add some products to get started!
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="glass-panel rounded-lg p-4 space-y-3">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-20 h-20 rounded-lg bg-muted/30 flex-shrink-0 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      {item.brand}
                    </p>
                    <h4 className="font-medium text-sm line-clamp-2 mt-1">
                      {item.name}
                    </h4>
                    <p className="text-lg font-bold text-primary mt-2">
                      ₹{formatPrice(item.price)}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full flex-shrink-0"
                    onClick={() => onUpdateQuantity(item.id, 0)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Quantity</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Summary */}
        {items.length > 0 && (
          <>
            <Separator />
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium text-primary">Free</span>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">₹{formatPrice(total)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button className="w-full glow-blue" size="lg">
                  Proceed to Checkout
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={onClose}
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default MiniCart;
