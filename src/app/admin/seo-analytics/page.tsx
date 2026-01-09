"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TrendingUp,
  TrendingDown,
  Globe,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Package,
  Monitor,
  Tags,
  Users,
  ShoppingCart,
  Star,
  RefreshCw,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  BarChart3,
  Layers,
  Eye,
  Zap,
  ShieldCheck,
  Image as ImageIcon,
  Type,
  FileQuestion,
  ChevronRight,
  Home,
  Share2,
  Twitter,
  Code2,
  Link2,
  FileImage,
  Text,
  EyeOff,
  Clock,
  MousePointerClick,
  Smartphone,
  Tablet,
  Laptop,
  Timer,
  Percent,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ========== Traffic Analytics Interfaces ==========
interface TrafficOverview {
  totalPageViews: number;
  uniqueVisitors: number;
  uniqueSessions: number;
  avgDwellTime: number;
  avgDwellTimeFormatted: string;
  bounceRate: number;
  avgScrollDepth: number;
  pageViewsChange: number;
  visitorsChange: number;
}

interface TopPage {
  path: string;
  title: string;
  type: string;
  views: number;
  avgDwellTime: number;
  bounceRate: number;
}

interface TopProduct {
  id: string;
  name: string;
  views: number;
  avgDwellTime: number;
}

interface TrafficSource {
  source: string;
  count: number;
  percentage: number;
}

interface TrafficData {
  filter: string;
  dateRange: { start: string; end: string };
  overview: TrafficOverview;
  deviceBreakdown: { desktop: number; mobile: number; tablet: number };
  pageTypeBreakdown: Record<string, number>;
  topPages: TopPage[];
  topProducts: TopProduct[];
  trafficSources: TrafficSource[];
  hourlyBreakdown: Record<number, number> | null;
  dailyBreakdown: { date: string; views: number }[] | null;
}

// ========== SEO Analytics Interfaces ==========
interface PageScore {
  page: string;
  score: number;
  total: number;
  optimized: number;
  issues: number;
  type: string;
}

interface Issue {
  label: string;
  count: number;
  severity: "critical" | "warning" | "info";
}

interface IssueCategory {
  category: string;
  issues: Issue[];
}

interface TopItem {
  name: string;
  slug: string;
  score: number;
  type: string;
}

interface NeedsAttentionItem {
  name: string;
  slug: string;
  score: number;
  type: string;
  issues: string[];
}

interface StaticPage {
  pageKey: string;
  pagePath: string;
  pageName: string;
  hasSeoTitle: boolean;
  hasSeoDescription: boolean;
  hasSeoKeywords: boolean;
  hasOpenGraph: boolean;
  hasTwitterCard: boolean;
  hasSchemaMarkup: boolean;
  hasCanonical: boolean;
  noIndex?: boolean;
  seoScore: number;
  issues: string[];
}

interface TechnicalSeo {
  schemaMarkup: {
    products: number;
    prebuiltPCs: number;
    categories: number;
    staticPages: number;
    total: number;
  };
  canonicalUrls: {
    products: number;
    prebuiltPCs: number;
    categories: number;
    staticPages: number;
  };
  openGraph: {
    products: number;
    prebuiltPCs: number;
    categories: number;
    staticPages: number;
  };
  twitterCards: {
    products: number;
    prebuiltPCs: number;
    staticPages: number;
  };
}

interface ContentAnalysis {
  products: {
    withLongDescription: number;
    withShortDescription: number;
    avgDescriptionLength: number;
  };
  prebuiltPCs: {
    withLongDescription: number;
    avgDescriptionLength: number;
  };
  categories: {
    withDescription: number;
    avgDescriptionLength: number;
  };
}

interface ImageSeo {
  totalImages: number;
  imagesWithAlt: number;
  imagesWithoutAlt: number;
  altTextCoverage: number;
  productsWithImages: number;
  productsWithMultipleImages: number;
  prebuiltPCsWithImages: number;
  prebuiltPCsWithGallery: number;
}

interface SEOData {
  overallScore: number;
  scoreLabel: string;
  projectHealth: {
    products: { total: number; published: number; draft: number; archived: number };
    prebuiltPCs: { total: number; published: number };
    categories: { total: number; visible: number };
    staticPages: { total: number; indexable: number; noIndex: number };
    orders: number;
    customers: number;
    reviews: { total: number; approved: number };
  };
  contentStats: {
    totalIndexablePages: number;
    fullyOptimized: number;
    partiallyOptimized: number;
    optimizationRate: number;
  };
  issuesSummary: {
    total: number;
    critical: number;
    warnings: number;
    info: number;
  };
  pageScores: PageScore[];
  issuesList: IssueCategory[];
  topPerforming: TopItem[];
  needsAttention: NeedsAttentionItem[];
  staticPages: {
    pages: StaticPage[];
    avgScore: number;
    withFullSeo: number;
    total: number;
    issues: any;
    needingAttention: StaticPage[];
  };
  technicalSeo: TechnicalSeo;
  contentAnalysis: ContentAnalysis;
  imageSeo: ImageSeo;
  seoBreakdown: {
    staticPages: { avgScore: number; withFullSeo: number; total: number; issues: any };
    products: { avgScore: number; withFullSeo: number; total: number; issues: any };
    prebuiltPCs: { avgScore: number; withFullSeo: number; total: number; issues: any };
    categories: { withFullSeo: number; total: number; issues: any };
  };
}

const DATE_FILTERS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "this_week", label: "This Week" },
  { value: "last_week", label: "Last Week" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "this_year", label: "This Year" },
  { value: "last_year", label: "Last Year" },
  { value: "lifetime", label: "Lifetime" },
];

export default function SEOAnalyticsPage() {
  const [seoData, setSeoData] = useState<SEOData | null>(null);
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null);
  const [isLoadingSeo, setIsLoadingSeo] = useState(true);
  const [isLoadingTraffic, setIsLoadingTraffic] = useState(true);
  const [dateFilter, setDateFilter] = useState("today");

  const fetchSeoData = useCallback(async () => {
    setIsLoadingSeo(true);
    try {
      const res = await fetch("/api/admin/seo-analytics");
      const result = await res.json();
      if (res.ok) {
        setSeoData(result);
      } else {
        toast.error(result.error || "Failed to fetch SEO data");
      }
    } catch (error) {
      console.error("Error fetching SEO data:", error);
      toast.error("Failed to fetch SEO data");
    } finally {
      setIsLoadingSeo(false);
    }
  }, []);

  const fetchTrafficData = useCallback(async () => {
    setIsLoadingTraffic(true);
    try {
      const res = await fetch(`/api/admin/analytics?filter=${dateFilter}`);
      const result = await res.json();
      if (res.ok) {
        setTrafficData(result);
      } else {
        toast.error(result.error || "Failed to fetch traffic data");
      }
    } catch (error) {
      console.error("Error fetching traffic data:", error);
      toast.error("Failed to fetch traffic data");
    } finally {
      setIsLoadingTraffic(false);
    }
  }, [dateFilter]);

  useEffect(() => {
    fetchSeoData();
  }, [fetchSeoData]);

  useEffect(() => {
    fetchTrafficData();
  }, [fetchTrafficData]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    return "text-red-500";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500/20 text-emerald-500";
    if (score >= 60) return "bg-amber-500/20 text-amber-500";
    return "bg-red-500/20 text-red-500";
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-500 bg-red-500/10";
      case "warning":
        return "text-amber-500 bg-amber-500/10";
      default:
        return "text-blue-500 bg-blue-500/10";
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="w-4 h-4 text-emerald-500" />;
    if (change < 0) return <ArrowDown className="w-4 h-4 text-red-500" />;
    return null;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-emerald-500";
    if (change < 0) return "text-red-500";
    return "text-muted-foreground";
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const isLoading = isLoadingSeo || isLoadingTraffic;

  if (isLoading && !seoData && !trafficData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="SEO & Analytics"
        subtitle="Monitor traffic, engagement, and search engine performance"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchSeoData();
              fetchTrafficData();
            }}
            disabled={isLoading}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
        }
      />

      {/* ========== TRAFFIC ANALYTICS SECTION ========== */}
      <Card className="bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Traffic Analytics
            </CardTitle>
            {/* Date Filter Tabs */}
            <div className="flex flex-wrap gap-1">
              {DATE_FILTERS.map((filter) => (
                <Button
                  key={filter.value}
                  variant={dateFilter === filter.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setDateFilter(filter.value)}
                  className="h-7 text-xs"
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingTraffic ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : trafficData ? (
            <div className="space-y-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Eye className="w-4 h-4" />
                    <span className="text-xs">Page Views</span>
                  </div>
                  <p className="text-2xl font-bold">{trafficData.overview.totalPageViews.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {getChangeIcon(trafficData.overview.pageViewsChange)}
                    <span className={cn("text-xs", getChangeColor(trafficData.overview.pageViewsChange))}>
                      {trafficData.overview.pageViewsChange > 0 ? "+" : ""}
                      {trafficData.overview.pageViewsChange}%
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Users className="w-4 h-4" />
                    <span className="text-xs">Visitors</span>
                  </div>
                  <p className="text-2xl font-bold">{trafficData.overview.uniqueVisitors.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {getChangeIcon(trafficData.overview.visitorsChange)}
                    <span className={cn("text-xs", getChangeColor(trafficData.overview.visitorsChange))}>
                      {trafficData.overview.visitorsChange > 0 ? "+" : ""}
                      {trafficData.overview.visitorsChange}%
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Timer className="w-4 h-4" />
                    <span className="text-xs">Avg. Dwell Time</span>
                  </div>
                  <p className="text-2xl font-bold">{trafficData.overview.avgDwellTimeFormatted}</p>
                  <p className="text-xs text-muted-foreground mt-1">per page</p>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Percent className="w-4 h-4" />
                    <span className="text-xs">Bounce Rate</span>
                  </div>
                  <p className="text-2xl font-bold">{trafficData.overview.bounceRate}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {trafficData.overview.bounceRate < 50 ? "Good" : trafficData.overview.bounceRate < 70 ? "Average" : "High"}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <MousePointerClick className="w-4 h-4" />
                    <span className="text-xs">Sessions</span>
                  </div>
                  <p className="text-2xl font-bold">{trafficData.overview.uniqueSessions.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">unique</p>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-500/20">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <BarChart3 className="w-4 h-4" />
                    <span className="text-xs">Scroll Depth</span>
                  </div>
                  <p className="text-2xl font-bold">{trafficData.overview.avgScrollDepth}%</p>
                  <p className="text-xs text-muted-foreground mt-1">average</p>
                </div>
              </div>

              {/* Device Breakdown & Traffic Sources */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Device Breakdown */}
                <div className="p-4 rounded-xl bg-muted/30">
                  <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                    <Laptop className="w-4 h-4" />
                    Device Breakdown
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Laptop className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">Desktop</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{trafficData.deviceBreakdown.desktop}</span>
                        <span className="text-xs text-muted-foreground">
                          ({trafficData.overview.totalPageViews > 0
                            ? Math.round((trafficData.deviceBreakdown.desktop / trafficData.overview.totalPageViews) * 100)
                            : 0}%)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm">Mobile</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{trafficData.deviceBreakdown.mobile}</span>
                        <span className="text-xs text-muted-foreground">
                          ({trafficData.overview.totalPageViews > 0
                            ? Math.round((trafficData.deviceBreakdown.mobile / trafficData.overview.totalPageViews) * 100)
                            : 0}%)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tablet className="w-4 h-4 text-purple-500" />
                        <span className="text-sm">Tablet</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{trafficData.deviceBreakdown.tablet}</span>
                        <span className="text-xs text-muted-foreground">
                          ({trafficData.overview.totalPageViews > 0
                            ? Math.round((trafficData.deviceBreakdown.tablet / trafficData.overview.totalPageViews) * 100)
                            : 0}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Traffic Sources */}
                <div className="p-4 rounded-xl bg-muted/30 lg:col-span-2">
                  <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Traffic Sources
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {trafficData.trafficSources.slice(0, 6).map((source, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                        <span className="text-sm truncate">{source.source}</span>
                        <Badge variant="outline" className="text-xs">
                          {source.count} ({source.percentage}%)
                        </Badge>
                      </div>
                    ))}
                    {trafficData.trafficSources.length === 0 && (
                      <p className="text-sm text-muted-foreground col-span-full text-center py-4">
                        No traffic data yet
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Top Pages Table */}
              <div className="rounded-xl bg-muted/30 overflow-hidden">
                <div className="p-4 border-b border-border/50">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Top Performing Pages
                  </h4>
                </div>
                {trafficData.topPages.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50 hover:bg-transparent">
                        <TableHead>Page</TableHead>
                        <TableHead className="text-right">Views</TableHead>
                        <TableHead className="text-right">Avg. Time</TableHead>
                        <TableHead className="text-right">Bounce Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trafficData.topPages.map((page, i) => (
                        <TableRow key={i} className="border-border/50">
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm truncate max-w-[300px]">{page.title}</p>
                              <p className="text-xs text-muted-foreground">{page.path}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">{page.views}</TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {formatDuration(page.avgDwellTime)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              className={cn(
                                page.bounceRate < 50
                                  ? "bg-emerald-500/20 text-emerald-500"
                                  : page.bounceRate < 70
                                  ? "bg-amber-500/20 text-amber-500"
                                  : "bg-red-500/20 text-red-500"
                              )}
                            >
                              {page.bounceRate}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No page views recorded yet</p>
                  </div>
                )}
              </div>

              {/* Top Products */}
              {trafficData.topProducts.length > 0 && (
                <div className="rounded-xl bg-muted/30 p-4">
                  <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" />
                    Most Viewed Products
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {trafficData.topProducts.map((product, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {product.views} views • {formatDuration(product.avgDwellTime)} avg
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hourly/Daily Chart Placeholder */}
              {trafficData.hourlyBreakdown && (
                <div className="rounded-xl bg-muted/30 p-4">
                  <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Hourly Traffic
                  </h4>
                  <div className="flex items-end gap-1 h-32">
                    {Object.entries(trafficData.hourlyBreakdown).map(([hour, count]) => {
                      const maxCount = Math.max(...Object.values(trafficData.hourlyBreakdown!));
                      const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                      return (
                        <div key={hour} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className="w-full bg-primary/60 rounded-t transition-all hover:bg-primary"
                            style={{ height: `${height}%`, minHeight: count > 0 ? "4px" : "0" }}
                            title={`${hour}:00 - ${count} views`}
                          />
                          {Number(hour) % 4 === 0 && (
                            <span className="text-[10px] text-muted-foreground">{hour}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No traffic data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========== SEO ANALYTICS SECTION ========== */}
      {seoData && (
        <>
          {/* Overall Score & Project Health */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* SEO Score Circle */}
            <Card className="bg-card/50 backdrop-blur-xl border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Overall SEO Score
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="relative w-44 h-44">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="88"
                      cy="88"
                      r="76"
                      stroke="hsl(var(--muted))"
                      strokeWidth="14"
                      fill="none"
                    />
                    <circle
                      cx="88"
                      cy="88"
                      r="76"
                      stroke={seoData.overallScore >= 80 ? "#10b981" : seoData.overallScore >= 60 ? "#f59e0b" : "#ef4444"}
                      strokeWidth="14"
                      fill="none"
                      strokeDasharray={`${(seoData.overallScore / 100) * 477} 477`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className={cn("text-5xl font-bold", getScoreColor(seoData.overallScore))}>
                        {seoData.overallScore}
                      </div>
                      <div className="text-sm text-muted-foreground">out of 100</div>
                    </div>
                  </div>
                </div>
                <Badge className={cn("mt-4", getScoreBadgeColor(seoData.overallScore))}>
                  {seoData.scoreLabel}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {seoData.contentStats.fullyOptimized} of {seoData.contentStats.fullyOptimized + seoData.contentStats.partiallyOptimized} pages fully optimized
                </p>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="lg:col-span-2 bg-card/50 backdrop-blur-xl border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Content Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Globe className="w-4 h-4" />
                      <span className="text-xs">Indexable Pages</span>
                    </div>
                    <p className="text-2xl font-bold">{seoData.contentStats.totalIndexablePages}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {seoData.contentStats.optimizationRate}% optimized
                    </p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Home className="w-4 h-4" />
                      <span className="text-xs">Static Pages</span>
                    </div>
                    <p className="text-2xl font-bold">{seoData.projectHealth.staticPages.indexable}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {seoData.projectHealth.staticPages.noIndex} no-index
                    </p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Package className="w-4 h-4" />
                      <span className="text-xs">Products</span>
                    </div>
                    <p className="text-2xl font-bold">{seoData.projectHealth.products.published}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {seoData.projectHealth.products.draft} drafts
                    </p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Monitor className="w-4 h-4" />
                      <span className="text-xs">Prebuilt PCs</span>
                    </div>
                    <p className="text-2xl font-bold">{seoData.projectHealth.prebuiltPCs.published}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      of {seoData.projectHealth.prebuiltPCs.total} total
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Static Pages SEO Status */}
          <Card className="bg-card/50 backdrop-blur-xl border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5 text-primary" />
                Static Pages SEO Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {seoData.staticPages.pages.map((page, i) => (
                  <div
                    key={i}
                    className={cn(
                      "p-4 rounded-xl border",
                      page.noIndex
                        ? "bg-muted/20 border-muted"
                        : page.seoScore >= 80
                        ? "bg-emerald-500/5 border-emerald-500/20"
                        : page.seoScore >= 60
                        ? "bg-amber-500/5 border-amber-500/20"
                        : "bg-red-500/5 border-red-500/20"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          {page.pageName}
                          {page.noIndex && (
                            <Badge variant="outline" className="text-[10px]">
                              <EyeOff className="w-3 h-3 mr-1" />
                              No Index
                            </Badge>
                          )}
                        </h4>
                        <p className="text-xs text-muted-foreground">{page.pagePath}</p>
                      </div>
                      <div className={cn("text-2xl font-bold", getScoreColor(page.seoScore))}>
                        {page.seoScore}%
                      </div>
                    </div>
                    {!page.noIndex && (
                      <div className="grid grid-cols-4 gap-2">
                        <div className="flex flex-col items-center p-2 rounded-lg bg-background/50">
                          <Type className={cn("w-4 h-4 mb-1", page.hasSeoTitle ? "text-emerald-500" : "text-red-500")} />
                          <span className="text-[10px] text-muted-foreground">Title</span>
                        </div>
                        <div className="flex flex-col items-center p-2 rounded-lg bg-background/50">
                          <FileText className={cn("w-4 h-4 mb-1", page.hasSeoDescription ? "text-emerald-500" : "text-red-500")} />
                          <span className="text-[10px] text-muted-foreground">Meta</span>
                        </div>
                        <div className="flex flex-col items-center p-2 rounded-lg bg-background/50">
                          <Share2 className={cn("w-4 h-4 mb-1", page.hasOpenGraph ? "text-emerald-500" : "text-red-500")} />
                          <span className="text-[10px] text-muted-foreground">OG</span>
                        </div>
                        <div className="flex flex-col items-center p-2 rounded-lg bg-background/50">
                          <Code2 className={cn("w-4 h-4 mb-1", page.hasSchemaMarkup ? "text-emerald-500" : "text-red-500")} />
                          <span className="text-[10px] text-muted-foreground">Schema</span>
                        </div>
                      </div>
                    )}
                    {!page.noIndex && page.issues.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {page.issues.slice(0, 2).map((issue, j) => (
                          <Badge key={j} variant="outline" className="text-[10px] border-red-500/30 text-red-500">
                            {issue}
                          </Badge>
                        ))}
                        {page.issues.length > 2 && (
                          <Badge variant="outline" className="text-[10px]">
                            +{page.issues.length - 2} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Technical SEO Metrics */}
          <Card className="bg-card/50 backdrop-blur-xl border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-primary" />
                Technical SEO Coverage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20">
                  <Code2 className="w-6 h-6 text-violet-500 mb-2" />
                  <p className="text-2xl font-bold">{seoData.technicalSeo.schemaMarkup.total}</p>
                  <p className="text-xs text-muted-foreground">Schema.org Markup</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                  <Share2 className="w-6 h-6 text-blue-500 mb-2" />
                  <p className="text-2xl font-bold">
                    {seoData.technicalSeo.openGraph.products + seoData.technicalSeo.openGraph.prebuiltPCs + seoData.technicalSeo.openGraph.categories + seoData.technicalSeo.openGraph.staticPages}
                  </p>
                  <p className="text-xs text-muted-foreground">Open Graph Tags</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20">
                  <Twitter className="w-6 h-6 text-cyan-500 mb-2" />
                  <p className="text-2xl font-bold">
                    {seoData.technicalSeo.twitterCards.products + seoData.technicalSeo.twitterCards.prebuiltPCs + seoData.technicalSeo.twitterCards.staticPages}
                  </p>
                  <p className="text-xs text-muted-foreground">Twitter Cards</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
                  <Link2 className="w-6 h-6 text-emerald-500 mb-2" />
                  <p className="text-2xl font-bold">
                    {seoData.technicalSeo.canonicalUrls.products + seoData.technicalSeo.canonicalUrls.prebuiltPCs + seoData.technicalSeo.canonicalUrls.categories + seoData.technicalSeo.canonicalUrls.staticPages}
                  </p>
                  <p className="text-xs text-muted-foreground">Canonical URLs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Analysis & Image SEO */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card/50 backdrop-blur-xl border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Text className="w-5 h-5 text-primary" />
                  Content Quality
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Products</span>
                    <Badge variant="outline">{seoData.contentAnalysis.products.avgDescriptionLength} avg chars</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">With long description</span>
                      <span className="font-medium">{seoData.contentAnalysis.products.withLongDescription}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Prebuilt PCs</span>
                    <Badge variant="outline">{seoData.contentAnalysis.prebuiltPCs.avgDescriptionLength} avg chars</Badge>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Categories</span>
                    <Badge variant="outline">{seoData.contentAnalysis.categories.avgDescriptionLength} avg chars</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-xl border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileImage className="w-5 h-5 text-primary" />
                  Image SEO
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-500/20">
                    <p className="text-3xl font-bold">{seoData.imageSeo.totalImages}</p>
                    <p className="text-xs text-muted-foreground">Total Images</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
                    <p className="text-3xl font-bold">{seoData.imageSeo.altTextCoverage}%</p>
                    <p className="text-xs text-muted-foreground">Alt Text Coverage</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm">Images with alt text</span>
                    </div>
                    <span className="font-medium">{seoData.imageSeo.imagesWithAlt}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="text-sm">Images without alt text</span>
                    </div>
                    <span className="font-medium">{seoData.imageSeo.imagesWithoutAlt}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Issues Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-card/50 backdrop-blur-xl border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Issues</p>
                    <p className="text-3xl font-bold mt-1">{seoData.issuesSummary.total}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50">
                    <AlertCircle className="w-6 h-6 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-xl border-red-500/20 border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Critical</p>
                    <p className="text-3xl font-bold mt-1 text-red-500">{seoData.issuesSummary.critical}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-red-500/10">
                    <XCircle className="w-6 h-6 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-xl border-amber-500/20 border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Warnings</p>
                    <p className="text-3xl font-bold mt-1 text-amber-500">{seoData.issuesSummary.warnings}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500/10">
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-xl border-blue-500/20 border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Info</p>
                    <p className="text-3xl font-bold mt-1 text-blue-500">{seoData.issuesSummary.info}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-500/10">
                    <AlertCircle className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing & Needs Attention */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card/50 backdrop-blur-xl border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  Top SEO Performing
                </CardTitle>
              </CardHeader>
              <CardContent>
                {seoData.topPerforming.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No SEO scores calculated yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {seoData.topPerforming.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-sm">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          <Badge variant="outline" className="text-[10px] mt-0.5">
                            {item.type === "product" ? "Product" : "Prebuilt"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn("font-bold", getScoreColor(item.score))}>
                            {item.score}%
                          </span>
                          <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-xl border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Needs Attention
                </CardTitle>
              </CardHeader>
              <CardContent>
                {seoData.needsAttention.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">All items are well optimized!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {seoData.needsAttention.slice(0, 5).map((item, i) => (
                      <div key={i} className="p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 font-bold text-sm">
                            {item.score}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.name}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.issues.slice(0, 3).map((issue, j) => (
                                <Badge
                                  key={j}
                                  variant="outline"
                                  className="text-[10px] border-red-500/30 text-red-500"
                                >
                                  {issue}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Link
                            href={`/admin/${item.type === "product" ? "products" : "prebuilt-pcs"}/edit/${item.slug}`}
                          >
                            <Button variant="ghost" size="sm">
                              Fix
                              <ArrowUpRight className="w-3 h-3 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detailed Issues */}
          {seoData.issuesList.length > 0 && (
            <Card className="bg-card/50 backdrop-blur-xl border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileQuestion className="w-5 h-5 text-primary" />
                  Detailed SEO Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="space-y-2">
                  {seoData.issuesList.map((category, i) => (
                    <AccordionItem
                      key={i}
                      value={category.category}
                      className="border border-border/50 rounded-xl px-4"
                    >
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                          {category.category === "Static Pages" && <Home className="w-5 h-5 text-indigo-500" />}
                          {category.category === "Products" && <Package className="w-5 h-5 text-blue-500" />}
                          {category.category === "Prebuilt PCs" && <Monitor className="w-5 h-5 text-purple-500" />}
                          {category.category === "Categories" && <Tags className="w-5 h-5 text-cyan-500" />}
                          <span className="font-medium">{category.category}</span>
                          <Badge variant="outline" className="ml-2">
                            {category.issues.reduce((sum, issue) => sum + issue.count, 0)} issues
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pt-2">
                          {category.issues.map((issue, j) => (
                            <div
                              key={j}
                              className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                            >
                              <div className="flex items-center gap-3">
                                {getSeverityIcon(issue.severity)}
                                <span className="text-sm">{issue.label}</span>
                              </div>
                              <Badge className={getSeverityColor(issue.severity)}>
                                {issue.count} items
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}

          {/* SEO Optimization Tips */}
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                SEO Optimization Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-background/50">
                  <Type className="w-6 h-6 text-primary mb-2" />
                  <h4 className="font-medium mb-1">SEO Titles</h4>
                  <p className="text-xs text-muted-foreground">
                    Keep titles under 60 characters. Include primary keyword at the beginning.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-background/50">
                  <FileText className="w-6 h-6 text-primary mb-2" />
                  <h4 className="font-medium mb-1">Meta Descriptions</h4>
                  <p className="text-xs text-muted-foreground">
                    Write compelling descriptions under 160 characters. Include a call to action.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-background/50">
                  <ImageIcon className="w-6 h-6 text-primary mb-2" />
                  <h4 className="font-medium mb-1">Image Alt Text</h4>
                  <p className="text-xs text-muted-foreground">
                    Add descriptive alt text to all images. Include relevant keywords naturally.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-background/50">
                  <Code2 className="w-6 h-6 text-primary mb-2" />
                  <h4 className="font-medium mb-1">Schema Markup</h4>
                  <p className="text-xs text-muted-foreground">
                    Add JSON-LD structured data for rich snippets in search results.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
