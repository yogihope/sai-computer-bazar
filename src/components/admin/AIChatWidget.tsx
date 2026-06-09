"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  Send,
  ImagePlus,
  Bot,
  User,
  CheckCircle2,
  Loader2,
  Package,
  Tags,
  ChevronDown,
  Trash2,
  FolderPlus,
  ShoppingBag,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// ─────────────────────── Types ────────────────────────

type Message = { role: "user" | "assistant"; content: string; imageUrls?: string[] };
type ImageItem = { file: File; objectUrl: string };

type ProductData = {
  __action__: "CREATE_PRODUCT";
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  sku: string;
  brand: string;
  model: string;
  price: number;
  upiPrice: number;
  creditCardPrice: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  isInStock: boolean;
  primaryCategoryId: string;
  tags: string[];
  badges: string[];
  specs: { key: string; value: string }[];
  warrantyTitle: string;
  warrantySubtitle: string;
  deliveryTitle: string;
  deliverySubtitle: string;
  returnsTitle: string;
  returnsSubtitle: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
};

type CategoryData = {
  __action__: "CREATE_CATEGORY";
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  displayOrder: number;
  isVisible: boolean;
  isFeatured: boolean;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogTitle: string;
  ogDescription: string;
  twitterTitle: string;
  twitterDescription: string;
};

type PendingAction =
  | { type: "product"; data: ProductData }
  | { type: "category"; data: CategoryData };

type PageContext = "products" | "categories";

// ─────────────────────── Config per context ────────────

const CONFIG: Record<
  PageContext,
  {
    storageKey: string;
    greeting: string;
    placeholder: string;
    headerLabel: string;
    headerIcon: typeof Package;
    headerBg: string;
  }
> = {
  products: {
    storageKey: "scb_ai_chat_products",
    greeting:
      "Namaste! Main Product Assistant hoon. 🛍\n\nProduct ka naam, brand, model aur price batao — main poori listing (title, description, specs, SEO, pricing) khud bana dunga.",
    placeholder: "Product naam aur price batao…",
    headerLabel: "Product Assistant",
    headerIcon: ShoppingBag,
    headerBg: "bg-blue-600",
  },
  categories: {
    storageKey: "scb_ai_chat_categories",
    greeting:
      "Namaste! Main Category Assistant hoon. 📂\n\nKaunsi category add karni hai? Naam batao — main parent, description, aur SEO sab handle kar lunga.\n\nCategory ke liye ek photo bhi upload kar sakte ho (image icon se).",
    placeholder: "e.g. Gaming Accessories",
    headerLabel: "Category Assistant",
    headerIcon: FolderPlus,
    headerBg: "bg-emerald-600",
  },
};

// ─────────────────────── Helpers ──────────────────────

function fmt(n: number) {
  return "₹" + Number(n).toLocaleString("en-IN");
}

function dispatchDataUpdated(type: "product" | "category") {
  window.dispatchEvent(
    new CustomEvent("scb:admin-data-updated", { detail: { type } })
  );
}

function loadMessages(key: string, defaultMsg: Message): Message[] {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved) as Message[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return [defaultMsg];
}

// ─────────────────────── Widget ───────────────────────

export function AIChatWidget() {
  const pathname = usePathname();

  // Only show on products or categories pages
  const pageContext: PageContext | null = pathname.includes("/admin/categories")
    ? "categories"
    : pathname.includes("/admin/products")
    ? "products"
    : null;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep a ref to the current storage key so the save effect never goes stale
  const storageKeyRef = useRef<string>("");

  // ── When pageContext changes, load the right chat history ──
  useEffect(() => {
    if (!pageContext) return;
    const cfg = CONFIG[pageContext];
    storageKeyRef.current = cfg.storageKey;
    const defaultMsg: Message = { role: "assistant", content: cfg.greeting };
    setMessages(loadMessages(cfg.storageKey, defaultMsg));
    // Reset transient UI state
    setPending(null);
    setImages([]);
    setInput("");
  }, [pageContext]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Save messages to the current context's key ──
  useEffect(() => {
    if (!storageKeyRef.current || messages.length === 0) return;
    try {
      // Strip imageUrls before saving — blob URLs expire on reload
      localStorage.setItem(storageKeyRef.current, JSON.stringify(messages.map(({ imageUrls: _, ...m }) => m)));
    } catch { /* quota full */ }
  }, [messages]);

  // ── Fetch category names for preview display ──
  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => {
        const map: Record<string, string> = {};
        for (const cat of d.categories ?? []) {
          map[cat.id] = cat.parent ? `${cat.parent.name} → ${cat.name}` : cat.name;
        }
        setCategoryMap(map);
      })
      .catch(() => {});
  }, []);

  // ── Scroll to latest message ──
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, pending]);

  // ── Clear chat for current context ──
  const handleClear = () => {
    if (!pageContext) return;
    const defaultMsg: Message = { role: "assistant", content: CONFIG[pageContext].greeting };
    const fresh = [defaultMsg];
    setMessages(fresh);
    setPending(null);
    setImages([]);
    setInput("");
  };

  // ── Send message ──
  const handleSend = async () => {
    const trimmed = input.trim();
    if ((!trimmed && images.length === 0) || isLoading || isCreating || !pageContext) return;

    // Capture current image object URLs for display in the chat bubble
    const capturedImageUrls = images.map((i) => i.objectUrl);

    // Build display message (shown in chat) — text only or "📷 Photo" if no text
    const displayContent = trimmed || "📷 Photo bhej raha hoon…";

    // Build API message — append image note so AI knows photos are attached
    let apiContent = trimmed;
    if (images.length > 0) {
      const imgLabel = pageContext === "categories" ? "category thumbnail" : "product image(s)";
      const note = `[📷 Attached: ${images.length} ${imgLabel} — will upload on confirmation]`;
      apiContent = trimmed ? `${trimmed}\n${note}` : note;
    }

    const userMsg: Message = {
      role: "user",
      content: displayContent,
      ...(capturedImageUrls.length > 0 && { imageUrls: capturedImageUrls }),
    };
    // Send the API version (with note) to the backend, display version to UI
    const apiMsg = { role: "user", content: apiContent };
    const newMessages = [...messages, userMsg];
    const apiMessages = [...messages.map(({ imageUrls: _, ...m }) => m), apiMsg];

    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, pageContext }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.error ?? "Kuch gadbad ho gayi. Dobara try karo." },
        ]);
        return;
      }

      if (data.action === "CREATE_PRODUCT" && data.actionData) {
        setPending({ type: "product", data: data.actionData as ProductData });
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Product ready hai! Neeche preview check karo — sab theek lage to Confirm karo.",
          },
        ]);
      } else if (data.action === "CREATE_CATEGORY" && data.actionData) {
        setPending({ type: "category", data: data.actionData as CategoryData });
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Category ready hai! Neeche check karo aur Confirm karo.",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.message },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Network error. Dobara try karo." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Image select ──
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setImages((prev) => {
      // Categories: only 1 image allowed
      if (pageContext === "categories") {
        if (prev.length > 0) URL.revokeObjectURL(prev[0].objectUrl);
        const f = files[0];
        return f ? [{ file: f, objectUrl: URL.createObjectURL(f) }] : prev;
      }
      return [...prev, ...files.map((f) => ({ file: f, objectUrl: URL.createObjectURL(f) }))];
    });
    e.target.value = "";
  };

  const removeImage = useCallback((i: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[i].objectUrl);
      return prev.filter((_, idx) => idx !== i);
    });
  }, []);

  // ── Discard pending ──
  const handleDiscard = () => {
    setPending(null);
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "Cancel kar diya. Kuch aur batao?" },
    ]);
  };

  // ── Confirm & Create ──
  const handleConfirm = async () => {
    if (!pending) return;
    setIsCreating(true);

    try {
      if (pending.type === "product") {
        // Upload images ONLY on confirm
        const uploadedImages: {
          url: string;
          alt: string;
          isPrimary: boolean;
          sortOrder: number;
        }[] = [];

        for (let i = 0; i < images.length; i++) {
          const fd = new FormData();
          fd.append("file", images[i].file);
          fd.append("folder", "products");
          const up = await fetch("/api/admin/upload", { method: "POST", body: fd });
          if (up.ok) {
            const { url } = await up.json();
            uploadedImages.push({ url, alt: pending.data.name, isPrimary: i === 0, sortOrder: i });
          }
        }

        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...pending.data,
            images: uploadedImages,
            status: "DRAFT",
            visibility: "PUBLIC",
          }),
        });

        const result = await res.json();
        if (!res.ok) {
          toast({ title: "Error", description: result.error ?? "Product create nahi hua", variant: "destructive" });
          return;
        }

        const name = pending.data.name;
        const id = result.product?.id;
        setPending(null);
        setImages([]);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `✅ "${name}" product list mein add ho gaya (Draft)!${id ? `\nEdit karne ke liye: /admin/products/edit/${id}` : ""}\n\nAur koi product add karna hai?`,
          },
        ]);
        toast({ title: "Product Created!", description: name });
        dispatchDataUpdated("product");
      } else {
        // Upload category image first (if provided)
        let imageUrl: string | undefined;
        if (images[0]) {
          const fd = new FormData();
          fd.append("file", images[0].file);
          fd.append("folder", "categories");
          const up = await fetch("/api/admin/upload", { method: "POST", body: fd });
          if (up.ok) {
            const result = await up.json();
            imageUrl = result.url;
          }
        }

        // Create category
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...pending.data,
            ...(imageUrl && { imageUrl, imageAlt: pending.data.name }),
            // Auto-fill OG/Twitter from SEO fields if AI didn't set them
            ogTitle: pending.data.ogTitle || pending.data.seoTitle,
            ogDescription: pending.data.ogDescription || pending.data.seoDescription,
            twitterTitle: pending.data.twitterTitle || pending.data.seoTitle,
            twitterDescription: pending.data.twitterDescription || pending.data.seoDescription,
          }),
        });

        const result = await res.json();
        if (!res.ok) {
          toast({ title: "Error", description: result.error ?? "Category create nahi hui", variant: "destructive" });
          return;
        }

        const name = pending.data.name;
        setPending(null);
        setImages([]);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `✅ "${name}" category list mein add ho gayi!${imageUrl ? " Photo bhi upload ho gayi! 🖼" : ""}\n\nAur koi category banana hai?`,
          },
        ]);
        toast({ title: "Category Created!", description: name });
        dispatchDataUpdated("category");
      }
    } catch {
      toast({ title: "Error", description: "Create nahi ho saka. Network check karo.", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  // Don't render on non-product/category pages
  if (!pageContext) return null;

  const cfg = CONFIG[pageContext];
  const HeaderIcon = cfg.headerIcon;

  // ─────────── Render ────────────
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* ── Chat panel ── */}
      {isOpen && (
        <div
          className="mb-3 w-[390px] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ height: "560px" }}
        >
          {/* Header */}
          <div className={cn("px-4 py-2.5 text-white flex items-center justify-between shrink-0", cfg.headerBg)}>
            <div className="flex items-center gap-2">
              <HeaderIcon className="w-4 h-4" />
              <span className="font-semibold text-sm">{cfg.headerLabel}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleClear}
                className="p-1 rounded hover:bg-white/20 transition-colors"
                title="New chat"
              >
                <Trash2 className="w-3.5 h-3.5 opacity-80" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-white/20 transition-colors ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 px-3 py-3">
            <div className="space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn("flex gap-2", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
                >
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
                      msg.role === "assistant"
                        ? cn("text-white", cfg.headerBg)
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {msg.role === "assistant" ? (
                      <Bot className="w-3.5 h-3.5" />
                    ) : (
                      <User className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "rounded-2xl px-3 py-2 text-[13px] leading-relaxed max-w-[82%] break-words whitespace-pre-wrap",
                      msg.role === "assistant"
                        ? "bg-muted text-foreground rounded-tl-sm"
                        : "bg-primary text-primary-foreground rounded-tr-sm"
                    )}
                  >
                    {msg.content}
                    {msg.imageUrls && msg.imageUrls.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap mt-2">
                        {msg.imageUrls.map((url, j) => (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img key={j} src={url} alt="" className="w-16 h-16 rounded-lg object-cover border border-white/20" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2">
                  <div className={cn("w-7 h-7 rounded-full text-white flex items-center justify-center shrink-0", cfg.headerBg)}>
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm px-3 py-2 bg-muted text-muted-foreground text-[13px] flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Soch raha hoon…
                  </div>
                </div>
              )}

              {/* ── Preview card ── */}
              {pending && (
                <div className="rounded-2xl border-2 border-border bg-muted/40 p-3 space-y-2.5 text-[13px]">
                  {pending.type === "product" ? (
                    <>
                      <div className="flex items-center gap-1.5 font-semibold text-blue-600 text-xs uppercase tracking-wide">
                        <Package className="w-3.5 h-3.5" />
                        New Product Preview
                      </div>

                      <div className="font-semibold text-foreground text-sm leading-snug">
                        {pending.data.name}
                      </div>

                      <div className="space-y-1 text-muted-foreground">
                        <div>
                          <span className="font-semibold text-foreground text-base">
                            {fmt(pending.data.price)}
                          </span>
                          <span className="text-xs ml-2">
                            UPI {fmt(pending.data.upiPrice)} · CC {fmt(pending.data.creditCardPrice)}
                          </span>
                        </div>

                        {pending.data.primaryCategoryId && (
                          <div className="text-xs flex items-center gap-1">
                            📂 {categoryMap[pending.data.primaryCategoryId] ?? pending.data.primaryCategoryId}
                          </div>
                        )}

                        {(pending.data.brand || pending.data.model) && (
                          <div className="text-xs">
                            🏷 {[pending.data.brand, pending.data.model].filter(Boolean).join(" ")}
                          </div>
                        )}

                        <div className="text-xs">📦 Stock: {pending.data.stockQuantity} units</div>

                        {pending.data.specs?.length > 0 && (
                          <div className="mt-1.5 space-y-0.5 border-t border-border pt-1.5">
                            {pending.data.specs.slice(0, 5).map((s, i) => (
                              <div key={i} className="flex gap-1.5 text-xs">
                                <span className="text-muted-foreground min-w-[90px]">{s.key}</span>
                                <span className="text-foreground">{s.value}</span>
                              </div>
                            ))}
                            {pending.data.specs.length > 5 && (
                              <div className="text-xs text-muted-foreground">
                                +{pending.data.specs.length - 5} more specs
                              </div>
                            )}
                          </div>
                        )}

                        {pending.data.seoTitle && (
                          <div className="text-xs border-t border-border pt-1.5 space-y-0.5">
                            <div className="text-muted-foreground">
                              SEO Title ({pending.data.seoTitle.length} chars):{" "}
                              <span className={cn(pending.data.seoTitle.length >= 50 && pending.data.seoTitle.length <= 60 ? "text-green-600" : "text-orange-500")}>
                                {pending.data.seoTitle}
                              </span>
                            </div>
                            <div className="text-muted-foreground">
                              SEO Desc ({pending.data.seoDescription?.length ?? 0} chars)
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Image thumbnails */}
                      {images.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap pt-0.5">
                          {images.map((img, i) => (
                            <div key={i} className="relative w-10 h-10 rounded-lg overflow-hidden border group">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={img.objectUrl} alt="" className="w-full h-full object-cover" />
                              <button
                                onClick={() => removeImage(i)}
                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center"
                              >
                                <X className="w-3 h-3 text-white" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-10 h-10 rounded-lg border-2 border-dashed flex items-center justify-center hover:bg-muted text-muted-foreground"
                          >
                            <ImagePlus className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5 font-semibold text-emerald-600 text-xs uppercase tracking-wide">
                        <Tags className="w-3.5 h-3.5" />
                        Nई Category — Confirm karne se pehle check karo
                      </div>

                      {/* Name */}
                      <div>
                        <div className="text-[11px] text-muted-foreground uppercase tracking-wide mb-0.5">Category Name</div>
                        <div className="font-semibold text-foreground">{pending.data.name}</div>
                      </div>

                      {/* URL slug */}
                      <div>
                        <div className="text-[11px] text-muted-foreground uppercase tracking-wide mb-0.5">URL</div>
                        <div className="text-xs text-foreground/80 font-mono">/category/{pending.data.slug}</div>
                      </div>

                      {/* Parent */}
                      <div>
                        <div className="text-[11px] text-muted-foreground uppercase tracking-wide mb-0.5">Position</div>
                        <div className="text-xs text-foreground/80">
                          {pending.data.parentId
                            ? `📂 ${categoryMap[pending.data.parentId] ?? pending.data.parentId} ke andar`
                            : "📂 Top-level (root category)"}
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex gap-3">
                        <div>
                          <div className="text-[11px] text-muted-foreground uppercase tracking-wide mb-0.5">Visible</div>
                          <div className={cn("text-xs font-medium", pending.data.isVisible ? "text-green-600" : "text-red-500")}>
                            {pending.data.isVisible ? "✅ Haan" : "❌ Nahi"}
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] text-muted-foreground uppercase tracking-wide mb-0.5">Featured</div>
                          <div className={cn("text-xs font-medium", pending.data.isFeatured ? "text-amber-500" : "text-muted-foreground")}>
                            {pending.data.isFeatured ? "⭐ Haan" : "— Nahi"}
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] text-muted-foreground uppercase tracking-wide mb-0.5">Order</div>
                          <div className="text-xs text-foreground/80">{pending.data.displayOrder}</div>
                        </div>
                      </div>

                      {/* Description */}
                      {pending.data.description && (
                        <div>
                          <div className="text-[11px] text-muted-foreground uppercase tracking-wide mb-0.5">
                            Description ({pending.data.description.length} chars)
                          </div>
                          <div className="text-xs text-foreground/80 leading-relaxed line-clamp-3">
                            {pending.data.description}
                          </div>
                        </div>
                      )}

                      {/* SEO summary */}
                      {pending.data.seoTitle && (
                        <div className="border-t border-border pt-2 space-y-1">
                          <div className="text-[11px] text-muted-foreground uppercase tracking-wide">SEO</div>
                          <div className="text-xs space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", pending.data.seoTitle.length >= 50 && pending.data.seoTitle.length <= 60 ? "bg-green-500" : "bg-orange-400")} />
                              <span className="text-muted-foreground">Title</span>
                              <span className="text-foreground/70">{pending.data.seoTitle.length}/60 chars</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", (pending.data.seoDescription?.length ?? 0) >= 120 && (pending.data.seoDescription?.length ?? 0) <= 160 ? "bg-green-500" : "bg-orange-400")} />
                              <span className="text-muted-foreground">Description</span>
                              <span className="text-foreground/70">{pending.data.seoDescription?.length ?? 0}/160 chars</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", (pending.data.seoKeywords?.split(",").length ?? 0) >= 5 ? "bg-green-500" : "bg-orange-400")} />
                              <span className="text-muted-foreground">Keywords</span>
                              <span className="text-foreground/70">{pending.data.seoKeywords?.split(",").length ?? 0} keywords</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", images[0] ? "bg-green-500" : "bg-gray-300")} />
                              <span className="text-muted-foreground">Image</span>
                              <span className="text-foreground/70">{images[0] ? "✓ Ready" : "nahi di"}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Category image */}
                      <div className="border-t border-border pt-2">
                        <div className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1.5">
                          Category Image (optional)
                        </div>
                        {images[0] ? (
                          <div className="relative w-full h-20 rounded-lg overflow-hidden border group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={images[0].objectUrl} alt="" className="w-full h-full object-cover" />
                            <button
                              onClick={() => removeImage(0)}
                              className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3 text-white" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-10 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 text-xs text-muted-foreground hover:bg-muted transition-colors"
                          >
                            <ImagePlus className="w-3.5 h-3.5" />
                            Image upload karo (Confirm ke baad Cloudinary pe jayegi)
                          </button>
                        )}
                      </div>
                    </>
                  )}

                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-7 text-xs"
                      onClick={handleDiscard}
                      disabled={isCreating}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 h-7 text-xs gap-1"
                      onClick={handleConfirm}
                      disabled={isCreating}
                    >
                      {isCreating ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                      Confirm &amp; Create
                    </Button>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          </ScrollArea>

          {/* Image strip (when no pending card showing it already) */}
          {!pending && images.length > 0 && (
            <div className="px-3 py-2 border-t flex gap-1.5 flex-wrap bg-muted/30 shrink-0">
              {images.map((img, i) => (
                <div key={i} className="relative w-9 h-9 rounded-md overflow-hidden border group shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.objectUrl} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input area */}
          <div className="p-3 border-t shrink-0">
            <div className="flex gap-2 items-end">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple={pageContext === "products"}
                className="hidden"
                onChange={handleImageSelect}
              />

              {/* Image upload button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg border hover:bg-muted transition-colors shrink-0"
                title={
                  pageContext === "categories"
                    ? "Category image upload karo (1 image, Confirm ke baad upload hogi)"
                    : "Product images add karo (Confirm ke baad upload hongi)"
                }
              >
                <ImagePlus className="w-4 h-4 text-muted-foreground" />
              </button>

              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={pending ? "Kuch badalna hai? Batao…" : cfg.placeholder}
                className="resize-none text-[13px] min-h-[38px] max-h-24 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none]"
                rows={1}
                disabled={isLoading || isCreating}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />

              <Button
                size="icon"
                className="shrink-0 h-9 w-9"
                onClick={handleSend}
                disabled={isLoading || isCreating || (!input.trim() && images.length === 0)}
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>

            {images.length === 0 && !pending && (
              <p className="text-[11px] text-muted-foreground mt-1 text-center">
                {pageContext === "categories"
                  ? "Category image Confirm ke baad upload hogi"
                  : "Product images Confirm ke baad upload hongi"}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className={cn(
          "w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 text-white hover:scale-105 active:scale-95",
          cfg.headerBg
        )}
        title={cfg.headerLabel}
      >
        {isOpen ? (
          <ChevronDown className="w-6 h-6" />
        ) : (
          <HeaderIcon className="w-6 h-6" />
        )}
      </button>
    </div>
  );
}
