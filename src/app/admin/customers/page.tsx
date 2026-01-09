"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  MoreHorizontal,
  Eye,
  Mail,
  Users,
  ShoppingBag,
  IndianRupee,
  UserPlus,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldX,
  Phone,
  Calendar,
  Star,
  MapPin,
  Download,
  UserX,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Customer {
  id: string;
  name: string;
  email: string;
  mobile: string;
  status: "ACTIVE" | "BLOCKED";
  avatar: string | null;
  emailVerified: boolean;
  mobileVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  orderCount: number;
  reviewCount: number;
  totalSpent: number;
}

interface Stats {
  totalCustomers: number;
  activeCustomers: number;
  blockedCustomers: number;
  newThisMonth: number;
  totalOrders: number;
  totalRevenue: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [customerToBlock, setCustomerToBlock] = useState<Customer | null>(null);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const res = await fetch(`/api/admin/customers?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setCustomers(data.customers);
        setStats(data.stats);
        setPagination(data.pagination);
      } else {
        toast.error(data.error || "Failed to fetch customers");
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to fetch customers");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery, statusFilter]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page !== 1) {
        setPagination((prev) => ({ ...prev, page: 1 }));
      } else {
        fetchCustomers();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setViewModalOpen(true);
  };

  const handleBlockCustomer = (customer: Customer) => {
    setCustomerToBlock(customer);
    setBlockDialogOpen(true);
  };

  const confirmBlockCustomer = async () => {
    if (!customerToBlock) return;

    try {
      const newStatus = customerToBlock.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";
      const res = await fetch(`/api/admin/customers/${customerToBlock.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success(
          newStatus === "BLOCKED"
            ? "Customer blocked successfully"
            : "Customer unblocked successfully"
        );
        setBlockDialogOpen(false);
        fetchCustomers();
      } else {
        toast.error("Failed to update customer status");
      }
    } catch (error) {
      toast.error("Failed to update customer status");
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers Management"
        subtitle="View and manage registered customers"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCustomers}
              disabled={isLoading}
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          {
            label: "Total Customers",
            value: stats?.totalCustomers || 0,
            icon: Users,
            color: "text-primary",
            bgColor: "bg-primary/10",
          },
          {
            label: "Active",
            value: stats?.activeCustomers || 0,
            icon: UserCheck,
            color: "text-emerald-500",
            bgColor: "bg-emerald-500/10",
          },
          {
            label: "Blocked",
            value: stats?.blockedCustomers || 0,
            icon: UserX,
            color: "text-red-500",
            bgColor: "bg-red-500/10",
          },
          {
            label: "New This Month",
            value: stats?.newThisMonth || 0,
            icon: UserPlus,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
          },
          {
            label: "Total Orders",
            value: stats?.totalOrders || 0,
            icon: ShoppingBag,
            color: "text-cyan-500",
            bgColor: "bg-cyan-500/10",
          },
          {
            label: "Total Revenue",
            value: formatCurrency(stats?.totalRevenue || 0),
            icon: IndianRupee,
            color: "text-amber-500",
            bgColor: "bg-amber-500/10",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">{stat.label}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Users className="w-12 h-12 mb-4" />
            <p>No customers found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id} className="border-border hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        {customer.avatar && <AvatarImage src={customer.avatar} />}
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(customer.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {customer.mobile || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{customer.orderCount}</span>
                      {customer.reviewCount > 0 && (
                        <Badge variant="outline" className="text-[10px]">
                          {customer.reviewCount} reviews
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(customer.totalSpent)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        customer.status === "ACTIVE"
                          ? "bg-emerald-500/20 text-emerald-500"
                          : "bg-red-500/20 text-red-500"
                      )}
                    >
                      {customer.status.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(customer.createdAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewCustomer(customer)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`mailto:${customer.email}`}>
                            <Mail className="w-4 h-4 mr-2" />
                            Send Email
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleBlockCustomer(customer)}
                          className={cn(
                            customer.status === "ACTIVE"
                              ? "text-destructive"
                              : "text-emerald-500"
                          )}
                        >
                          {customer.status === "ACTIVE" ? (
                            <>
                              <ShieldX className="w-4 h-4 mr-2" />
                              Block Customer
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-4 h-4 mr-2" />
                              Unblock Customer
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} customers
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                disabled={pagination.page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={pagination.page === pagination.totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* View Customer Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  {selectedCustomer.avatar && (
                    <AvatarImage src={selectedCustomer.avatar} />
                  )}
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {getInitials(selectedCustomer.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{selectedCustomer.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedCustomer.email}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      className={cn(
                        selectedCustomer.status === "ACTIVE"
                          ? "bg-emerald-500/20 text-emerald-500"
                          : "bg-red-500/20 text-red-500"
                      )}
                    >
                      {selectedCustomer.status.toLowerCase()}
                    </Badge>
                    {selectedCustomer.emailVerified && (
                      <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">
                        Email Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <ShoppingBag className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <p className="text-2xl font-bold">{selectedCustomer.orderCount}</p>
                  <p className="text-xs text-muted-foreground">Orders</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <Star className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                  <p className="text-2xl font-bold">{selectedCustomer.reviewCount}</p>
                  <p className="text-xs text-muted-foreground">Reviews</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <IndianRupee className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
                  <p className="text-2xl font-bold">
                    {formatCurrency(selectedCustomer.totalSpent)}
                  </p>
                  <p className="text-xs text-muted-foreground">Spent</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedCustomer.mobile || "No phone number"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedCustomer.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Joined {formatDate(selectedCustomer.createdAt)}</span>
                </div>
                {selectedCustomer.lastLoginAt && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>Last login: {formatDate(selectedCustomer.lastLoginAt)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewModalOpen(false)}>
              Close
            </Button>
            {selectedCustomer && (
              <Button asChild>
                <Link href={`mailto:${selectedCustomer.email}`}>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Link>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block/Unblock Confirmation Dialog */}
      <AlertDialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {customerToBlock?.status === "ACTIVE" ? "Block" : "Unblock"} Customer
            </AlertDialogTitle>
            <AlertDialogDescription>
              {customerToBlock?.status === "ACTIVE"
                ? `Are you sure you want to block ${customerToBlock?.name}? They won't be able to log in or place orders.`
                : `Are you sure you want to unblock ${customerToBlock?.name}? They will be able to log in and place orders again.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBlockCustomer}
              className={cn(
                customerToBlock?.status === "ACTIVE"
                  ? "bg-destructive hover:bg-destructive/90"
                  : "bg-emerald-500 hover:bg-emerald-600"
              )}
            >
              {customerToBlock?.status === "ACTIVE" ? "Block" : "Unblock"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
