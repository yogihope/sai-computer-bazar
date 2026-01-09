import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Define setting groups and their fields
const SETTING_GROUPS = {
  razorpay: {
    label: "Razorpay Payment Gateway",
    description: "Configure Razorpay API credentials for payment processing",
    fields: [
      { key: "razorpay_key_id", label: "Key ID", type: "text", placeholder: "rzp_live_xxxxx" },
      { key: "razorpay_key_secret", label: "Key Secret", type: "password", placeholder: "Enter secret key" },
      { key: "razorpay_webhook_secret", label: "Webhook Secret", type: "password", placeholder: "Enter webhook secret" },
      { key: "razorpay_enabled", label: "Enable Razorpay", type: "boolean", default: "false" },
    ],
  },
  shiprocket: {
    label: "Shiprocket Shipping",
    description: "Configure Shiprocket API for shipping and logistics",
    fields: [
      { key: "shiprocket_email", label: "Email", type: "email", placeholder: "your@email.com" },
      { key: "shiprocket_password", label: "Password", type: "password", placeholder: "Enter password" },
      { key: "shiprocket_pickup_location", label: "Pickup Location ID", type: "text", placeholder: "e.g., Primary" },
      { key: "shiprocket_enabled", label: "Enable Shiprocket", type: "boolean", default: "false" },
    ],
  },
  smtp: {
    label: "Email / SMTP Settings",
    description: "Configure email settings for order notifications and alerts",
    fields: [
      { key: "smtp_host", label: "SMTP Host", type: "text", placeholder: "smtp.gmail.com" },
      { key: "smtp_port", label: "SMTP Port", type: "number", placeholder: "587" },
      { key: "smtp_user", label: "SMTP Username", type: "email", placeholder: "your@gmail.com" },
      { key: "smtp_password", label: "SMTP Password / App Password", type: "password", placeholder: "Enter app password" },
      { key: "smtp_from_email", label: "From Email", type: "email", placeholder: "noreply@yourstore.com" },
      { key: "smtp_from_name", label: "From Name", type: "text", placeholder: "Sai Computers" },
      { key: "smtp_enabled", label: "Enable Email Notifications", type: "boolean", default: "false" },
    ],
  },
  store: {
    label: "Store Settings",
    description: "General store configuration",
    fields: [
      { key: "store_name", label: "Store Name", type: "text", placeholder: "Sai Computers" },
      { key: "store_phone", label: "Store Phone", type: "text", placeholder: "+91 98765 43210" },
      { key: "store_email", label: "Store Email", type: "email", placeholder: "contact@store.com" },
      { key: "store_address", label: "Store Address", type: "text", placeholder: "Full address" },
      { key: "store_gst", label: "GST Number", type: "text", placeholder: "GSTIN" },
    ],
  },
  seasonal: {
    label: "Seasonal Theme",
    description: "Configure seasonal decorations and effects for your website",
    fields: [
      { key: "seasonal_theme", label: "Current Season", type: "select", options: ["none", "winter", "summer", "diwali", "holi"], default: "none" },
      { key: "seasonal_snow_enabled", label: "Enable Snowfall Effect", type: "boolean", default: "true" },
      { key: "seasonal_santa_enabled", label: "Enable Flying Santa", type: "boolean", default: "true" },
      { key: "seasonal_header_decoration", label: "Enable Header Snow Decoration", type: "boolean", default: "true" },
      { key: "seasonal_intensity", label: "Effect Intensity", type: "select", options: ["low", "medium", "high"], default: "medium" },
    ],
  },
};

interface SettingRow {
  id: string;
  key: string;
  value: string;
  group: string;
  label: string | null;
  type: string;
}

// GET - Get all settings grouped
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use raw SQL query to fetch settings
    let settings: SettingRow[] = [];
    try {
      settings = await prisma.$queryRaw<SettingRow[]>`
        SELECT id, \`key\`, value, \`group\`, label, type
        FROM site_settings
        ORDER BY \`key\`
      `;
    } catch (dbError: any) {
      // Table might not exist yet, return empty settings
      console.log("Settings table not found or empty, returning defaults");
      settings = [];
    }

    // Convert to key-value map
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    // Build response with groups
    const groups = Object.entries(SETTING_GROUPS).map(([groupKey, group]) => ({
      key: groupKey,
      label: group.label,
      description: group.description,
      fields: group.fields.map((field) => ({
        ...field,
        value: settingsMap[field.key] || (field as any).default || "",
      })),
    }));

    return NextResponse.json({
      groups,
      settings: settingsMap,
    });
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings: " + error.message },
      { status: 500 }
    );
  }
}

// PUT - Update settings
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        { error: "Invalid settings data" },
        { status: 400 }
      );
    }

    // Find which group each setting belongs to
    const getGroupForKey = (key: string): string | null => {
      for (const [groupKey, group] of Object.entries(SETTING_GROUPS)) {
        if (group.fields.some((f) => f.key === key)) {
          return groupKey;
        }
      }
      return null;
    };

    const getFieldConfig = (key: string) => {
      for (const group of Object.values(SETTING_GROUPS)) {
        const field = group.fields.find((f) => f.key === key);
        if (field) return field;
      }
      return null;
    };

    // Use raw SQL to upsert each setting
    for (const [key, value] of Object.entries(settings)) {
      const group = getGroupForKey(key);
      const fieldConfig = getFieldConfig(key);

      if (!group || !fieldConfig) {
        console.warn(`Unknown setting key: ${key}`);
        continue;
      }

      const id = `setting_${key}`;
      const strValue = String(value);

      await prisma.$executeRaw`
        INSERT INTO site_settings (id, \`key\`, value, \`group\`, label, type, createdAt, updatedAt)
        VALUES (${id}, ${key}, ${strValue}, ${group}, ${fieldConfig.label}, ${fieldConfig.type}, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          value = ${strValue},
          updatedAt = NOW()
      `;
    }

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings: " + error.message },
      { status: 500 }
    );
  }
}
