import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PublicLayout from "@/components/layouts/PublicLayout";
import { useTranslation } from "react-i18next";
import { apiClient } from "@/services/api";
import { toast } from "sonner";
import {
  Sparkles,
  Send,
  Home,
  CheckCircle2,
  Clock,
  ShieldCheck,
  MessageCircle,
  HelpCircle,
  Instagram,
  Youtube,
  Facebook,
  Music,
  Globe,
  Share2,
  DollarSign,
  User,
  Phone,
  Mail,
  FileText,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Layers,
  Palette,
  Check,
  Video,
  Code,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PLATFORM_OPTIONS = [
  {
    id: "Instagram",
    nameAr: "انستقرام (Instagram)",
    nameEn: "Instagram",
    subAr: "متابعين وتفاعل وتوثيق",
    icon: Instagram,
    iconColor: "text-rose-500",
    bgColor: "bg-rose-500/10 border-rose-500/20",
  },
  {
    id: "TikTok",
    nameAr: "تيك توك (TikTok)",
    nameEn: "TikTok",
    subAr: "دعم لايف وإكسبلور ومتابعين",
    icon: Music,
    iconColor: "text-cyan-400 dark:text-cyan-300",
    bgColor: "bg-cyan-500/10 border-cyan-500/20",
  },
  {
    id: "YouTube",
    nameAr: "يوتيوب (YouTube)",
    nameEn: "YouTube",
    subAr: "مشتركين وساعات ومشاهدات",
    icon: Youtube,
    iconColor: "text-red-500",
    bgColor: "bg-red-500/10 border-red-500/20",
  },
  {
    id: "Facebook",
    nameAr: "فيسبوك (Facebook)",
    nameEn: "Facebook",
    subAr: "معجبين وتفاعل صفحات",
    icon: Facebook,
    iconColor: "text-blue-500",
    bgColor: "bg-blue-500/10 border-blue-500/20",
  },
  {
    id: "Design & Media",
    nameAr: "تصميم وميديا",
    nameEn: "Design & Media",
    subAr: "بنرات وهوية وتصميم جرافيك",
    icon: Palette,
    iconColor: "text-purple-500",
    bgColor: "bg-purple-500/10 border-purple-500/20",
  },
  {
    id: "Verification",
    nameAr: "توثيق حسابات",
    nameEn: "Account Verification",
    subAr: "شارة التوثيق والملفات",
    icon: BadgeCheck,
    iconColor: "text-sky-500",
    bgColor: "bg-sky-500/10 border-sky-500/20",
  },
  {
    id: "Web & Tech",
    nameAr: "تطوير وبرمجة",
    nameEn: "Web & Tech",
    subAr: "متاجر ومواقع وحلول تقنية",
    icon: Code,
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    id: "Other Custom",
    nameAr: "خدمة مخصصة أخرى",
    nameEn: "Other Custom Service",
    subAr: "طلبات واحتياجات خاصة",
    icon: Sparkles,
    iconColor: "text-amber-500",
    bgColor: "bg-amber-500/10 border-amber-500/20",
  },
];

const BUDGET_PRESETS = [
  { id: "under_50", labelAr: "أقل من $50", labelEn: "Under $50" },
  { id: "50_150", labelAr: "$50 - $150", labelEn: "$50 - $150" },
  { id: "150_300", labelAr: "$150 - $300", labelEn: "$150 - $300" },
  { id: "300_plus", labelAr: "+$300", labelEn: "$300+" },
  { id: "open", labelAr: "مفتوحة / حسب العرض", labelEn: "Open / Per Quote" },
];

export default function RequestServicePage() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [serviceType, setServiceType] = useState("Instagram");
  const [targetUrl, setTargetUrl] = useState("");
  const [budget, setBudget] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success dialog state
  const [successData, setSuccessData] = useState<{
    id: number;
    fullName: string;
    phone: string;
    serviceType: string;
    details: string;
  } | null>(null);

  // Support contact info from settings or default
  const [contactWhatsApp, setContactWhatsApp] = useState("+966597988788");

  useEffect(() => {
    // Attempt to read store contact button configuration
    apiClient
      .getContactButton()
      .then((res) => {
        if (res?.data?.whatsappNumber) {
          setContactWhatsApp(res.data.whatsappNumber);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error(isRtl ? "يرجى إدخال اسمك الكريم" : "Please enter your name");
      return;
    }

    if (!phone.trim()) {
      toast.error(isRtl ? "يرجى إدخال رقم الهاتف أو الواتساب للتواصل" : "Please enter phone / WhatsApp number");
      return;
    }

    if (!details.trim() || details.trim().length < 5) {
      toast.error(isRtl ? "يرجى كتابة تفاصيل الخدمة المطلوبة" : "Please describe your service requirements");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        serviceType,
        targetUrl: targetUrl.trim() || undefined,
        budget: budget || undefined,
        details: details.trim(),
      };

      const res = await apiClient.submitServiceRequest(payload);
      const created = res.data;

      setSuccessData({
        id: created.id,
        fullName: created.fullName,
        phone: created.phone,
        serviceType: created.serviceType,
        details: created.details,
      });

      toast.success(
        isRtl
          ? "تم استلام طلبك بنجاح! سيتم التواصل معك سريعاً."
          : "Your service request was submitted successfully!"
      );

      // Reset form
      setFullName("");
      setPhone("");
      setEmail("");
      setTargetUrl("");
      setBudget("");
      setDetails("");
    } catch (err: any) {
      toast.error(err.message || (isRtl ? "حدث خطأ أثناء إرسال الطلب" : "Failed to submit request"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppDirectLink = () => {
    if (!successData) return "#";
    const cleanNumber = contactWhatsApp.replace(/[^\d+]/g, "").replace(/^\+/, "");
    const msg = isRtl
      ? `مرحباً TRNDK، قمت بتقديم طلب خدمة خاصة رقم (#${successData.id}):\n• الاسم: ${successData.fullName}\n• نوع الخدمة: ${successData.serviceType}\n• التفاصيل: ${successData.details}\nأود المتابعة معكم مباشرة.`
      : `Hello TRNDK, I submitted service request (#${successData.id}):\n• Name: ${successData.fullName}\n• Service: ${successData.serviceType}\n• Details: ${successData.details}\nLooking forward to following up!`;
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <PublicLayout>
      {/* Breadcrumb */}
      <div className="bg-card border-b border-border py-4">
        <div className="container">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Home className="w-4 h-4" />
              <span>{t("common.nav.home") || (isRtl ? "الرئيسية" : "Home")}</span>
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">
              {isRtl ? "اطلب خدمة مخصصة" : "Request Custom Service"}
            </span>
          </nav>
        </div>
      </div>

      <div className="container py-10 md:py-14 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs md:text-sm font-semibold mb-4 border border-primary/20 shadow-sm animate-pulse">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>{isRtl ? "خدمات مخصصة وحصرية حسب طلبك" : "Custom & Tailored Digital Services"}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-4">
            {isRtl ? "اطلب خدمتك الخاصة الآن" : "Request Your Custom Service"}
          </h1>

          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            {isRtl
              ? "لم تجد الباقة أو الخدمة المناسبة في المتجر؟ اكتب لنا تفاصيل ما تبحث عنه وسيقوم فريقنا المتخصص بدراسة طلبك وتقديم أفضل تسعيرة وتنسيق التنفيذ فوراً."
              : "Didn't find the exact package you need? Share your custom requirements with us and our specialized team will study your request and provide the best quote promptly."}
          </p>

          {/* Value Props Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 text-start">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/80 shadow-xs">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  {isRtl ? "سرعة في الاستجابة" : "Fast Response"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {isRtl ? "رد خلال أقل من 30 دقيقة" : "Reply within 30 minutes"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/80 shadow-xs">
              <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  {isRtl ? "ضمان كامل 100%" : "100% Quality Guaranteed"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {isRtl ? "تنفيذ آمن ونتائج حقيقية" : "Safe execution & real results"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/80 shadow-xs">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  {isRtl ? "متابعة واتساب مباشرة" : "Direct WhatsApp Support"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {isRtl ? "تواصل لحظي خطوة بخطوة" : "Instant direct follow-up"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <Card className="border border-border/80 shadow-xl bg-card/95 backdrop-blur-xs overflow-hidden">
          <div className="h-1.5 w-full bg-linear-to-r from-primary via-emerald-500 to-primary" />

          <CardContent className="p-6 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Step 1: Client Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                  <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    1
                  </span>
                  <h3 className="font-bold text-base md:text-lg text-foreground">
                    {isRtl ? "معلومات التواصل" : "Contact Information"}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs md:text-sm font-medium text-foreground flex items-center gap-1.5">
                      <User className="w-4 h-4 text-primary" />
                      <span>{isRtl ? "الاسم الكامل" : "Full Name"}</span>
                      <span className="text-red-500 font-bold">*</span>
                    </label>
                    <Input
                      required
                      placeholder={isRtl ? "مثال: محمد أحمد" : "e.g. John Doe"}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-background/50 h-11"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs md:text-sm font-medium text-foreground flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-emerald-500" />
                      <span>{isRtl ? "رقم الواتساب أو الهاتف" : "WhatsApp / Phone Number"}</span>
                      <span className="text-red-500 font-bold">*</span>
                    </label>
                    <Input
                      required
                      type="tel"
                      dir="ltr"
                      placeholder="+966 50 000 0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-background/50 h-11 text-start"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      {isRtl
                        ? "يرجى كتابة الرقم مع مفتاح الدولة لتسهيل التواصل الفوري عبر الواتساب"
                        : "Please include country code for quick WhatsApp follow-up"}
                    </p>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs md:text-sm font-medium text-foreground flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{isRtl ? "البريد الإلكتروني (اختياري)" : "Email Address (Optional)"}</span>
                    </label>
                    <Input
                      type="email"
                      dir="ltr"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-background/50 h-11"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Service Platform / Type */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                  <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    2
                  </span>
                  <h3 className="font-bold text-base md:text-lg text-foreground">
                    {isRtl ? "نوع المنصة أو الخدمة" : "Service Category or Platform"}
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PLATFORM_OPTIONS.map((opt) => {
                    const isSelected = serviceType === opt.id;
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setServiceType(opt.id)}
                        className={`group p-3.5 sm:p-4 rounded-2xl border text-start transition-all relative flex flex-col justify-between gap-3 cursor-pointer ${
                          isSelected
                            ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/40 -translate-y-0.5"
                            : "border-border/80 bg-background/60 hover:bg-accent/40 hover:border-border hover:-translate-y-0.5"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className={`p-2.5 rounded-xl border transition-colors ${opt.bgColor}`}>
                            <opt.icon className={`w-5 h-5 ${opt.iconColor}`} />
                          </div>
                          {isSelected ? (
                            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          ) : (
                            <span className="w-4 h-4 rounded-full border border-border/80 group-hover:border-primary/50 transition-colors" />
                          )}
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-bold text-foreground block">
                            {isRtl ? opt.nameAr : opt.nameEn}
                          </span>
                          <span className="text-[10px] text-muted-foreground block mt-0.5 line-clamp-1">
                            {isRtl ? opt.subAr : opt.nameEn}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Details & Requirements */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                  <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    3
                  </span>
                  <h3 className="font-bold text-base md:text-lg text-foreground">
                    {isRtl ? "تفاصيل الطلب والميزانية" : "Request Details & Budget"}
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* Target Link */}
                  <div className="space-y-1.5">
                    <label className="text-xs md:text-sm font-medium text-foreground flex items-center gap-1.5">
                      <ExternalLink className="w-4 h-4 text-primary" />
                      <span>
                        {isRtl ? "رابط الحساب أو المنشور المستهدف (إن وجد)" : "Target Account or Post Link (If applicable)"}
                      </span>
                    </label>
                    <Input
                      dir="ltr"
                      placeholder="https://..."
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      className="bg-background/50 h-11"
                    />
                  </div>

                  {/* Budget Presets */}
                  <div className="space-y-2">
                    <label className="text-xs md:text-sm font-medium text-foreground flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-emerald-500" />
                      <span>{isRtl ? "الميزانية المتوقعة (اختياري)" : "Estimated Budget (Optional)"}</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {BUDGET_PRESETS.map((preset) => {
                        const isSelected = budget === preset.id;
                        return (
                          <button
                            type="button"
                            key={preset.id}
                            onClick={() => setBudget(isSelected ? "" : preset.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                              isSelected
                                ? "bg-emerald-500 text-white border-emerald-500 shadow-xs"
                                : "bg-background/50 border-border text-muted-foreground hover:text-foreground hover:bg-accent"
                            }`}
                          >
                            {isRtl ? preset.labelAr : preset.labelEn}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Requirements Textarea */}
                  <div className="space-y-1.5">
                    <label className="text-xs md:text-sm font-medium text-foreground flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-primary" />
                      <span>{isRtl ? "تفاصيل ومتطلبات الخدمة بدقة" : "Detailed Requirements"}</span>
                      <span className="text-red-500 font-bold">*</span>
                    </label>
                    <Textarea
                      required
                      rows={5}
                      placeholder={
                        isRtl
                          ? "اكتب هنا كل التفاصيل: مثلاً نوع الدعم المطلوب، العدد التقريبي، المدة الزمنية المفضلة، أي ملاحظات خاصة بالحساب أو التصميم..."
                          : "Describe your requirements in detail: desired quantity, target deadline, specific preferences, notes..."
                      }
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      className="bg-background/50 leading-relaxed resize-y min-h-[120px]"
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="lg"
                  className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20 gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      <span>{isRtl ? "جارٍ إرسال طلبك..." : "Submitting..."}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>{isRtl ? "إرسال الطلب الآن إلى الإدارة" : "Submit Service Request Now"}</span>
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground mt-3">
                  {isRtl
                    ? "بإرسالك لهذا النموذج، سيتم حفظ الطلب في نظامنا وسيقوم مندوبنا بالتواصل معك."
                    : "By submitting, your request is logged into our system and an agent will reach out to you."}
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Success Dialog */}
      <Dialog open={!!successData} onOpenChange={(open) => !open && setSuccessData(null)}>
        <DialogContent className="sm:max-w-md text-center p-6 sm:p-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4 ring-8 ring-emerald-500/5">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>

          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground">
              {isRtl ? "تم استلام طلبك بنجاح!" : "Request Received Successfully!"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-2">
              {isRtl
                ? `شكراً لك يا ${successData?.fullName || ""}. تم تسجيل طلبك في نظامنا تحت رقم مرجعي:`
                : `Thank you ${successData?.fullName || ""}. Your request has been logged with reference ID:`}
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 p-3 rounded-xl bg-card border border-border inline-block mx-auto">
            <span className="text-xs text-muted-foreground block mb-0.5">
              {isRtl ? "رقم الطلب المرجعي" : "Reference ID"}
            </span>
            <span className="text-xl font-extrabold text-primary font-mono tracking-wider">
              #{successData?.id}
            </span>
          </div>

          <p className="text-xs text-muted-foreground mb-6">
            {isRtl
              ? "سيقوم فريق الدعم الفني بمراجعة طلبك والتواصل معك فوراً عبر الواتساب أو الهاتف."
              : "Our team will review your requirements and get in touch with you shortly via WhatsApp or Phone."}
          </p>

          <div className="space-y-2">
            <a
              href={getWhatsAppDirectLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all hover:scale-[1.02]"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{isRtl ? "متابعة الطلب على الواتساب فوراً" : "Follow up on WhatsApp Directly"}</span>
            </a>

            <Button
              variant="outline"
              onClick={() => setSuccessData(null)}
              className="w-full py-2.5 text-sm"
            >
              {isRtl ? "إغلاق والعودة" : "Close and Return"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}
