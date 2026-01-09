import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Edit, Copy, Archive, Trash2, ExternalLink } from "lucide-react";

interface ProductQuickViewProps {
  productId: string | null;
  onClose: () => void;
}

export function ProductQuickView({ productId, onClose }: ProductQuickViewProps) {
  if (!productId) return null;

  // Mock product data - in real app, fetch based on productId
  const product = {
    id: productId,
    name: "NVIDIA GeForce RTX 4090",
    sku: "GPU-RTX4090-24GB",
    category: "Graphics Cards",
    price: 159999,
    discountPrice: 149999,
    stock: 12,
    status: "Active",
    seoScore: 95,
    thumbnail: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&h=400&fit=crop",
    description: "The ultimate gaming GPU with 24GB GDDR6X memory, delivering unprecedented performance for 4K gaming and content creation.",
    specifications: [
      { key: "Memory", value: "24GB GDDR6X" },
      { key: "Boost Clock", value: "2.52 GHz" },
      { key: "CUDA Cores", value: "16384" },
      { key: "Power", value: "450W TDP" },
    ],
    badges: ["Best Seller", "New Arrival"],
    lastUpdated: "2025-01-15",
  };

  return (
    <Sheet open={!!productId} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Product Quick View</SheetTitle>
          <SheetDescription>View and manage product details</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Product Image */}
          <div className="aspect-square rounded-lg overflow-hidden border border-border">
            <img
              src={product.thumbnail}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div>
            <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
            <p className="text-sm text-muted-foreground font-mono mb-3">
              SKU: {product.sku}
            </p>
            
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-primary/10 text-primary border-primary/20">
                {product.status}
              </Badge>
              <Badge variant="outline">{product.category}</Badge>
              {product.badges.map((badge) => (
                <Badge key={badge} variant="outline" className="border-accent/30">
                  {badge}
                </Badge>
              ))}
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>

          <Separator />

          {/* Pricing */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Pricing</h4>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold">₹{product.discountPrice.toLocaleString("en-IN")}</span>
              <span className="text-lg text-muted-foreground line-through">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Stock */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Inventory</h4>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Stock Quantity</span>
              <span className="font-semibold">{product.stock} units</span>
            </div>
          </div>

          <Separator />

          {/* Specifications */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Specifications</h4>
            <div className="space-y-2">
              {product.specifications.map((spec) => (
                <div key={spec.key} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{spec.key}</span>
                  <span className="font-medium">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* SEO */}
          <div>
            <h4 className="text-sm font-semibold mb-3">SEO Performance</h4>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">SEO Score</span>
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-primary/20"
              >
                {product.seoScore}/100
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Meta Info */}
          <div className="text-xs text-muted-foreground">
            Last updated: {product.lastUpdated}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="gap-2">
              <Edit className="w-4 h-4" />
              Edit
            </Button>
            <Button variant="outline" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              View Live
            </Button>
            <Button variant="outline" className="gap-2">
              <Copy className="w-4 h-4" />
              Duplicate
            </Button>
            <Button variant="outline" className="gap-2">
              <Archive className="w-4 h-4" />
              Archive
            </Button>
          </div>

          <Button variant="destructive" className="w-full gap-2">
            <Trash2 className="w-4 h-4" />
            Delete Product
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
