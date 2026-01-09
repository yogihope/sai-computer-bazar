"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Save,
  Loader2,
  Snowflake,
  Sun,
  Sparkles,
  Plane,
  CloudSnow,
  Gift,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SeasonalSettings {
  seasonal_theme: string;
  seasonal_snow_enabled: string;
  seasonal_santa_enabled: string;
  seasonal_header_decoration: string;
  seasonal_intensity: string;
}

const themeOptions = [
  { value: "none", label: "None (Disabled)", icon: "🚫", description: "No seasonal effects" },
  { value: "winter", label: "Winter", icon: "❄️", description: "Snow, Santa, icicles" },
  { value: "summer", label: "Summer", icon: "☀️", description: "Coming soon..." },
  { value: "diwali", label: "Diwali", icon: "🪔", description: "Coming soon..." },
  { value: "holi", label: "Holi", icon: "🎨", description: "Coming soon..." },
];

const intensityOptions = [
  { value: "low", label: "Low", description: "Subtle effects" },
  { value: "medium", label: "Medium", description: "Balanced effects" },
  { value: "high", label: "High", description: "Maximum festivity!" },
];

export default function SeasonalSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SeasonalSettings>({
    seasonal_theme: "none",
    seasonal_snow_enabled: "true",
    seasonal_santa_enabled: "true",
    seasonal_header_decoration: "true",
    seasonal_intensity: "medium",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        const seasonalGroup = data.groups?.find((g: any) => g.key === "seasonal");
        if (seasonalGroup) {
          const newSettings: any = {};
          seasonalGroup.fields.forEach((field: any) => {
            newSettings[field.key] = field.value || field.default || "";
          });
          setSettings(newSettings);
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      if (res.ok) {
        toast({ title: "Success", description: "Seasonal settings saved!" });
      } else {
        toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof SeasonalSettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isWinter = settings.seasonal_theme === "winter";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Seasonal Theme"
        subtitle="Add festive decorations and effects to your website"
        actions={
          <div className="flex items-center gap-3">
            <Link href="/admin/settings">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Theme Selection */}
          <Card className="bg-card/50 backdrop-blur-xl border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Select Season
              </CardTitle>
              <CardDescription>
                Choose a seasonal theme to activate decorations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {themeOptions.map((theme) => (
                  <button
                    key={theme.value}
                    onClick={() => updateSetting("seasonal_theme", theme.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      settings.seasonal_theme === theme.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="text-3xl mb-2">{theme.icon}</div>
                    <div className="font-medium text-sm">{theme.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {theme.description}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Winter Effects */}
          {isWinter && (
            <Card className="bg-card/50 backdrop-blur-xl border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Snowflake className="w-5 h-5 text-cyan-400" />
                  Winter Effects
                </CardTitle>
                <CardDescription>
                  Configure which winter decorations to show
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Snowfall */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/20">
                      <CloudSnow className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <Label className="font-medium">Snowfall Effect</Label>
                      <p className="text-sm text-muted-foreground">
                        Gentle snowflakes falling across the screen
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.seasonal_snow_enabled === "true"}
                    onCheckedChange={(checked) =>
                      updateSetting("seasonal_snow_enabled", checked ? "true" : "false")
                    }
                  />
                </div>

                {/* Flying Santa */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/20">
                      <Gift className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <Label className="font-medium">Flying Santa</Label>
                      <p className="text-sm text-muted-foreground">
                        Santa with sleigh flies across periodically
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.seasonal_santa_enabled === "true"}
                    onCheckedChange={(checked) =>
                      updateSetting("seasonal_santa_enabled", checked ? "true" : "false")
                    }
                  />
                </div>

                {/* Header Decoration */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <Snowflake className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <Label className="font-medium">Header Snow Decoration</Label>
                      <p className="text-sm text-muted-foreground">
                        Snow cap and icicles on top of the page
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.seasonal_header_decoration === "true"}
                    onCheckedChange={(checked) =>
                      updateSetting("seasonal_header_decoration", checked ? "true" : "false")
                    }
                  />
                </div>

                {/* Intensity */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <Label className="font-medium mb-3 block">Effect Intensity</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {intensityOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateSetting("seasonal_intensity", opt.value)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          settings.seasonal_intensity === opt.value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="font-medium text-sm">{opt.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {opt.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Preview Sidebar */}
        <div className="space-y-6">
          <Card className="bg-card/50 backdrop-blur-xl border-border/50">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                See how effects will look on your site
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
                {/* Mock website preview */}
                <div className="absolute inset-0 p-2">
                  {/* Header */}
                  <div className="h-6 bg-white/10 rounded mb-2 relative">
                    {isWinter && settings.seasonal_header_decoration === "true" && (
                      <div className="absolute -top-1 left-0 right-0 h-2 bg-gradient-to-b from-white/80 to-transparent" />
                    )}
                  </div>
                  {/* Content */}
                  <div className="space-y-2">
                    <div className="h-16 bg-white/5 rounded" />
                    <div className="grid grid-cols-3 gap-1">
                      <div className="h-12 bg-white/5 rounded" />
                      <div className="h-12 bg-white/5 rounded" />
                      <div className="h-12 bg-white/5 rounded" />
                    </div>
                  </div>
                </div>

                {/* Snow particles preview */}
                {isWinter && settings.seasonal_snow_enabled === "true" && (
                  <div className="absolute inset-0 pointer-events-none">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          opacity: 0.4 + Math.random() * 0.6,
                          animationDelay: `${Math.random() * 2}s`,
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Santa preview */}
                {isWinter && settings.seasonal_santa_enabled === "true" && (
                  <div className="absolute top-4 right-4 text-lg">
                    🎅🛷🦌
                  </div>
                )}
              </div>

              <p className="text-xs text-muted-foreground mt-3 text-center">
                Actual effects may vary. Save and refresh to see live effects.
              </p>
            </CardContent>
          </Card>

          {/* Status */}
          <Card className="bg-card/50 backdrop-blur-xl border-border/50">
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`p-4 rounded-lg ${
                settings.seasonal_theme !== "none"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-muted text-muted-foreground"
              }`}>
                <div className="font-medium">
                  {settings.seasonal_theme !== "none" ? "Active" : "Disabled"}
                </div>
                <div className="text-sm opacity-80">
                  {settings.seasonal_theme !== "none"
                    ? `${themeOptions.find(t => t.value === settings.seasonal_theme)?.label} theme is active`
                    : "No seasonal theme is active"
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
