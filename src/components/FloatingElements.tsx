import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  MessageCircle,
  X,
  Send,
  Tag,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Minus,
  User,
  Mail,
  Phone,
  Cpu,
  Monitor,
  Gamepad2,
  Laptop,
  Headphones,
  Loader2,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Ad {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  backgroundColor: string | null;
  textColor: string | null;
  accentColor: string | null;
  buttonText: string | null;
  link: string;
  couponCode?: string;
}

// Fallback offers if no ads in database
const fallbackOffers: Ad[] = [
  {
    id: "fallback-1",
    title: "RTX 4070 Ti Super",
    description: "Limited stock - Premium gaming GPU",
    imageUrl: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=200&q=80",
    backgroundColor: null,
    textColor: "#ffffff",
    accentColor: "#22c55e",
    buttonText: "View Deal",
    link: "/products",
    couponCode: "25% OFF",
  },
  {
    id: "fallback-2",
    title: "Gaming PC Build",
    description: "Complete RGB setup with RTX 4080",
    imageUrl: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=200&q=80",
    backgroundColor: null,
    textColor: "#ffffff",
    accentColor: "#22c55e",
    buttonText: "Explore",
    link: "/prebuilt-pcs",
    couponCode: "30% OFF",
  },
  {
    id: "fallback-3",
    title: "Mechanical Keyboard",
    description: "Cherry MX switches, RGB backlit",
    imageUrl: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=200&q=80",
    backgroundColor: null,
    textColor: "#ffffff",
    accentColor: "#22c55e",
    buttonText: "Shop Now",
    link: "/products",
    couponCode: "40% OFF",
  },
];

// Chat quick options
const chatCategories = [
  { icon: Gamepad2, label: "Gaming PC" },
  { icon: Laptop, label: "Laptop" },
  { icon: Cpu, label: "Graphics Card" },
  { icon: Monitor, label: "Monitor" },
  { icon: Headphones, label: "Accessories" },
];

interface ChatMessage {
  type: "bot" | "user";
  content: string;
  options?: typeof chatCategories;
}

const FloatingElements = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [showOffer, setShowOffer] = useState(true);
  const [offerMinimized, setOfferMinimized] = useState(false);
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [ads, setAds] = useState<Ad[]>([]);

  // Chat state
  const [chatStep, setChatStep] = useState(0);
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { type: "bot", content: "Welcome to SCB Expert Support! I'm here to help you find the perfect tech." },
  ]);

  // Fetch ads from database
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await fetch("/api/public/ads?page=home");
        const data = await res.json();
        if (data.ads?.length > 0) {
          setAds(data.ads);
        }
      } catch (error) {
        console.error("Error fetching ads:", error);
      }
    };

    fetchAds();
  }, []);

  // Use database ads or fallback
  const liveOffers = ads.length > 0 ? ads : fallbackOffers;

  // Auto-rotate offers
  useEffect(() => {
    if (isPaused || offerMinimized || !showOffer || liveOffers.length === 0) return;
    const interval = setInterval(() => {
      setCurrentOfferIndex((prev) => (prev + 1) % liveOffers.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, offerMinimized, showOffer, liveOffers.length]);

  // Reset index if it exceeds offers length
  useEffect(() => {
    if (currentOfferIndex >= liveOffers.length) {
      setCurrentOfferIndex(0);
    }
  }, [liveOffers.length, currentOfferIndex]);

  const currentOffer = liveOffers[currentOfferIndex];

  // Track ad click
  const handleAdClick = async (adId: string) => {
    try {
      await fetch(`/api/admin/ads/${adId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "click" }),
      });
    } catch (error) {
      // Silent fail
    }
  };

  // Chat handlers
  const handleSendMessage = useCallback(() => {
    if (!inputValue.trim()) return;

    const newMessages = [...messages, { type: "user" as const, content: inputValue }];
    setMessages(newMessages);
    setInputValue("");

    setTimeout(() => {
      if (chatStep === 0) {
        setUserName(inputValue);
        setChatStep(1);
        setMessages([
          ...newMessages,
          { type: "bot", content: `Nice to meet you, ${inputValue}! Could you share your phone number so we can assist you better?` },
        ]);
      } else if (chatStep === 1) {
        setUserPhone(inputValue);
        setChatStep(2);
        setMessages([
          ...newMessages,
          { type: "bot", content: "Great! And your email address please?" },
        ]);
      } else if (chatStep === 2) {
        setUserEmail(inputValue);
        setChatStep(3);
        setMessages([
          ...newMessages,
          {
            type: "bot",
            content: `Thanks ${userName}! What are you looking for today?`,
            options: chatCategories,
          },
        ]);
      }
    }, 500);
  }, [inputValue, messages, chatStep, userName]);

  const handleCategorySelect = async (category: string) => {
    setMessages([
      ...messages,
      { type: "user", content: category },
    ]);

    // Submit inquiry to API
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "CHAT_WEB",
          name: userName,
          mobile: userPhone,
          email: userEmail || null,
          requirement: `Looking for: ${category}`,
          source: "Chat Widget",
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            content: `Excellent choice! Our experts will contact you shortly about ${category}. You can also browse our ${category} collection on the store.`,
          },
        ]);
        toast.success("Inquiry submitted! We'll contact you soon.");
      } else {
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            content: `Thank you for your interest in ${category}! Our team will get back to you soon.`,
          },
        ]);
      }
    } catch (error) {
      console.error("Error submitting chat inquiry:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content: `Thank you for your interest in ${category}! Our team will reach out to you shortly.`,
        },
      ]);
    }

    setChatStep(4);
  };

  const startChat = () => {
    setChatOpen(true);
    if (chatStep === 0) {
      setTimeout(() => {
        setMessages([
          { type: "bot", content: "Welcome to SCB Expert Support! I'm here to help you find the perfect tech." },
          { type: "bot", content: "May I know your name?" },
        ]);
      }, 300);
    }
  };

  return (
    <>
      {/* Live Offers Widget - Bottom Left */}
      {showOffer && (
        <div
          className="fixed bottom-6 left-6 z-40"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {offerMinimized ? (
            // Minimized State - Compact Pill
            <button
              onClick={() => setOfferMinimized(false)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300",
                "bg-card border border-border shadow-lg hover:shadow-xl",
                "text-foreground hover:border-primary/50"
              )}
            >
              <Tag className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Live Offers</span>
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-destructive text-[10px] font-bold text-white">
                {liveOffers.length}
              </span>
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            </button>
          ) : (
            // Expanded State - Full Card
            <div
              className={cn(
                "w-80 rounded-xl overflow-hidden transition-all duration-300",
                "bg-card border border-border shadow-xl",
                "dark:bg-card"
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Live Offers</span>
                  <span className="px-1.5 py-0.5 rounded bg-destructive text-[10px] font-bold text-white">
                    {currentOfferIndex + 1}/{liveOffers.length}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setOfferMinimized(true)}
                    className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowOffer(false)}
                    className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Offer Content */}
              <div className="p-4">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                    {currentOffer.imageUrl ? (
                      <img
                        src={currentOffer.imageUrl}
                        alt={currentOffer.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: currentOffer.backgroundColor || "#1a1a2e" }}
                      >
                        <Tag className="w-8 h-8 text-primary" />
                      </div>
                    )}
                    {currentOffer.couponCode && (
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-destructive text-[10px] font-bold text-white">
                        {currentOffer.couponCode}
                      </div>
                    )}
                  </div>

                  {/* Offer Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-foreground truncate">
                      {currentOffer.title}
                    </h4>
                    {currentOffer.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {currentOffer.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* CTA Button */}
                <Link href={currentOffer.link}>
                  <Button
                    size="sm"
                    className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => handleAdClick(currentOffer.id)}
                  >
                    {currentOffer.buttonText || "View Deal"}
                    <ExternalLink className="w-3.5 h-3.5 ml-2" />
                  </Button>
                </Link>
              </div>

              {/* Dots Indicator */}
              <div className="flex justify-center gap-1.5 pb-3">
                {liveOffers.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentOfferIndex(idx)}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      currentOfferIndex === idx
                        ? "w-4 bg-primary"
                        : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Live Chat Widget - Bottom Right */}
      <div className="fixed bottom-6 right-6 z-40">
        {chatOpen ? (
          <div
            className={cn(
              "w-96 rounded-2xl overflow-hidden shadow-2xl",
              "bg-card border border-border",
              "animate-in slide-in-from-bottom-4 duration-300"
            )}
          >
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-primary to-secondary p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">SCB Expert Support</h3>
                  <p className="text-white/70 text-xs">Typically replies in minutes</p>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-4 bg-muted/30">
              {messages.map((msg, idx) => (
                <div key={idx}>
                  {msg.type === "bot" ? (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-card border border-border rounded-2xl rounded-tl-sm p-3 text-sm text-foreground">
                          {msg.content}
                        </div>
                        {msg.options && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {msg.options.map((opt) => (
                              <button
                                key={opt.label}
                                onClick={() => handleCategorySelect(opt.label)}
                                className={cn(
                                  "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                                  "bg-card border border-border hover:border-primary hover:bg-primary/5",
                                  "text-foreground"
                                )}
                              >
                                <opt.icon className="w-4 h-4 text-primary" />
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm p-3 text-sm max-w-[80%]">
                        {msg.content}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  {chatStep === 1 && (
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  )}
                  {chatStep === 2 && (
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  )}
                  {chatStep === 0 && (
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  )}
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder={
                      chatStep === 0
                        ? "Enter your name..."
                        : chatStep === 1
                        ? "Enter phone number..."
                        : chatStep === 2
                        ? "Enter email..."
                        : "Type a message..."
                    }
                    className={cn(
                      "bg-muted/50 border-border text-foreground",
                      (chatStep === 0 || chatStep === 1 || chatStep === 2) && "pl-10"
                    )}
                    disabled={chatStep === 3 || chatStep === 4}
                  />
                </div>
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={chatStep === 3 || chatStep === 4 || !inputValue.trim()}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Button
            size="lg"
            onClick={startChat}
            className={cn(
              "rounded-full h-14 w-14 shadow-xl",
              "bg-gradient-to-r from-primary to-secondary hover:opacity-90",
              "transition-transform hover:scale-105"
            )}
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </Button>
        )}
      </div>
    </>
  );
};

export default FloatingElements;
