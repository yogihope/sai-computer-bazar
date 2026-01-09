"use client";

import { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  Send,
  Users,
  MessageSquare,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Calendar,
  AlertTriangle,
} from "lucide-react";

interface Recipient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  orderCount?: number;
  createdAt: string;
}

type TimeFilter = "all" | "today" | "yesterday" | "this_week" | "last_week" | "this_month" | "last_month" | "this_year" | "last_year";

const timeFilters: { value: TimeFilter; label: string }[] = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "this_week", label: "This Week" },
  { value: "last_week", label: "Last Week" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "this_year", label: "This Year" },
  { value: "last_year", label: "Last Year" },
];

function getDateRange(filter: TimeFilter): { start: Date; end: Date } | null {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (filter) {
    case "all":
      return null;
    case "today":
      return { start: today, end: now };
    case "yesterday": {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return { start: yesterday, end: today };
    }
    case "this_week": {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      return { start: startOfWeek, end: now };
    }
    case "last_week": {
      const startOfThisWeek = new Date(today);
      startOfThisWeek.setDate(today.getDate() - today.getDay());
      const startOfLastWeek = new Date(startOfThisWeek);
      startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
      return { start: startOfLastWeek, end: startOfThisWeek };
    }
    case "this_month": {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: startOfMonth, end: now };
    }
    case "last_month": {
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return { start: startOfLastMonth, end: startOfThisMonth };
    }
    case "this_year": {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return { start: startOfYear, end: now };
    }
    case "last_year": {
      const startOfThisYear = new Date(now.getFullYear(), 0, 1);
      const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
      return { start: startOfLastYear, end: startOfThisYear };
    }
    default:
      return null;
  }
}

export default function EmailMarketingPage() {
  const [activeTab, setActiveTab] = useState<"inquiries" | "customers">("inquiries");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Email form
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonUrl, setButtonUrl] = useState("");

  useEffect(() => {
    fetchRecipients();
  }, [activeTab]);

  // Filter recipients by time and deduplicate by email
  const filteredRecipients = useMemo(() => {
    const dateRange = getDateRange(timeFilter);
    let filtered = recipients;

    // Apply time filter
    if (dateRange) {
      filtered = recipients.filter((r) => {
        const createdAt = new Date(r.createdAt);
        return createdAt >= dateRange.start && createdAt < dateRange.end;
      });
    }

    // Group by email and mark duplicates
    const emailMap = new Map<string, Recipient[]>();
    filtered.forEach((r) => {
      const existing = emailMap.get(r.email) || [];
      existing.push(r);
      emailMap.set(r.email, existing);
    });

    // Return unique emails with duplicate info
    const uniqueRecipients: (Recipient & { isDuplicate: boolean; duplicateCount: number })[] = [];
    const seenEmails = new Set<string>();

    filtered.forEach((r) => {
      const duplicates = emailMap.get(r.email) || [];
      if (!seenEmails.has(r.email)) {
        seenEmails.add(r.email);
        uniqueRecipients.push({
          ...r,
          isDuplicate: false,
          duplicateCount: duplicates.length,
        });
      }
    });

    return uniqueRecipients;
  }, [recipients, timeFilter]);

  const fetchRecipients = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/marketing/send-email?type=${activeTab}&search=${searchQuery}`);
      const data = await res.json();
      setRecipients(data.recipients || []);
    } catch (error) {
      console.error("Error fetching recipients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchRecipients();
  };

  const handleSelectAll = () => {
    if (selectedEmails.size === filteredRecipients.length) {
      setSelectedEmails(new Set());
    } else {
      setSelectedEmails(new Set(filteredRecipients.map((r) => r.email)));
    }
  };

  const handleSelect = (email: string) => {
    const newSelected = new Set(selectedEmails);
    if (newSelected.has(email)) {
      newSelected.delete(email);
    } else {
      newSelected.add(email);
    }
    setSelectedEmails(newSelected);
  };

  const handleSendEmails = async () => {
    if (!subject.trim() || !content.trim()) {
      setResult({ type: "error", message: "Subject and content are required" });
      return;
    }

    if (selectedEmails.size === 0) {
      setResult({ type: "error", message: "Please select at least one recipient" });
      return;
    }

    setSending(true);
    setResult(null);

    // Get IDs of selected recipients by email
    const selectedIds = filteredRecipients
      .filter((r) => selectedEmails.has(r.email))
      .map((r) => r.id);

    try {
      const res = await fetch("/api/admin/marketing/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientType: activeTab,
          selectedIds,
          subject,
          content,
          buttonText: buttonText || undefined,
          buttonUrl: buttonUrl || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult({
          type: "success",
          message: `Successfully sent ${data.sent} emails${data.failed > 0 ? `, ${data.failed} failed` : ""}`,
        });
        // Clear form
        setSubject("");
        setContent("");
        setButtonText("");
        setButtonUrl("");
        setSelectedEmails(new Set());
      } else {
        setResult({ type: "error", message: data.error || "Failed to send emails" });
      }
    } catch (error) {
      setResult({ type: "error", message: "An error occurred while sending emails" });
    } finally {
      setSending(false);
    }
  };

  // Count total unique emails in filtered list
  const uniqueEmailCount = filteredRecipients.length;
  const totalRecipients = recipients.length;
  const duplicateCount = totalRecipients - new Set(recipients.map(r => r.email)).size;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Marketing"
        subtitle="Send promotional emails to inquiries and customers"
        actions={
          <Button variant="outline" onClick={fetchRecipients} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recipients Selection */}
        <div className="lg:col-span-2 bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden">
          <Tabs value={activeTab} onValueChange={(v) => {
            setActiveTab(v as "inquiries" | "customers");
            setSelectedEmails(new Set());
            setTimeFilter("all");
          }}>
            <div className="p-4 border-b border-border/50">
              <TabsList className="w-full">
                <TabsTrigger value="inquiries" className="flex-1 gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Inquiries
                </TabsTrigger>
                <TabsTrigger value="customers" className="flex-1 gap-2">
                  <Users className="w-4 h-4" />
                  Customers
                </TabsTrigger>
              </TabsList>

              <div className="flex gap-2 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10"
                  />
                </div>
                <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)}>
                  <SelectTrigger className="w-[160px]">
                    <Calendar className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeFilters.map((filter) => (
                      <SelectItem key={filter.value} value={filter.value}>
                        {filter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={handleSearch}>
                  Search
                </Button>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={filteredRecipients.length > 0 && selectedEmails.size === filteredRecipients.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-muted-foreground">
                    {selectedEmails.size} of {uniqueEmailCount} unique emails selected
                  </span>
                </div>
                {duplicateCount > 0 && (
                  <div className="flex items-center gap-1 text-xs text-amber-500">
                    <AlertTriangle className="w-3 h-3" />
                    {duplicateCount} duplicate emails hidden
                  </div>
                )}
              </div>

              <TabsContent value="inquiries" className="mt-0">
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredRecipients.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No inquiries found for this time period
                    </div>
                  ) : (
                    filteredRecipients.map((recipient) => (
                      <div
                        key={recipient.id}
                        className={`flex items-center gap-4 p-3 rounded-lg border transition-colors cursor-pointer ${
                          selectedEmails.has(recipient.email)
                            ? "bg-primary/10 border-primary/50"
                            : "bg-background/50 border-border/50 hover:border-primary/30"
                        }`}
                        onClick={() => handleSelect(recipient.email)}
                      >
                        <Checkbox
                          checked={selectedEmails.has(recipient.email)}
                          onCheckedChange={() => handleSelect(recipient.email)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{recipient.name}</p>
                            {recipient.duplicateCount > 1 && (
                              <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                                {recipient.duplicateCount} entries
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {recipient.email}
                          </p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          {recipient.subject && (
                            <p className="truncate max-w-[150px]">{recipient.subject}</p>
                          )}
                          <p>{new Date(recipient.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="customers" className="mt-0">
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredRecipients.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No customers found for this time period
                    </div>
                  ) : (
                    filteredRecipients.map((recipient) => (
                      <div
                        key={recipient.id}
                        className={`flex items-center gap-4 p-3 rounded-lg border transition-colors cursor-pointer ${
                          selectedEmails.has(recipient.email)
                            ? "bg-primary/10 border-primary/50"
                            : "bg-background/50 border-border/50 hover:border-primary/30"
                        }`}
                        onClick={() => handleSelect(recipient.email)}
                      >
                        <Checkbox
                          checked={selectedEmails.has(recipient.email)}
                          onCheckedChange={() => handleSelect(recipient.email)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{recipient.name || "No Name"}</p>
                            {recipient.duplicateCount > 1 && (
                              <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                                {recipient.duplicateCount} entries
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {recipient.email}
                          </p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          {recipient.orderCount !== undefined && (
                            <p>{recipient.orderCount} orders</p>
                          )}
                          <p>{new Date(recipient.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Email Compose */}
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-primary/20">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Compose Email</h3>
              <p className="text-sm text-muted-foreground">
                {selectedEmails.size} unique emails selected
              </p>
            </div>
          </div>

          {result && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${
                result.type === "success"
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-red-500/10 text-red-500"
              }`}
            >
              {result.type === "success" ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="text-sm">{result.message}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                placeholder="Enter email subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                placeholder="Enter email content (HTML supported)..."
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Use {"{{name}}"} to personalize with recipient&apos;s name
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="buttonText">Button Text (Optional)</Label>
              <Input
                id="buttonText"
                placeholder="e.g., Shop Now"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buttonUrl">Button URL (Optional)</Label>
              <Input
                id="buttonUrl"
                placeholder="https://..."
                value={buttonUrl}
                onChange={(e) => setButtonUrl(e.target.value)}
              />
            </div>

            <Button
              className="w-full"
              onClick={handleSendEmails}
              disabled={sending || selectedEmails.size === 0}
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send to {selectedEmails.size} Recipients
                </>
              )}
            </Button>
          </div>

          <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-sm text-amber-500">
              <strong>SMTP Setup:</strong> Make sure you have configured SMTP settings in your .env file:
            </p>
            <ul className="text-xs text-amber-500/80 mt-2 space-y-1">
              <li>SMTP_HOST</li>
              <li>SMTP_PORT</li>
              <li>SMTP_USER</li>
              <li>SMTP_PASS</li>
              <li>SMTP_FROM_EMAIL</li>
              <li>SMTP_FROM_NAME</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
