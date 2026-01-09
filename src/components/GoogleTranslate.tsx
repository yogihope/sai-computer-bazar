"use client";

import { useEffect, useState, useRef } from "react";
import { Globe, ChevronDown, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
}

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "hi", name: "हिंदी", flag: "🇮🇳" },
  { code: "gu", name: "ગુજરાતી", flag: "🇮🇳" },
];

// Function to get cookie value
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

// Function to set cookie
function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

export default function GoogleTranslate() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("en");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load Google Translate script
  useEffect(() => {
    // Check saved language from cookie
    const savedLang = getCookie("googtrans");
    if (savedLang) {
      const langMatch = savedLang.match(/\/en\/(\w+)/);
      if (langMatch && langMatch[1]) {
        setSelectedLang(langMatch[1]);
      }
    }

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,hi,gu",
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        "google_translate_element_hidden"
      );
      setTimeout(() => setIsLoaded(true), 1000);
    };

    const existingScript = document.getElementById("google-translate-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google && window.google.translate) {
      window.googleTranslateElementInit();
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Change language using Google Translate
  const changeLanguage = (langCode: string) => {
    if (!isLoaded) {
      alert("Translation is loading, please wait...");
      return;
    }

    setIsChanging(true);
    setSelectedLang(langCode);
    setIsOpen(false);

    if (langCode === "en") {
      // Reset to English - clear cookies and reload
      setCookie("googtrans", "", -1);
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname;
      window.location.reload();
      return;
    }

    // Set the language cookie
    const langValue = `/en/${langCode}`;
    setCookie("googtrans", langValue, 365);
    document.cookie = `googtrans=${langValue}; path=/; domain=${window.location.hostname}`;

    // Try to find and trigger the Google Translate dropdown
    const select = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      setTimeout(() => setIsChanging(false), 1000);
    } else {
      // If select not found, reload page (cookie will handle translation)
      window.location.reload();
    }
  };

  const currentLang = languages.find((l) => l.code === selectedLang) || languages[0];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Custom styled button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isChanging}
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all",
          "text-gray-600 dark:text-gray-300",
          "hover:bg-gray-200/60 dark:hover:bg-gray-800/60",
          isOpen && "bg-gray-200/60 dark:bg-gray-800/60",
          isChanging && "opacity-50 cursor-wait"
        )}
      >
        {isChanging ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Globe className="w-3.5 h-3.5" />
        )}
        <span className="hidden sm:inline">{currentLang.code.toUpperCase()}</span>
        <ChevronDown className={cn("w-3 h-3 transition-transform", isOpen && "rotate-180")} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={cn(
            "absolute top-full right-0 mt-1 py-1 min-w-[140px] rounded-lg z-[100]",
            "bg-white dark:bg-[#12171f]",
            "border border-gray-200 dark:border-gray-700",
            "shadow-lg dark:shadow-2xl",
            "animate-in fade-in-0 zoom-in-95 duration-150"
          )}
        >
          {!isLoaded && (
            <div className="px-3 py-2 text-xs text-gray-500 flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              Loading...
            </div>
          )}
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              disabled={!isLoaded}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors",
                "hover:bg-gray-100 dark:hover:bg-gray-800/50",
                selectedLang === lang.code && "bg-primary/10 text-primary",
                !isLoaded && "opacity-50 cursor-not-allowed"
              )}
            >
              <span className="text-base">{lang.flag}</span>
              <span className="text-sm font-medium flex-1">{lang.name}</span>
              {selectedLang === lang.code && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Hidden Google Translate element - needs to be visible for GT to work */}
      <div
        id="google_translate_element_hidden"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '-9999px',
          visibility: 'hidden'
        }}
      />
    </div>
  );
}
