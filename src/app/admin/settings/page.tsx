"use client";

import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Palette, Bell, CreditCard, Truck, Shield, Database, Users, FileText, Activity, Snowflake, Plug } from "lucide-react";

const settingsGroups = [
  {
    title: "Store",
    items: [
      { name: "General Settings", description: "Store name, contact, and basic info", icon: Store, href: "/admin/settings/store" },
      { name: "Theme & Branding", description: "Logo, colors, and appearance", icon: Palette, href: "/admin/settings/theme" },
      { name: "Seasonal Theme", description: "Winter, summer, and festive decorations", icon: Snowflake, href: "/admin/settings/seasonal" },
      { name: "Notifications", description: "Email and push notification settings", icon: Bell, href: "/admin/settings/notifications" },
    ]
  },
  {
    title: "Commerce",
    items: [
      { name: "Payments", description: "Payment gateways and methods", icon: CreditCard, href: "/admin/settings/payments" },
      { name: "Shipping", description: "Shipping zones and rates", icon: Truck, href: "/admin/settings/shipping" },
      { name: "Taxes", description: "Tax rates and rules", icon: FileText, href: "/admin/settings/taxes" },
    ]
  },
  {
    title: "System",
    items: [
      { name: "API Settings", description: "Payment, shipping & email APIs", icon: Plug, href: "/admin/api" },
      { name: "Security", description: "Password policies and 2FA", icon: Shield, href: "/admin/settings/security" },
      { name: "Users & Permissions", description: "Admin users and roles", icon: Users, href: "/admin/settings/users" },
      { name: "Backups", description: "Database backups and restore", icon: Database, href: "/admin/settings/backups" },
      { name: "Audit Logs", description: "Activity and change logs", icon: Activity, href: "/admin/settings/audit-logs" },
    ]
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your store configuration"
      />

      {settingsGroups.map((group) => (
        <div key={group.title} className="space-y-4">
          <h2 className="text-lg font-semibold">{group.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.items.map((item) => (
              <Link key={item.name} href={item.href}>
                <Card className="bg-card/50 backdrop-blur-xl border-border/50 hover:border-primary/50 transition-colors cursor-pointer h-full">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{item.name}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
