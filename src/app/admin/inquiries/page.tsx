"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  RefreshCcw,
  Trash2,
  Plus,
  Phone,
  Mail,
  User,
  MessageSquare,
  TrendingUp,
  Calendar,
  Loader2,
  X,
  CheckCircle2,
  Clock,
  XCircle,
  Target,
  Globe,
  Megaphone,
  Users,
  PhoneCall,
  Footprints,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

interface Inquiry {
  id: string;
  type: string;
  name: string;
  mobile: string;
  email: string | null;
  requirement: string | null;
  budget: string | null;
  note: string | null;
  status: string;
  source: string | null;
  followUpDate: string | null;
  lastContactedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
}

const INQUIRY_TYPES = [
  { value: "MANUAL", label: "Manual", icon: FileText, color: "text-gray-500" },
  { value: "MODAL_WEB", label: "Website Modal", icon: Globe, color: "text-blue-500" },
  { value: "CHAT_WEB", label: "Website Chat", icon: MessageSquare, color: "text-green-500" },
  { value: "AD_WEB", label: "Ad Campaign", icon: Megaphone, color: "text-purple-500" },
  { value: "SOCIAL_MEDIA", label: "Social Media", icon: Users, color: "text-pink-500" },
  { value: "PHONE_CALL", label: "Phone Call", icon: PhoneCall, color: "text-orange-500" },
  { value: "WALK_IN", label: "Walk-in", icon: Footprints, color: "text-cyan-500" },
];

const INQUIRY_STATUSES = [
  { value: "NEW", label: "New", color: "bg-blue-500/20 text-blue-500 border-blue-500/30" },
  { value: "PENDING", label: "Pending", color: "bg-amber-500/20 text-amber-500 border-amber-500/30" },
  { value: "CONTACTED", label: "Contacted", color: "bg-cyan-500/20 text-cyan-500 border-cyan-500/30" },
  { value: "FOLLOW_UP", label: "Follow Up", color: "bg-violet-500/20 text-violet-500 border-violet-500/30" },
  { value: "INTERESTED", label: "Interested", color: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30" },
  { value: "CONVERTED", label: "Converted", color: "bg-green-500/20 text-green-500 border-green-500/30" },
  { value: "NOT_INTERESTED", label: "Not Interested", color: "bg-gray-500/20 text-gray-500 border-gray-500/30" },
  { value: "CANCELLED", label: "Cancelled", color: "bg-red-500/20 text-red-500 border-red-500/30" },
];

const getTypeConfig = (type: string) => {
  return INQUIRY_TYPES.find((t) => t.value === type) || INQUIRY_TYPES[0];
};

const getStatusConfig = (status: string) => {
  return INQUIRY_STATUSES.find((s) => s.value === status) || INQUIRY_STATUSES[0];
};

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    type: "MANUAL",
    name: "",
    mobile: "",
    email: "",
    requirement: "",
    budget: "",
    note: "",
    status: "NEW",
    source: "",
    followUpDate: "",
  });

  const resetForm = () => {
    setFormData({
      type: "MANUAL",
      name: "",
      mobile: "",
      email: "",
      requirement: "",
      budget: "",
      note: "",
      status: "NEW",
      source: "",
      followUpDate: "",
    });
  };

  const fetchInquiries = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", pagination.page.toString());
      params.set("limit", pagination.limit.toString());
      if (searchQuery) params.set("search", searchQuery);
      if (typeFilter && typeFilter !== "all") params.set("type", typeFilter);
      if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/inquiries?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setInquiries(data.inquiries);
        setStats(data.stats);
        setPagination(data.pagination);
      } else {
        toast.error(data.error || "Failed to fetch inquiries");
      }
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      toast.error("Failed to fetch inquiries");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery, typeFilter, statusFilter]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchInquiries();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("");
    setStatusFilter("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleAdd = async () => {
    if (!formData.name || !formData.mobile) {
      toast.error("Name and mobile are required");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Inquiry added successfully");
        setShowAddModal(false);
        resetForm();
        fetchInquiries();
      } else {
        toast.error(data.error || "Failed to add inquiry");
      }
    } catch (error) {
      toast.error("Failed to add inquiry");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedInquiry) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/inquiries/${selectedInquiry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Inquiry updated successfully");
        setShowEditModal(false);
        setSelectedInquiry(null);
        fetchInquiries();
      } else {
        toast.error(data.error || "Failed to update inquiry");
      }
    } catch (error) {
      toast.error("Failed to update inquiry");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedInquiry) return;

    try {
      const res = await fetch(`/api/admin/inquiries/${selectedInquiry.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Inquiry deleted successfully");
        setShowDeleteDialog(false);
        setSelectedInquiry(null);
        fetchInquiries();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete inquiry");
      }
    } catch (error) {
      toast.error("Failed to delete inquiry");
    }
  };

  const handleStatusChange = async (inquiryId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/inquiries/${inquiryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success("Status updated");
        fetchInquiries();
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const openEditModal = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setFormData({
      type: inquiry.type,
      name: inquiry.name,
      mobile: inquiry.mobile,
      email: inquiry.email || "",
      requirement: inquiry.requirement || "",
      budget: inquiry.budget || "",
      note: inquiry.note || "",
      status: inquiry.status,
      source: inquiry.source || "",
      followUpDate: inquiry.followUpDate ? inquiry.followUpDate.split("T")[0] : "",
    });
    setShowEditModal(true);
  };

  const openViewModal = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setShowViewModal(true);
  };

  const openDeleteDialog = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setShowDeleteDialog(true);
  };

  const exportCSV = () => {
    const headers = ["Name", "Mobile", "Email", "Type", "Requirement", "Budget", "Status", "Source", "Date"];
    const csvData = inquiries.map((inq) => [
      inq.name,
      inq.mobile,
      inq.email || "",
      inq.type,
      inq.requirement || "",
      inq.budget || "",
      inq.status,
      inq.source || "",
      new Date(inq.createdAt).toLocaleDateString("en-IN"),
    ]);

    const csvContent = [headers, ...csvData].map((row) => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inquiries-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inquiries Management"
        subtitle="Track and manage all customer inquiries from various sources"
        actions={
          <Button onClick={() => { resetForm(); setShowAddModal(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Inquiry
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total</p>
              <p className="text-2xl font-bold mt-1">{stats?.total || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/50 text-primary">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Today</p>
              <p className="text-2xl font-bold mt-1">{stats?.today || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/50 text-emerald-500">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">This Week</p>
              <p className="text-2xl font-bold mt-1">{stats?.thisWeek || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/50 text-cyan-500">
              <Target className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">New</p>
              <p className="text-2xl font-bold mt-1">{stats?.byStatus?.NEW || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/50 text-blue-500">
              <Clock className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Converted</p>
              <p className="text-2xl font-bold mt-1">{stats?.byStatus?.CONVERTED || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/50 text-green-500">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Follow Up</p>
              <p className="text-2xl font-bold mt-1">{stats?.byStatus?.FOLLOW_UP || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/50 text-violet-500">
              <PhoneCall className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Type Stats */}
      <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
        <h3 className="font-semibold mb-3">Inquiries by Source</h3>
        <div className="flex flex-wrap gap-3">
          {INQUIRY_TYPES.map((type) => {
            const count = stats?.byType?.[type.value] || 0;
            const TypeIcon = type.icon;
            return (
              <div
                key={type.value}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 ${type.color}`}
              >
                <TypeIcon className="h-4 w-4" />
                <span className="text-sm font-medium">{type.label}</span>
                <Badge variant="secondary" className="ml-1">{count}</Badge>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, mobile, email, requirement..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            <Button type="button" variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {(typeFilter || statusFilter) && (
                <Badge variant="secondary" className="ml-2">Active</Badge>
              )}
            </Button>

            <Button type="submit" variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>

            <Button type="button" variant="outline" onClick={exportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>

            <Button type="button" variant="outline" onClick={fetchInquiries}>
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {/* Filter Options */}
        {showFilters && (
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Inquiry Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {INQUIRY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {INQUIRY_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(typeFilter || statusFilter || searchQuery) && (
              <Button type="button" variant="ghost" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Inquiries Table */}
      <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : inquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Inquiries Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || typeFilter || statusFilter
                ? "Try adjusting your filters"
                : "Start by adding a new inquiry"}
            </p>
            <Button onClick={() => { resetForm(); setShowAddModal(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Inquiry
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Requirement</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiries.map((inquiry) => {
                const typeConfig = getTypeConfig(inquiry.type);
                const statusConfig = getStatusConfig(inquiry.status);
                const TypeIcon = typeConfig.icon;
                return (
                  <TableRow key={inquiry.id} className="border-border hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{inquiry.name}</p>
                          {inquiry.source && (
                            <p className="text-xs text-muted-foreground">{inquiry.source}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <a href={`tel:${inquiry.mobile}`} className="hover:text-primary">
                            {inquiry.mobile}
                          </a>
                        </div>
                        {inquiry.email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <a href={`mailto:${inquiry.email}`} className="hover:text-primary truncate max-w-[150px]">
                              {inquiry.email}
                            </a>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`flex items-center gap-2 ${typeConfig.color}`}>
                        <TypeIcon className="h-4 w-4" />
                        <span className="text-sm">{typeConfig.label}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        <p className="text-sm truncate">{inquiry.requirement || "-"}</p>
                        {inquiry.budget && (
                          <p className="text-xs text-muted-foreground">Budget: {inquiry.budget}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Badge className={`${statusConfig.color} border cursor-pointer`}>
                            {statusConfig.label}
                          </Badge>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {INQUIRY_STATUSES.map((status) => (
                            <DropdownMenuItem
                              key={status.value}
                              onClick={() => handleStatusChange(inquiry.id, status.value)}
                            >
                              {status.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span className="text-sm">
                          {new Date(inquiry.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openViewModal(inquiry)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditModal(inquiry)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <a href={`tel:${inquiry.mobile}`}>
                              <Phone className="h-4 w-4 mr-2" />
                              Call
                            </a>
                          </DropdownMenuItem>
                          {inquiry.email && (
                            <DropdownMenuItem asChild>
                              <a href={`mailto:${inquiry.email}`}>
                                <Mail className="h-4 w-4 mr-2" />
                                Email
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => openDeleteDialog(inquiry)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            Showing {(pagination.page - 1) * pagination.limit + 1}-
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} inquiries
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={showAddModal || showEditModal} onOpenChange={(open) => {
        if (!open) {
          setShowAddModal(false);
          setShowEditModal(false);
          setSelectedInquiry(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{showEditModal ? "Edit Inquiry" : "Add New Inquiry"}</DialogTitle>
            <DialogDescription>
              {showEditModal ? "Update inquiry details" : "Add a new inquiry manually"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INQUIRY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INQUIRY_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Customer name"
                />
              </div>

              <div className="space-y-2">
                <Label>Mobile *</Label>
                <Input
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="Mobile number"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email address"
                />
              </div>

              <div className="space-y-2">
                <Label>Budget</Label>
                <Input
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="e.g., 50,000 - 70,000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Requirement / What they need</Label>
              <Textarea
                value={formData.requirement}
                onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
                placeholder="What are they looking for?"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Source</Label>
                <Input
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  placeholder="e.g., Facebook Ad - Gaming PC"
                />
              </div>

              <div className="space-y-2">
                <Label>Follow-up Date</Label>
                <Input
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Internal Notes</Label>
              <Textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Add any internal notes..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddModal(false);
              setShowEditModal(false);
              setSelectedInquiry(null);
            }}>
              Cancel
            </Button>
            <Button onClick={showEditModal ? handleEdit : handleAdd} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {showEditModal ? "Update" : "Add"} Inquiry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
          </DialogHeader>

          {selectedInquiry && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedInquiry.name}</h3>
                  <Badge className={getStatusConfig(selectedInquiry.status).color}>
                    {getStatusConfig(selectedInquiry.status).label}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Mobile</p>
                  <p className="font-medium">{selectedInquiry.mobile}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedInquiry.email || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium">{getTypeConfig(selectedInquiry.type).label}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Budget</p>
                  <p className="font-medium">{selectedInquiry.budget || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Source</p>
                  <p className="font-medium">{selectedInquiry.source || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Follow-up Date</p>
                  <p className="font-medium">
                    {selectedInquiry.followUpDate
                      ? new Date(selectedInquiry.followUpDate).toLocaleDateString("en-IN")
                      : "-"}
                  </p>
                </div>
              </div>

              {selectedInquiry.requirement && (
                <div>
                  <p className="text-muted-foreground text-sm">Requirement</p>
                  <p className="mt-1">{selectedInquiry.requirement}</p>
                </div>
              )}

              {selectedInquiry.note && (
                <div>
                  <p className="text-muted-foreground text-sm">Notes</p>
                  <p className="mt-1 text-sm bg-muted/50 p-3 rounded-lg">{selectedInquiry.note}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" asChild className="flex-1">
                  <a href={`tel:${selectedInquiry.mobile}`}>
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </a>
                </Button>
                {selectedInquiry.email && (
                  <Button variant="outline" asChild className="flex-1">
                    <a href={`mailto:${selectedInquiry.email}`}>
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </a>
                  </Button>
                )}
                <Button onClick={() => { setShowViewModal(false); openEditModal(selectedInquiry); }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Inquiry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this inquiry from {selectedInquiry?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
