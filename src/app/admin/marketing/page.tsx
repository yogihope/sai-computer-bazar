"use client";

import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, LayoutTemplate, Sparkles, ArrowRight, Eye, MousePointerClick, TrendingUp } from "lucide-react";

const marketingModules = [
  {
    name: "Hero Banners",
    description: "Manage hero sections for Home page and Prebuilt PC page. Control headlines, images, CTAs and styling.",
    icon: LayoutTemplate,
    href: "/admin/marketing/hero-banners",
    gradient: "from-blue-500 to-cyan-500",
    stats: [
      { label: "Home", icon: Eye },
      { label: "Prebuilt PC", icon: Eye },
    ],
  },
  {
    name: "Advertisements",
    description: "Create and manage sidebar ads for coupons, products, categories, blogs, prebuilt PCs and custom links.",
    icon: Sparkles,
    href: "/admin/marketing/ads",
    gradient: "from-purple-500 to-pink-500",
    stats: [
      { label: "Impressions", icon: Eye },
      { label: "Clicks", icon: MousePointerClick },
    ],
  },
  {
    name: "Email Marketing",
    description: "Send promotional emails to inquiries and customers. Create campaigns with personalized content.",
    icon: Mail,
    href: "/admin/marketing/email",
    gradient: "from-orange-500 to-red-500",
    stats: [
      { label: "Inquiries", icon: TrendingUp },
      { label: "Customers", icon: TrendingUp },
    ],
  },
];

export default function MarketingPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Marketing Hub"
        subtitle="Manage hero banners, advertisements, and email campaigns"
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <LayoutTemplate className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hero Banners</p>
              <p className="text-lg font-semibold">2 Locations</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Sparkles className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Advertisements</p>
              <p className="text-lg font-semibold">Multiple Formats</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/20">
              <Mail className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email Marketing</p>
              <p className="text-lg font-semibold">SMTP Ready</p>
            </div>
          </div>
        </div>
      </div>

      {/* Marketing Modules */}
      <div className="grid grid-cols-1 gap-6">
        {marketingModules.map((module) => (
          <Link key={module.name} href={module.href} className="block group">
            <Card className="backdrop-blur-xl bg-card/50 border-border/50 hover:border-primary/50 transition-all duration-300 overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Icon Section */}
                <div className={`p-8 bg-gradient-to-br ${module.gradient} flex items-center justify-center md:w-48`}>
                  <module.icon className="w-16 h-16 text-white" />
                </div>

                {/* Content Section */}
                <div className="flex-1 p-6">
                  <CardHeader className="p-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl flex items-center gap-3">
                        {module.name}
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </CardTitle>
                    </div>
                    <CardDescription className="text-base mt-2">
                      {module.description}
                    </CardDescription>
                  </CardHeader>

                  {/* Stats */}
                  <div className="flex gap-4 mt-6">
                    {module.stats.map((stat, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50"
                      >
                        <stat.icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{stat.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Info Section */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-6">
        <h3 className="font-semibold text-lg mb-2">Marketing Tips</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Use compelling hero banners with clear call-to-actions to drive conversions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Rotate advertisements regularly to keep content fresh and engaging</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Personalize email campaigns using {"{{name}}"} placeholder for better engagement</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
