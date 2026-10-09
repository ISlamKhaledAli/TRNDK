import { useState, useEffect } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { useTranslation } from "react-i18next";
import { apiClient } from "@/services/api";
import { toast } from "sonner";
import {
  Inbox,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Phone,
  Mail,
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  Eye,
  Check,
  X,
  Calendar,
  User,
  DollarSign,
  FileText,
  Sparkles,
  Layers,
  ArrowUpDown,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

interface ServiceRequestItem {
  id: number;
  fullName: string;
  phone: string;
  email?: string | null;
  serviceType: string;
  serviceId?: number | null;
  title?: string | null;
  details: string;
  budget?: string | null;
  targetUrl?: string | null;
  status: string;
  adminNotes?: string | null;
  userId?: number | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

interface StatsData {
  total: number;
  pending: number;
  contacted: number;
  in_progress: number;
  completed: number;
  cancelled: number;
}

export default function AdminServiceRequests() {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [requests, setRequests] = useState<ServiceRequestItem[]>([]);
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    pending: 0,
    contacted: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State for Viewing / Editing Request
  const [activeRequest, setActiveRequest] = useState<ServiceRequestItem | null>(null);
  const [newStatus, setNewStatus] = useState<string>("pending");
  const [adminNotes, setAdminNotes] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  // Delete Dialog State
  const [requestToDelete, setRequestToDelete] = useState<number | null>(null);

  const fetchRequests = async (statusFilter?: string, showToast = false) => {
    setIsRefreshing(true);
    try {
      const res = await apiClient.getAdminServiceRequests(statusFilter || selectedStatus);
      if (res?.data) {
        setRequests(res.data);
      }
      if (res?.stats) {
        setStats(res.stats);
      }
      if (showToast) {
        toast.success(isRtl ? "تم تحديث البيانات بنجاح" : "Data refreshed successfully");
      }
    } catch (err: any) {
      toast.error(err.message || (isRtl ? "فشل تحميل طلبات الخدمات" : "Failed to load requests"));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests(selectedStatus);
  }, [selectedStatus]);

  const handleOpenDetails = (item: ServiceRequestItem) => {
    setActiveRequest(item);
    setNewStatus(item.status);
    setAdminNotes(item.adminNotes || "");
  };

  const handleUpdateStatusAndNotes = async () => {
    if (!activeRequest) return;
    setIsSaving(true);
    try {
      const res = await apiClient.updateAdminServiceRequest(activeRequest.id, {
        status: newStatus,
        adminNotes: adminNotes.trim() || undefined,
      });

      // Update in local state
      setRequests((prev) =>
        prev.map((item) =>
          item.id === activeRequest.id
            ? { ...item, status: newStatus, adminNotes: adminNotes.trim() }
            : item
        )
      );

      // Re-fetch stats silently
      fetchRequests(selectedStatus);

      toast.success(isRtl ? "تم تحديث حالة الطلب والملاحظات" : "Request updated successfully");
      setActiveRequest(null);
    } catch (err: any) {
      toast.error(err.message || (isRtl ? "فشل حفظ التحديثات" : "Failed to update request"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRequest = async () => {
    if (!requestToDelete) return;
    try {
      await apiClient.deleteAdminServiceRequest(requestToDelete);
      setRequests((prev) => prev.filter((r) => r.id !== requestToDelete));
      toast.success(isRtl ? "تم حذف الطلب بنجاح" : "Request deleted");
      setRequestToDelete(null);
      fetchRequests(selectedStatus);
    } catch (err: any) {
      toast.error(err.message || (isRtl ? "فشل حذف الطلب" : "Failed to delete"));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1.5 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>{isRtl ? "جديد بانتظار المراجعة" : "Pending / New"}</span>
          </Badge>
        );
      case "contacted":
        return (
          <Badge className="bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30 gap-1.5 font-semibold">
            <MessageCircle className="w-3 h-3" />
            <span>{isRtl ? "تم التواصل معه" : "Contacted"}</span>
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 gap-1.5 font-semibold">
            <Clock className="w-3 h-3" />
            <span>{isRtl ? "قيد التنفيذ" : "In Progress"}</span>
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1.5 font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            <span>{isRtl ? "مكتمل بنجاح" : "Completed"}</span>
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 gap-1.5 font-semibold">
            <X className="w-3 h-3" />
            <span>{isRtl ? "ملغي" : "Cancelled"}</span>
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getWhatsAppLink = (item: ServiceRequestItem) => {
    const cleanNumber = item.phone.replace(/[^\d+]/g, "").replace(/^\+/, "");
    const msg = isRtl
      ? `مرحباً ${item.fullName}، نتواصل معك من متجر TRNDK بخصوص طلبك لخدمة (${item.serviceType}) رقم #${item.id}. كيف يمكننا مساعدتك؟`
      : `Hello ${item.fullName}, this is TRNDK regarding your custom request #${item.id} for (${item.serviceType}).`;
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
  };

  const filteredList = requests.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.fullName.toLowerCase().includes(q) ||
      r.phone.toLowerCase().includes(q) ||
      (r.email && r.email.toLowerCase().includes(q)) ||
      r.serviceType.toLowerCase().includes(q) ||
      r.details.toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/50">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-primary/10 text-primary">
                <Inbox className="w-6 h-6" />
              </span>
              <span>{isRtl ? "طلبات الخدمات الخاصة (اطلب خدمة)" : "Custom Service Requests"}</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isRtl
                ? "متابعة وإدارة طلبات الخدمات المخصصة الواردة من نموذج المتجر والتواصل المباشر مع العملاء"
                : "Manage custom service requests submitted by store visitors and connect directly via WhatsApp"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchRequests(selectedStatus, true)}
              disabled={isRefreshing}
              className="gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>{isRtl ? "تحديث" : "Refresh"}</span>
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card
            onClick={() => setSelectedStatus("all")}
            className={`cursor-pointer transition-all hover:border-primary/50 ${
              selectedStatus === "all" ? "ring-2 ring-primary border-primary" : ""
            }`}
          >
            <CardContent className="p-4 flex flex-col justify-between">
              <span className="text-xs text-muted-foreground font-medium">
                {isRtl ? "إجمالي الطلبات" : "Total"}
              </span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-2xl font-extrabold text-foreground">{stats.total}</span>
                <span className="p-1.5 rounded-lg bg-primary/10 text-primary text-xs">
                  <Layers className="w-4 h-4" />
                </span>
              </div>
            </CardContent>
          </Card>

          <Card
            onClick={() => setSelectedStatus("pending")}
            className={`cursor-pointer transition-all hover:border-amber-500/50 ${
              selectedStatus === "pending" ? "ring-2 ring-amber-500 border-amber-500" : ""
            }`}
          >
            <CardContent className="p-4 flex flex-col justify-between">
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>{isRtl ? "جديد (بانتظار)" : "Pending"}</span>
              </span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                  {stats.pending}
                </span>
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 text-xs">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
            </CardContent>
          </Card>

          <Card
            onClick={() => setSelectedStatus("contacted")}
            className={`cursor-pointer transition-all hover:border-sky-500/50 ${
              selectedStatus === "contacted" ? "ring-2 ring-sky-500 border-sky-500" : ""
            }`}
          >
            <CardContent className="p-4 flex flex-col justify-between">
              <span className="text-xs text-sky-600 dark:text-sky-400 font-medium">
                {isRtl ? "تم التواصل" : "Contacted"}
              </span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-2xl font-extrabold text-sky-600 dark:text-sky-400">
                  {stats.contacted}
                </span>
                <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500 text-xs">
                  <MessageCircle className="w-4 h-4" />
                </span>
              </div>
            </CardContent>
          </Card>

          <Card
            onClick={() => setSelectedStatus("in_progress")}
            className={`cursor-pointer transition-all hover:border-purple-500/50 ${
              selectedStatus === "in_progress" ? "ring-2 ring-purple-500 border-purple-500" : ""
            }`}
          >
            <CardContent className="p-4 flex flex-col justify-between">
              <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                {isRtl ? "قيد التنفيذ" : "In Progress"}
              </span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
                  {stats.in_progress}
                </span>
                <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500 text-xs">
                  <Sparkles className="w-4 h-4" />
                </span>
              </div>
            </CardContent>
          </Card>

          <Card
            onClick={() => setSelectedStatus("completed")}
            className={`cursor-pointer transition-all hover:border-emerald-500/50 ${
              selectedStatus === "completed" ? "ring-2 ring-emerald-500 border-emerald-500" : ""
            }`}
          >
            <CardContent className="p-4 flex flex-col justify-between">
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                {isRtl ? "مكتمل" : "Completed"}
              </span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {stats.completed}
                </span>
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>
            </CardContent>
          </Card>

          <Card
            onClick={() => setSelectedStatus("cancelled")}
            className={`cursor-pointer transition-all hover:border-rose-500/50 ${
              selectedStatus === "cancelled" ? "ring-2 ring-rose-500 border-rose-500" : ""
            }`}
          >
            <CardContent className="p-4 flex flex-col justify-between">
              <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                {isRtl ? "ملغي" : "Cancelled"}
              </span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                  {stats.cancelled}
                </span>
                <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 text-xs">
                  <X className="w-4 h-4" />
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={
                isRtl
                  ? "البحث باسم العميل، رقم الهاتف، نوع الخدمة، أو التفاصيل..."
                  : "Search by client, phone, service type, or details..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-9 h-10 bg-card border-border"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={selectedStatus} onValueChange={(val) => setSelectedStatus(val)}>
              <SelectTrigger className="w-full sm:w-44 h-10 bg-card">
                <SelectValue placeholder={isRtl ? "الحالة" : "Status"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isRtl ? "جميع الحالات" : "All Statuses"}</SelectItem>
                <SelectItem value="pending">{isRtl ? "جديد (Pending)" : "Pending"}</SelectItem>
                <SelectItem value="contacted">{isRtl ? "تم التواصل" : "Contacted"}</SelectItem>
                <SelectItem value="in_progress">{isRtl ? "قيد التنفيذ" : "In Progress"}</SelectItem>
                <SelectItem value="completed">{isRtl ? "مكتمل" : "Completed"}</SelectItem>
                <SelectItem value="cancelled">{isRtl ? "ملغي" : "Cancelled"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Requests List */}
        {isLoading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">
              {isRtl ? "جارٍ تحميل طلبات الخدمات..." : "Loading requests..."}
            </p>
          </div>
        ) : filteredList.length === 0 ? (
          <Card className="border-dashed py-14 text-center">
            <CardContent className="flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Inbox className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                {isRtl ? "لا توجد طلبات تطابق المعايير" : "No requests found"}
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                {isRtl
                  ? "لم يتم العثور على أي طلبات في هذه الحالة أو بعملية البحث الحالية."
                  : "No requests matched the current search or status filter."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredList.map((item) => (
              <Card
                key={item.id}
                className="transition-all hover:shadow-md border-border/80 bg-card overflow-hidden"
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Info */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded-md bg-primary/10">
                          #{item.id}
                        </span>
                        <h3 className="font-bold text-base text-foreground">{item.fullName}</h3>
                        {getStatusBadge(item.status)}
                        <Badge variant="outline" className="text-xs">
                          {item.serviceType}
                        </Badge>
                        {item.budget && item.budget.trim() !== "-" && item.budget.trim() !== "" && (
                          <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 font-semibold">
                            <DollarSign className="w-3 h-3 shrink-0" />
                            <span>{item.budget}</span>
                          </Badge>
                        )}
                        {item.userId && (
                          <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                            {isRtl ? "عميل مسجل" : "Registered User"}
                          </Badge>
                        )}
                      </div>

                      {/* Contact Badges */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 font-mono" dir="ltr">
                          <Phone className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{item.phone}</span>
                        </span>
                        {item.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" />
                            <span>{item.email}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(item.createdAt).toLocaleString(isRtl ? "ar-SA" : "en-US")}</span>
                        </span>
                      </div>

                      {/* Details Snippet */}
                      <p className="text-xs sm:text-sm text-foreground/80 line-clamp-2 leading-relaxed bg-accent/30 p-2.5 rounded-lg border border-border/50">
                        {item.details}
                      </p>

                      {/* Admin Notes if exist */}
                      {item.adminNotes && (
                        <div className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/5 border border-amber-500/20 px-2.5 py-1.5 rounded-md flex items-center gap-1.5">
                          <span className="font-bold">{isRtl ? "ملاحظة الإدارة:" : "Admin Note:"}</span>
                          <span>{item.adminNotes}</span>
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border/50">
                      {/* WhatsApp Direct Chat */}
                      <a
                        href={getWhatsAppLink(item)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                        title={isRtl ? "مراسلة العميل عبر الواتساب" : "Chat on WhatsApp"}
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{isRtl ? "مراسلة واتساب" : "WhatsApp"}</span>
                      </a>

                      {/* View / Manage Button */}
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleOpenDetails(item)}
                        className="gap-1.5 text-xs font-bold"
                      >
                        <Eye className="w-4 h-4" />
                        <span>{isRtl ? "إدارة الطلب" : "Manage"}</span>
                      </Button>

                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setRequestToDelete(item.id)}
                        className="text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 h-8 w-8"
                        title={isRtl ? "حذف الطلب" : "Delete"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Details & Update Dialog */}
      <Dialog open={!!activeRequest} onOpenChange={(open) => !open && setActiveRequest(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {activeRequest && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-center justify-between gap-2">
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    <span>{isRtl ? "تفاصيل طلب الخدمة" : "Service Request Details"}</span>
                    <span className="font-mono text-sm px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                      #{activeRequest.id}
                    </span>
                  </DialogTitle>
                  {getStatusBadge(activeRequest.status)}
                </div>
                <DialogDescription className="text-xs text-muted-foreground">
                  {isRtl
                    ? `تاريخ الإرسال: ${new Date(activeRequest.createdAt).toLocaleString("ar-SA")}`
                    : `Submitted at: ${new Date(activeRequest.createdAt).toLocaleString("en-US")}`}
                </DialogDescription>
              </DialogHeader>

              {/* Client Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-accent/40 border border-border/60 text-xs">
                <div>
                  <span className="text-muted-foreground block mb-0.5">{isRtl ? "اسم العميل" : "Client Name"}</span>
                  <span className="font-bold text-sm text-foreground">{activeRequest.fullName}</span>
                </div>

                <div>
                  <span className="text-muted-foreground block mb-0.5">{isRtl ? "رقم الهاتف / واتساب" : "Phone / WhatsApp"}</span>
                  <a
                    href={getWhatsAppLink(activeRequest)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold font-mono text-emerald-600 hover:underline flex items-center gap-1"
                    dir="ltr"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{activeRequest.phone}</span>
                  </a>
                </div>

                {activeRequest.email && (
                  <div>
                    <span className="text-muted-foreground block mb-0.5">{isRtl ? "البريد الإلكتروني" : "Email"}</span>
                    <span className="font-mono">{activeRequest.email}</span>
                  </div>
                )}

                <div>
                  <span className="text-muted-foreground block mb-0.5">{isRtl ? "نوع الخدمة" : "Service Type"}</span>
                  <span className="font-bold">{activeRequest.serviceType}</span>
                </div>

                {activeRequest.budget && (
                  <div>
                    <span className="text-muted-foreground block mb-0.5">{isRtl ? "الميزانية المتوقعة" : "Budget"}</span>
                    <span className="font-bold text-emerald-600">{activeRequest.budget}</span>
                  </div>
                )}

                {activeRequest.targetUrl && (
                  <div className="sm:col-span-2">
                    <span className="text-muted-foreground block mb-0.5">{isRtl ? "الرابط المستهدف" : "Target Link"}</span>
                    <a
                      href={activeRequest.targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-mono truncate block flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <span className="truncate">{activeRequest.targetUrl}</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Requirements & Details */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  {isRtl ? "نص وتفاصيل الطلب:" : "Detailed Requirements:"}
                </label>
                <div className="p-3.5 rounded-xl bg-background border border-border text-sm leading-relaxed whitespace-pre-wrap">
                  {activeRequest.details}
                </div>
              </div>

              {/* Status Update & Admin Notes Form */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    {isRtl ? "تغيير حالة الطلب:" : "Change Status:"}
                  </label>
                  <Select value={newStatus} onValueChange={(val) => setNewStatus(val)}>
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">{isRtl ? "جديد بانتظار المراجعة (Pending)" : "Pending"}</SelectItem>
                      <SelectItem value="contacted">{isRtl ? "تم التواصل معه (Contacted)" : "Contacted"}</SelectItem>
                      <SelectItem value="in_progress">{isRtl ? "قيد التنفيذ (In Progress)" : "In Progress"}</SelectItem>
                      <SelectItem value="completed">{isRtl ? "مكتمل بنجاح (Completed)" : "Completed"}</SelectItem>
                      <SelectItem value="cancelled">{isRtl ? "ملغي (Cancelled)" : "Cancelled"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    {isRtl ? "ملاحظات الإدارة الداخلية (لا تظهر للعميل):" : "Internal Admin Notes:"}
                  </label>
                  <Textarea
                    rows={3}
                    placeholder={
                      isRtl
                        ? "اكتب هنا أي ملاحظة: مثلاً تم الاتفاق على سعر 80$، سيبدأ التنفيذ غداً..."
                        : "Internal notes for staff..."
                    }
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="bg-background"
                  />
                </div>
              </div>

              <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-2 pt-2">
                <a
                  href={getWhatsAppLink(activeRequest)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{isRtl ? "فتح محادثة واتساب" : "Open WhatsApp Chat"}</span>
                </a>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    onClick={() => setActiveRequest(null)}
                    disabled={isSaving}
                    className="w-full sm:w-auto text-xs"
                  >
                    {isRtl ? "إلغاء" : "Cancel"}
                  </Button>
                  <Button
                    onClick={handleUpdateStatusAndNotes}
                    disabled={isSaving}
                    className="w-full sm:w-auto text-xs font-bold gap-1.5"
                  >
                    {isSaving && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    <span>{isRtl ? "حفظ التغييرات" : "Save Changes"}</span>
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!requestToDelete} onOpenChange={(open) => !open && setRequestToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isRtl ? "هل أنت متأكد من حذف هذا الطلب؟" : "Confirm Deletion"}
            </DialogTitle>
            <DialogDescription>
              {isRtl
                ? "سيتم حذف هذا الطلب نهائياً من قاعدة البيانات ولا يمكن استرجاعه."
                : "This request will be permanently removed from the system."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setRequestToDelete(null)}>
              {isRtl ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              onClick={handleDeleteRequest}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              {isRtl ? "تأكيد الحذف" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
