"use client";

import { useEffect, useState } from "react";
import { SnowEffect } from "./SnowEffect";
import { FlyingSanta } from "./FlyingSanta";
import { HeaderSnowDecoration } from "./HeaderSnowDecoration";

interface SeasonalSettings {
  enabled: boolean;
  theme: string;
  snowEnabled?: boolean;
  santaEnabled?: boolean;
  headerDecoration?: boolean;
  intensity?: "low" | "medium" | "high";
}

export function SeasonalEffects() {
  const [settings, setSettings] = useState<SeasonalSettings | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/seasonal", {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch {
        // Silently fail - seasonal effects are optional
      }
    };

    fetchSettings();
  }, []);

  // Don't render anything until mounted and settings loaded
  if (!mounted || !settings || !settings.enabled) {
    return null;
  }

  // Render effects based on theme
  if (settings.theme === "winter") {
    return (
      <>
        {settings.snowEnabled !== false && (
          <SnowEffect intensity={settings.intensity || "medium"} />
        )}
        {settings.santaEnabled !== false && (
          <FlyingSanta interval={45} />
        )}
        {settings.headerDecoration !== false && (
          <HeaderSnowDecoration />
        )}
      </>
    );
  }

  // Future themes can be added here
  // if (settings.theme === "summer") { ... }
  // if (settings.theme === "diwali") { ... }

  return null;
}
