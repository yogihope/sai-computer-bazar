import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 60; // Cache for 60 seconds

interface SeasonalSettings {
  theme: string;
  snowEnabled: boolean;
  santaEnabled: boolean;
  headerDecoration: boolean;
  intensity: string;
}

// GET - Get seasonal settings (public, cached)
export async function GET() {
  try {
    // Default settings - winter is default during winter season
    const defaults: SeasonalSettings = {
      theme: "winter",
      snowEnabled: true,
      santaEnabled: true,
      headerDecoration: true,
      intensity: "medium",
    };

    try {
      // Fetch seasonal settings from database
      const settings = await prisma.$queryRaw<{ key: string; value: string }[]>`
        SELECT \`key\`, value FROM site_settings
        WHERE \`key\` LIKE 'seasonal_%'
      `;

      // Map settings
      const settingsMap: Record<string, string> = {};
      settings.forEach((s) => {
        settingsMap[s.key] = s.value;
      });

      const result: SeasonalSettings = {
        theme: settingsMap["seasonal_theme"] || defaults.theme,
        snowEnabled: settingsMap["seasonal_snow_enabled"] !== undefined
          ? settingsMap["seasonal_snow_enabled"] === "true"
          : defaults.snowEnabled,
        santaEnabled: settingsMap["seasonal_santa_enabled"] !== undefined
          ? settingsMap["seasonal_santa_enabled"] === "true"
          : defaults.santaEnabled,
        headerDecoration: settingsMap["seasonal_header_decoration"] !== undefined
          ? settingsMap["seasonal_header_decoration"] === "true"
          : defaults.headerDecoration,
        intensity: settingsMap["seasonal_intensity"] || defaults.intensity,
      };

      // If theme is none, return disabled state
      if (result.theme === "none") {
        return NextResponse.json({
          enabled: false,
          theme: "none",
        });
      }

      return NextResponse.json({
        enabled: true,
        ...result,
      });
    } catch {
      // If table doesn't exist, use defaults
      return NextResponse.json({
        enabled: true,
        theme: defaults.theme,
        snowEnabled: defaults.snowEnabled,
        santaEnabled: defaults.santaEnabled,
        headerDecoration: defaults.headerDecoration,
        intensity: defaults.intensity,
      });
    }
  } catch {
    // Return defaults on error
    return NextResponse.json({
      enabled: true,
      theme: "winter",
      snowEnabled: true,
      santaEnabled: true,
      headerDecoration: true,
      intensity: "medium",
    });
  }
}
