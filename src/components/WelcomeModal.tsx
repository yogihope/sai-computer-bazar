"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Laptop,
  Box,
  Cpu,
  Monitor,
  Gamepad2,
  Headphones,
  X,
  Check,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
}

type Language = "en" | "hi" | "gu";

const translations = {
  en: {
    heading: "What do you want to buy today?",
    subheading: "Tell SCB what you're looking for and we'll show you the best deals.",
    categories: {
      laptop: "Laptop",
      cabinet: "Cabinet",
      processor: "Processor",
      gamingPc: "Gaming PC",
      monitor: "Monitor",
      accessories: "Accessories",
    },
    form: { name: "Your Name", email: "Email", phone: "Phone" },
    cta: "Show Me the Best Deals",
  },
  hi: {
    heading: "आज आप क्या खरीदना चाहते हैं?",
    subheading: "SCB को बताएं और हम आपको सबसे अच्छे सौदे दिखाएंगे।",
    categories: {
      laptop: "लैपटॉप",
      cabinet: "कैबिनेट",
      processor: "प्रोसेसर",
      gamingPc: "गेमिंग पीसी",
      monitor: "मॉनिटर",
      accessories: "एक्सेसरीज़",
    },
    form: { name: "आपका नाम", email: "ईमेल", phone: "फ़ोन" },
    cta: "बेहतरीन डील दिखाएं",
  },
  gu: {
    heading: "આજે તમે શું ખરીદવા માંગો છો?",
    subheading: "SCB ને કહો અને અમે તમને શ્રેષ્ઠ સોદા બતાવીશું.",
    categories: {
      laptop: "લેપટોપ",
      cabinet: "કેબિનેટ",
      processor: "પ્રોસેસર",
      gamingPc: "ગેમિંગ પીસી",
      monitor: "મોનિટર",
      accessories: "એસેસરીઝ",
    },
    form: { name: "તમારું નામ", email: "ઈમેલ", phone: "ફોન" },
    cta: "શ્રેષ્ઠ સોદા બતાવો",
  },
};

const languages: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "hi", label: "हिं" },
  { code: "gu", label: "ગુ" },
];

const sliderImages = [
  "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600&q=80",
  "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&q=80",
  "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&q=80",
  "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&q=80",
  "https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=600&q=80",
];

const WelcomeModal = ({ open, onClose }: WelcomeModalProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [language, setLanguage] = useState<Language>("en");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = translations[language];

  const categories = [
    { icon: Laptop, key: "laptop", label: t.categories.laptop },
    { icon: Box, key: "cabinet", label: t.categories.cabinet },
    { icon: Cpu, key: "processor", label: t.categories.processor },
    { icon: Gamepad2, key: "gamingPc", label: t.categories.gamingPc },
    { icon: Monitor, key: "monitor", label: t.categories.monitor },
    { icon: Headphones, key: "accessories", label: t.categories.accessories },
  ];

  // Image slider auto-rotation
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % sliderImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [open]);

  const handleSubmit = useCallback(async () => {
    if (!name.trim() || !phone.trim()) {
      toast.error("Please enter your name and phone number");
      return;
    }

    setIsSubmitting(true);
    try {
      const categoryLabel = categories.find((c) => c.key === selectedCategory)?.label || selectedCategory;

      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "MODAL_WEB",
          name: name.trim(),
          mobile: phone.trim(),
          email: email.trim() || null,
          requirement: categoryLabel ? `Looking for: ${categoryLabel}` : null,
          source: "Welcome Modal",
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Thank you! We'll contact you soon with the best deals.");
        onClose();
        // Reset form
        setName("");
        setEmail("");
        setPhone("");
        setSelectedCategory("");
      } else {
        toast.error(data.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [name, email, phone, selectedCategory, categories, onClose]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg lg:max-w-4xl p-0 overflow-hidden border-0 bg-transparent shadow-none gap-0 [&>button]:hidden max-h-[90vh] overflow-y-auto">
        <div
          className={cn(
            "relative flex flex-col lg:flex-row rounded-2xl overflow-hidden",
            "bg-[hsl(220,18%,97%)]",
            "dark:bg-[hsl(222,50%,4%)]",
            "border border-border",
            "shadow-2xl shadow-black/15 dark:shadow-black/50"
          )}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className={cn(
              "absolute top-2 right-2 sm:top-3 sm:right-3 z-50 p-1.5 rounded-full transition-all duration-200",
              "bg-black/5 hover:bg-black/10",
              "dark:bg-white/10 dark:hover:bg-white/20",
              "text-muted-foreground hover:text-foreground"
            )}
          >
            <X className="w-4 h-4" />
          </button>

          {/* Left Column - Form */}
          <div className="flex-1 lg:w-[60%] p-4 sm:p-6 lg:p-8">
            {/* Header Row: Title + Language */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
              <div className="flex-1 pr-8 sm:pr-0">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground leading-tight mb-1">
                  {t.heading}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t.subheading}
                </p>
              </div>

              {/* Language Selector */}
              <div className="flex gap-1 bg-muted p-1 rounded-lg self-start">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={cn(
                      "px-2 sm:px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-200",
                      language === lang.code
                        ? "bg-background text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Selection Grid - Responsive */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4 sm:mb-5">
              {categories.map(({ icon: Icon, key, label }) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={cn(
                    "relative flex items-center gap-2 sm:gap-2.5 p-2.5 sm:p-3 rounded-xl transition-all duration-200",
                    "border group",
                    selectedCategory === key
                      ? "bg-primary/10 border-primary shadow-sm shadow-primary/20"
                      : "bg-card border-border hover:border-primary/50 hover:shadow-sm"
                  )}
                >
                  {/* Check Indicator */}
                  {selectedCategory === key && (
                    <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-primary-foreground" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "p-1.5 sm:p-2 rounded-lg transition-all duration-200 flex-shrink-0",
                      selectedCategory === key
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground group-hover:text-primary"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <span
                    className={cn(
                      "text-xs sm:text-sm font-medium transition-colors truncate",
                      selectedCategory === key
                        ? "text-primary"
                        : "text-foreground"
                    )}
                  >
                    {label}
                  </span>
                </button>
              ))}
            </div>

            {/* Form Fields - Responsive */}
            <div className="grid grid-cols-1 gap-2.5 sm:gap-3 mb-4 sm:mb-5">
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.form.name}
                className={cn(
                  "h-10 px-3 text-sm rounded-lg",
                  "bg-card border-border",
                  "text-foreground placeholder:text-muted-foreground",
                  "focus:border-primary focus:ring-1 focus:ring-primary/20"
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.form.email}
                  className={cn(
                    "h-10 px-3 text-sm rounded-lg",
                    "bg-card border-border",
                    "text-foreground placeholder:text-muted-foreground",
                    "focus:border-primary focus:ring-1 focus:ring-primary/20"
                  )}
                />
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.form.phone}
                  className={cn(
                    "h-10 px-3 text-sm rounded-lg",
                    "bg-card border-border",
                    "text-foreground placeholder:text-muted-foreground",
                    "focus:border-primary focus:ring-1 focus:ring-primary/20"
                  )}
                />
              </div>
            </div>

            {/* CTA Button */}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={cn(
                "w-full h-10 sm:h-11 rounded-xl text-sm font-semibold transition-all duration-300",
                "bg-gradient-to-r from-primary to-secondary",
                "hover:opacity-90",
                "text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30",
                "group disabled:opacity-70"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  {t.cta}
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </div>

          {/* Right Column - Visual (Desktop only) */}
          <div className="hidden lg:block lg:w-[40%] relative overflow-hidden bg-card min-h-[400px]">
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-secondary/30 z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/40 z-10" />

            {/* Images with fade transition */}
            {sliderImages.map((src, index) => (
              <div
                key={index}
                className={cn(
                  "absolute inset-0 transition-opacity duration-1000",
                  currentImageIndex === index ? "opacity-100" : "opacity-0"
                )}
              >
                <img
                  src={src}
                  alt={`Setup ${index + 1}`}
                  className="w-full h-full object-cover blur-[1px]"
                />
              </div>
            ))}

            {/* Badge */}
            <div className="absolute top-4 left-4 z-20">
              <div className="px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10">
                <span className="text-white font-bold text-sm">SCB</span>
                <span className="text-primary text-xs ml-1.5">Premium Picks</span>
              </div>
            </div>

            {/* Dot Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
              {sliderImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    currentImageIndex === index
                      ? "w-5 bg-primary"
                      : "w-1.5 bg-white/40 hover:bg-white/60"
                  )}
                />
              ))}
            </div>

            {/* Decorative Text */}
            <div className="absolute bottom-12 left-4 right-4 z-20">
              <p className="text-white/80 text-sm font-medium">Build Your Dream Setup</p>
              <p className="text-white/50 text-xs mt-1">Premium components & accessories</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
