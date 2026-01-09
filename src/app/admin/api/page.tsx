"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Loader2,
  Save,
  Eye,
  EyeOff,
  CreditCard,
  Truck,
  Mail,
  Store,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Info,
  Plug,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SettingField {
  key: string;
  label: string;
  type: string;
  placeholder?: string;
  value: string;
  default?: string;
}

interface SettingGroup {
  key: string;
  label: string;
  description: string;
  fields: SettingField[];
}

const groupIcons: Record<string, React.ReactNode> = {
  razorpay: <CreditCard className="w-5 h-5" />,
  shiprocket: <Truck className="w-5 h-5" />,
  smtp: <Mail className="w-5 h-5" />,
  store: <Store className="w-5 h-5" />,
};

const groupColors: Record<string, string> = {
  razorpay: "text-blue-500 bg-blue-500/10",
  shiprocket: "text-orange-500 bg-orange-500/10",
  smtp: "text-green-500 bg-green-500/10",
  store: "text-purple-500 bg-purple-500/10",
};

export default function APISettingsPage() {
  const [groups, setGroups] = useState<SettingGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [changedSettings, setChangedSettings] = useState<Record<string, string>>({});
  const [originalSettings, setOriginalSettings] = useState<Record<string, string>>({});

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();

      if (res.ok) {
        setGroups(data.groups);
        setOriginalSettings(data.settings);
        setChangedSettings({});
      } else {
        toast.error(data.error || "Failed to fetch settings");
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to fetch settings");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSettingChange = (key: string, value: string) => {
    setChangedSettings((prev) => ({
      ...prev,
      [key]: value,
    }));

    // Also update the groups for immediate UI feedback
    setGroups((prevGroups) =>
      prevGroups.map((group) => ({
        ...group,
        fields: group.fields.map((field) =>
          field.key === key ? { ...field, value } : field
        ),
      }))
    );
  };

  const handleSave = async () => {
    if (Object.keys(changedSettings).length === 0) {
      toast.info("No changes to save");
      return;
    }

    setIsSaving(true);
    try {
      // Merge original settings with changes
      const allSettings = { ...originalSettings, ...changedSettings };

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: allSettings }),
      });

      if (res.ok) {
        toast.success("Settings saved successfully");
        setOriginalSettings(allSettings);
        setChangedSettings({});
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const togglePasswordVisibility = (key: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const hasChanges = Object.keys(changedSettings).length > 0;

  const renderField = (field: SettingField, groupKey: string) => {
    const isPassword = field.type === "password";
    const showPassword = showPasswords[field.key];
    const isBoolean = field.type === "boolean";
    const currentValue = changedSettings[field.key] ?? field.value;
    const isChanged = changedSettings[field.key] !== undefined;

    if (isBoolean) {
      return (
        <div key={field.key} className="flex items-center justify-between py-3">
          <div className="space-y-0.5">
            <Label htmlFor={field.key} className="text-sm font-medium">
              {field.label}
            </Label>
          </div>
          <Switch
            id={field.key}
            checked={currentValue === "true"}
            onCheckedChange={(checked) =>
              handleSettingChange(field.key, checked ? "true" : "false")
            }
          />
        </div>
      );
    }

    return (
      <div key={field.key} className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={field.key} className="text-sm font-medium">
            {field.label}
          </Label>
          {isChanged && (
            <span className="text-xs text-amber-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Unsaved
            </span>
          )}
        </div>
        <div className="relative">
          <Input
            id={field.key}
            type={isPassword && !showPassword ? "password" : field.type === "number" ? "number" : "text"}
            value={currentValue}
            onChange={(e) => handleSettingChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className={cn(
              "pr-10",
              isChanged && "border-amber-500/50 focus:border-amber-500"
            )}
          />
          {isPassword && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => togglePasswordVisibility(field.key)}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Eye className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="API Settings"
        subtitle="Configure payment gateways, shipping, and email services"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSettings}
              disabled={isLoading}
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className={cn(
                hasChanges && "bg-amber-500 hover:bg-amber-600"
              )}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                  {hasChanges && ` (${Object.keys(changedSettings).length})`}
                </>
              )}
            </Button>
          </div>
        }
      />

      {/* Info Banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            Secure Configuration
          </p>
          <p className="text-xs text-muted-foreground">
            API keys and passwords are stored securely in the database. Make sure to save
            your changes after editing. Enable each service after configuring the credentials.
          </p>
        </div>
      </div>

      {/* Settings Groups */}
      <Accordion type="multiple" defaultValue={groups.map((g) => g.key)} className="space-y-4">
        {groups.map((group) => (
          <AccordionItem
            key={group.key}
            value={group.key}
            className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden"
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
              <div className="flex items-center gap-4">
                <div className={cn("p-2.5 rounded-xl", groupColors[group.key])}>
                  {groupIcons[group.key] || <Plug className="w-5 h-5" />}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">{group.label}</h3>
                  <p className="text-xs text-muted-foreground">{group.description}</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4 pt-2">
                {/* Enable Switch at top if exists */}
                {group.fields.filter((f) => f.type === "boolean").map((field) => (
                  <div
                    key={field.key}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      {(changedSettings[field.key] ?? field.value) === "true" ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-muted-foreground" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{field.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {(changedSettings[field.key] ?? field.value) === "true"
                            ? "Service is enabled and active"
                            : "Service is currently disabled"}
                        </p>
                      </div>
                    </div>
                    <Switch
                      id={field.key}
                      checked={(changedSettings[field.key] ?? field.value) === "true"}
                      onCheckedChange={(checked) =>
                        handleSettingChange(field.key, checked ? "true" : "false")
                      }
                    />
                  </div>
                ))}

                {/* Other Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.fields
                    .filter((f) => f.type !== "boolean")
                    .map((field) => renderField(field, group.key))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Save Button (Fixed at bottom on mobile) */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-xl border-t border-border lg:hidden z-50">
          <Button
            className="w-full bg-amber-500 hover:bg-amber-600"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save {Object.keys(changedSettings).length} Change(s)
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
