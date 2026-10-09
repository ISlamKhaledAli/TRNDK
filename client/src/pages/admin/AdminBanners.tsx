import { useState, useEffect } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { useLoaderData, useRevalidator, useSearchParams } from "react-router-dom";
import { apiClient } from "@/services/api";
import { toast } from "sonner";
import { Banner, AnnouncementBarConfig } from "@shared/schema";
import AnnouncementBar from "@/components/common/AnnouncementBar";

import {
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Info,
  ExternalLink,
  Upload,
  Link as LinkIcon,
  Sparkles,
  Flame,
  Crown,
  Zap,
  Star,
  ShieldCheck,
  BadgePercent,
  Rocket,
  Heart,
  TrendingUp,
  Trophy,
  Gift,
  Tag,
  Layers,
  Eye,
  X,
  Loader2,
  Bell,
  Megaphone,
  Palette,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export const BADGE_ICONS = [
  { id: "Sparkles", name: "بريق / VIP", icon: Sparkles },
  { id: "Flame", name: "تريند / رائج", icon: Flame },
  { id: "Crown", name: "ملكي / مميز", icon: Crown },
  { id: "Zap", name: "فوري / سرعة", icon: Zap },
  { id: "Star", name: "أفضل تقييم", icon: Star },
  { id: "ShieldCheck", name: "ضمان حقيقي", icon: ShieldCheck },
  { id: "BadgePercent", name: "خصم / عرض", icon: BadgePercent },
  { id: "Rocket", name: "انطلاقة / نمو", icon: Rocket },
  { id: "TrendingUp", name: "زيادة متابعين", icon: TrendingUp },
  { id: "Heart", name: "تفاعل ولايكات", icon: Heart },
  { id: "Trophy", name: "جودة عالية", icon: Trophy },
  { id: "Gift", name: "هدية ومكافأة", icon: Gift },
];

export const ANNOUNCEMENT_ICONS = [
  { id: "Flame", name: "لهب / خصم", icon: Flame },
  { id: "Sparkles", name: "بريق / تميز", icon: Sparkles },
  { id: "Zap", name: "فوري / سرعة", icon: Zap },
  { id: "Gift", name: "هدية ومكافأة", icon: Gift },
  { id: "Bell", name: "تنبيه هام", icon: Bell },
  { id: "Megaphone", name: "إعلان عام", icon: Megaphone },
  { id: "Tag", name: "عرض خاص", icon: Tag },
  { id: "Star", name: "نجمة / مميز", icon: Star },
  { id: "ShieldCheck", name: "ضمان حقيقي", icon: ShieldCheck },
];

interface BannerFormData {
  id?: string;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  link: string;
  buttonText: string;
  buttonTextEn: string;
  badgeText: string;
  badgeTextEn: string;
  badgeIcon: string;
  isActive: boolean;
  order: number;
  imageUrl: string;
  imageFile?: File | null;
}

const LINK_OPTIONS = [
  { label: "جميع الخدمات (/services)", labelEn: "All Services (/services)", value: "/services", defaultBtn: "تصفح الخدمات", defaultBtnEn: "Browse Services" },
  { label: "خدمات إنستغرام (Instagram)", labelEn: "Instagram Services", value: "/services?category=Instagram", defaultBtn: "خدمات إنستغرام", defaultBtnEn: "Instagram Services" },
  { label: "خدمات تيك توك (TikTok)", labelEn: "TikTok Services", value: "/services?category=TikTok", defaultBtn: "خدمات تيك توك", defaultBtnEn: "TikTok Services" },
  { label: "خدمات يوتيوب (YouTube)", labelEn: "YouTube Services", value: "/services?category=YouTube", defaultBtn: "خدمات يوتيوب", defaultBtnEn: "YouTube Services" },
  { label: "خدمات فيسبوك (Facebook)", labelEn: "Facebook Services", value: "/services?category=Facebook", defaultBtn: "خدمات فيسبوك", defaultBtnEn: "Facebook Services" },
  { label: "خدمات أخرى (/services/other)", labelEn: "Other Services", value: "/services/other", defaultBtn: "خدمات أخرى", defaultBtnEn: "Other Services" },
  { label: "صفحة إنشاء حساب جديد (/register)", labelEn: "Register Page (/register)", value: "/register", defaultBtn: "إنشاء حساب مجاني", defaultBtnEn: "Create Free Account" },
  { label: "صفحة تسجيل الدخول (/login)", labelEn: "Login Page (/login)", value: "/login", defaultBtn: "تسجيل الدخول", defaultBtnEn: "Sign In" },
  { label: "برنامج التسويق بالعمولة (/affiliate)", labelEn: "Affiliate Page (/affiliate)", value: "/affiliate", defaultBtn: "انضم الآن", defaultBtnEn: "Join Now" },
  { label: "بدون رابط (صورة للعرض فقط)", labelEn: "No link (display only)", value: "", defaultBtn: "", defaultBtnEn: "" },
  { label: "رابط مخصص أو خارجي...", labelEn: "Custom / External URL...", value: "custom", defaultBtn: "", defaultBtnEn: "" },
];

const AdminBanners = () => {
  const { banners: initialBanners } = useLoaderData() as { banners: Banner[] };
  const { revalidate } = useRevalidator();
  const [banners, setBanners] = useState<Banner[]>(initialBanners || []);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [searchParams, setSearchParams] = useSearchParams();
  const currentTabParam = searchParams.get("tab") === "announcement" ? "announcement" : "banners";
  const [activeTab, setActiveTabState] = useState<"banners" | "announcement">(currentTabParam);

  const setActiveTab = (tab: "banners" | "announcement") => {
    setActiveTabState(tab);
    setSearchParams(tab === "announcement" ? { tab: "announcement" } : {});
  };

  // Announcement Bar State
  const [previewLang, setPreviewLang] = useState<"ar" | "en">("ar");
  const [previewThemeMode, setPreviewThemeMode] = useState<"light" | "dark">("light");

  const [announcementConfig, setAnnouncementConfig] = useState<AnnouncementBarConfig>({
    isEnabled: true,
    text: "🔥 خصم 20% على جميع باقات المتابعين والتفاعل لفترة محدودة! كود: TRNDK20  ✦  ⚡ تسليم فوري وضمان تعويض حقيقي 100% لجميع الحسابات  ✦  👑 خدمات VIP حصرية بأسعار الجملة المباشرة",
    textEn: "🔥 20% OFF on all followers & engagement packages! Code: TRNDK20  ✦  ⚡ Instant Delivery & 100% Real Refill Warranty  ✦  👑 Exclusive VIP Services at Direct Wholesale Rates",
    link: "/services",
    linkText: "تصفح العروض",
    linkTextEn: "Shop Offers",
    badge: "عرض حصري",
    badgeEn: "Special Offer",
    icon: "Flame",
    style: "dark",
    speed: "normal",
  });
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const [announcementLinkType, setAnnouncementLinkType] = useState<string>("/services");

  const [selectedLinkType, setSelectedLinkType] = useState<string>("/services");

  const [formData, setFormData] = useState<BannerFormData>({
    title: "",
    titleEn: "",
    subtitle: "",
    subtitleEn: "",
    link: "",
    buttonText: "",
    buttonTextEn: "",
    badgeText: "TRNDK VIP",
    badgeTextEn: "TRNDK VIP",
    badgeIcon: "Sparkles",
    isActive: true,
    order: 1,
    imageUrl: "",
    imageFile: null,
  });

  const [filePreview, setFilePreview] = useState<string | null>(null);

  // Load Announcement Config
  useEffect(() => {
    apiClient
      .getAnnouncement()
      .then((res) => {
        if (res?.data) {
          setAnnouncementConfig(res.data);
          const link = res.data.link || "";
          const isPre = LINK_OPTIONS.some((opt) => opt.value === link && opt.value !== "custom");
          if (isPre) setAnnouncementLinkType(link);
          else if (link) setAnnouncementLinkType("custom");
          else setAnnouncementLinkType("");
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingAnnouncement(true);
      await apiClient.updateAnnouncement(announcementConfig);
      toast.success(isRtl ? "تم حفظ إعدادات الشريط الإعلاني بنجاح" : "Announcement bar saved successfully");
    } catch (err: any) {
      toast.error(err.message || (isRtl ? "فشل حفظ الشريط الإعلاني" : "Failed to save announcement bar"));
    } finally {
      setSavingAnnouncement(false);
    }
  };

  const handleAnnouncementLinkChange = (val: string) => {
    setAnnouncementLinkType(val);
    if (val === "custom") {
      setAnnouncementConfig((prev) => ({
        ...prev,
        link: prev.link && !LINK_OPTIONS.some((opt) => opt.value !== "custom" && opt.value === prev.link)
          ? prev.link
          : "",
      }));
    } else {
      const matched = LINK_OPTIONS.find((opt) => opt.value === val);
      setAnnouncementConfig((prev) => ({
        ...prev,
        link: val,
        linkText: prev.linkText || (matched?.defaultBtn || "تصفح العروض"),
      }));
    }
  };

  const handleOpenAddModal = () => {
    setEditingBanner(null);
    setSelectedLinkType("/services");
    setFormData({
      title: "",
      titleEn: "",
      subtitle: "",
      subtitleEn: "",
      link: "/services",
      buttonText: "تصفح الخدمات",
      buttonTextEn: "Browse Services",
      badgeText: "TRNDK VIP",
      badgeTextEn: "TRNDK VIP",
      badgeIcon: "Sparkles",
      isActive: true,
      order: (banners?.length || 0) + 1,
      imageUrl: "",
      imageFile: null,
    });
    setFilePreview(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    const bannerLink = banner.link || "";
    const isPredefined = LINK_OPTIONS.some((opt) => opt.value === bannerLink && opt.value !== "custom");
    if (isPredefined) {
      setSelectedLinkType(bannerLink);
    } else if (bannerLink) {
      setSelectedLinkType("custom");
    } else {
      setSelectedLinkType("");
    }

    setFormData({
      id: banner.id,
      title: banner.title || "",
      titleEn: banner.titleEn || "",
      subtitle: banner.subtitle || "",
      subtitleEn: banner.subtitleEn || "",
      link: bannerLink,
      buttonText: banner.buttonText || "",
      buttonTextEn: banner.buttonTextEn || "",
      badgeText: banner.badgeText || "",
      badgeTextEn: banner.badgeTextEn || "",
      badgeIcon: banner.badgeIcon || "Sparkles",
      isActive: banner.isActive !== false,
      order: banner.order || 1,
      imageUrl: banner.imageUrl || "",
      imageFile: null,
    });
    setFilePreview(null);
    setShowModal(true);
  };

  const handleLinkSelectChange = (val: string) => {
    setSelectedLinkType(val);
    if (val === "custom") {
      setFormData((prev) => ({
        ...prev,
        link: prev.link && !LINK_OPTIONS.some((opt) => opt.value !== "custom" && opt.value === prev.link)
          ? prev.link
          : "",
      }));
    } else {
      const matched = LINK_OPTIONS.find((opt) => opt.value === val);
      setFormData((prev) => ({
        ...prev,
        link: val,
        buttonText: matched?.defaultBtn || prev.buttonText,
        buttonTextEn: matched?.defaultBtnEn || prev.buttonTextEn,
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(isRtl ? "حجم الصورة كبير جداً، أقصى حجم 10MB" : "Image size is too large (max 10MB)");
        return;
      }
      setFormData((prev) => ({ ...prev, imageFile: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageFile && !formData.imageUrl) {
      toast.error(isRtl ? "يرجى رفع صورة أو إدخال رابط الصورة" : "Please upload an image or provide an image URL");
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      if (formData.imageFile) {
        data.append("image", formData.imageFile);
      } else if (formData.imageUrl) {
        data.append("imageUrl", formData.imageUrl);
      }
      data.append("title", formData.title);
      data.append("titleEn", formData.titleEn);
      data.append("subtitle", formData.subtitle);
      data.append("subtitleEn", formData.subtitleEn);
      data.append("link", formData.link);
      data.append("buttonText", formData.buttonText);
      data.append("buttonTextEn", formData.buttonTextEn);
      data.append("badgeText", formData.badgeText);
      data.append("badgeTextEn", formData.badgeTextEn);
      data.append("badgeIcon", formData.badgeIcon);
      data.append("isActive", String(formData.isActive));
      data.append("order", String(formData.order));

      if (editingBanner) {
        await apiClient.updateBanner(editingBanner.id, data);
        toast.success(isRtl ? "تم تعديل البانر بنجاح" : "Banner updated successfully");
      } else {
        await apiClient.createBanner(data);
        toast.success(isRtl ? "تمت إضافة البانر بنجاح" : "Banner created successfully");
      }

      setShowModal(false);
      revalidate();
      // Also update local list if revalidate has delay
      const res = await apiClient.getAdminBanners();
      setBanners(res.data || []);
    } catch (err: any) {
      toast.error(err.message || (isRtl ? "حدث خطأ أثناء حفظ البانر" : "Failed to save banner"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isRtl ? "هل أنت متأكد من حذف هذا البانر؟" : "Are you sure you want to delete this banner?")) {
      return;
    }

    try {
      await apiClient.deleteBanner(id);
      toast.success(isRtl ? "تم حذف البانر بنجاح" : "Banner deleted successfully");
      setBanners((prev) => prev.filter((b) => b.id.toString() !== id.toString()));
      revalidate();
    } catch (err: any) {
      toast.error(err.message || (isRtl ? "فشل حذف البانر" : "Failed to delete banner"));
    }
  };

  const handleToggleStatus = async (banner: Banner) => {
    try {
      const updatedStatus = !banner.isActive;
      const data = new FormData();
      data.append("isActive", String(updatedStatus));
      await apiClient.updateBanner(banner.id, data);
      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, isActive: updatedStatus } : b))
      );
      toast.success(
        updatedStatus
          ? isRtl
            ? "تم تفعيل البانر"
            : "Banner activated"
          : isRtl
          ? "تم تعطيل البانر"
          : "Banner deactivated"
      );
      revalidate();
    } catch (err: any) {
      toast.error(err.message || (isRtl ? "فشل تحديث الحالة" : "Failed to update status"));
    }
  };

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const newBanners = [...banners];
    const [moved] = newBanners.splice(index, 1);
    newBanners.splice(targetIndex, 0, moved);

    setBanners(newBanners);
    try {
      const orderedIds = newBanners.map((b) => b.id.toString());
      await apiClient.reorderBanners(orderedIds);
      toast.success(isRtl ? "تم تحديث ترتيب البانرات" : "Banner order updated");
      revalidate();
    } catch (err: any) {
      toast.error(isRtl ? "فشل تغيير الترتيب" : "Failed to update order");
    }
  };

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-primary" />
            {isRtl ? "إدارة الإعلانات والبانرات" : "Ads & Banners Management"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isRtl
              ? "تحكم في الشريط الإعلاني العلوي والبانرات المتحركة في واجهة المتجر"
              : "Manage top announcement bar and homepage sliding banners"}
          </p>
        </div>
        {activeTab === "banners" && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="w-5 h-5" />
            {isRtl ? "إضافة بانر جديد" : "Add New Banner"}
          </button>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 mb-6 border-b border-border pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("banners")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shrink-0 ${
            activeTab === "banners"
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
              : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{isRtl ? "سلايدر البانرات المتحركة" : "Sliding Banners"}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-black/20 font-normal">
            {banners.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("announcement")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shrink-0 ${
            activeTab === "announcement"
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
              : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>{isRtl ? "الشريط الإعلاني العلوي (Announcement Bar)" : "Top Announcement Bar"}</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              announcementConfig.isEnabled
                ? "bg-green-500/20 text-green-400"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {announcementConfig.isEnabled ? (isRtl ? "مفعّل" : "Active") : (isRtl ? "معطّل" : "Off")}
          </span>
        </button>
      </div>

      {/* TAB 2: TOP ANNOUNCEMENT BAR SETTINGS */}
      {activeTab === "announcement" && (
        <div className="space-y-6 animate-in fade-in max-w-full overflow-hidden">
          {/* Live Preview Card */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm max-w-full overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  <span>{isRtl ? "معاينة حية للشريط الإعلاني (Live Preview)" : "Live Announcement Bar Preview"}</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isRtl
                    ? "معاينة فورية تفاعلية: اختبر المظهر بالعربية والإنجليزية، وفي وضع النهار والوضع الليلي:"
                    : "Interactive Live Preview: test in Arabic & English, and across Light & Dark modes:"}
                </p>
              </div>

              {/* Preview Controls: Language + Light/Dark mode */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Language Switch */}
                <div className="inline-flex p-1 rounded-xl bg-muted/70 border border-border text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewLang("ar")}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      previewLang === "ar"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    🇸🇦 العربية
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewLang("en")}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      previewLang === "en"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    🇬🇧 English
                  </button>
                </div>

                {/* Theme Mode Switch */}
                <div className="inline-flex p-1 rounded-xl bg-muted/70 border border-border text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewThemeMode("light")}
                    className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                      previewThemeMode === "light"
                        ? "bg-background text-foreground shadow-sm border border-border"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="معاينة في وضع النهار (Light Mode)"
                  >
                    <span>☀️</span>
                    <span className="hidden sm:inline">Light</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewThemeMode("dark")}
                    className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                      previewThemeMode === "dark"
                        ? "bg-zinc-900 text-white shadow-sm border border-zinc-700"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="معاينة في الوضع الليلي (Dark Mode)"
                  >
                    <span>🌙</span>
                    <span className="hidden sm:inline">Dark</span>
                  </button>
                </div>
              </div>
            </div>

            {announcementConfig.isEnabled ? (
              <div
                className={`rounded-xl overflow-hidden border transition-all ${
                  previewThemeMode === "light"
                    ? "bg-white border-zinc-200 text-zinc-900"
                    : "bg-[#0b0e14] border-primary/20 text-white"
                } ${previewThemeMode}`}
              >
                <AnnouncementBar
                  key={`${JSON.stringify(announcementConfig)}-${previewLang}-${previewThemeMode}`}
                  initialConfig={{
                    ...announcementConfig,
                    text:
                      previewLang === "ar"
                        ? announcementConfig.text
                        : (announcementConfig.textEn || announcementConfig.text),
                    badge:
                      previewLang === "ar"
                        ? announcementConfig.badge
                        : (announcementConfig.badgeEn || announcementConfig.badge),
                    linkText:
                      previewLang === "ar"
                        ? announcementConfig.linkText
                        : (announcementConfig.linkTextEn || announcementConfig.linkText),
                  }}
                  isPreview={true}
                />
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-border bg-muted/30 text-center text-sm text-muted-foreground">
                {isRtl
                  ? "الشريط الإعلاني معطل حالياً (لن يظهر في واجهة الموقع)"
                  : "Announcement bar is currently disabled (hidden on store)"}
              </div>
            )}
          </div>

          {/* Marquee Pro Tip */}
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-3 text-xs text-foreground/90 max-w-full overflow-hidden">
            <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1 min-w-0 flex-1 overflow-hidden">
              <p className="font-bold text-foreground">
                {isRtl
                  ? "شريط إخباري متحرك لانهائي انسيابي يدعم اللغتين (Bilingual Infinite Marquee Ticker):"
                  : "Smooth Bilingual Infinite Marquee Ticker:"}
              </p>
              <p className="text-muted-foreground leading-relaxed break-words">
                {isRtl
                  ? "يدعم الشريط عرض المحتوى بالعربية والإنجليزية تلقائياً وفقاً للغة التي يختارها العميل. يمكنك إدخال عدة إعلانات تفصل بينها بعلامة ( | ) أو ( ✦ ) وسيتم تدويرها بشكل سلس 24/7 دون أي توقف، مع التوقف اللحظي عند وضع مؤشر الفأرة (Hover)."
                  : "Automatically serves Arabic or English according to visitor's selected language. You can input multiple offers separated by ( | ) or ( ✦ ) and they will rotate smoothly. Hovering pauses the animation instantly."}
              </p>
            </div>
          </div>

          {/* Configuration Form */}
          <form onSubmit={handleSaveAnnouncement} className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-6">
            {/* Enable/Disable Switch */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-background border border-border">
              <div>
                <h3 className="font-bold text-foreground text-sm">
                  {isRtl ? "تفعيل الشريط الإعلاني" : "Enable Announcement Bar"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isRtl
                    ? "عرض الشريط الإعلاني في أعلى صفحات المتجر لجميع الزوار"
                    : "Display top announcement bar across all public pages"}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={announcementConfig.isEnabled}
                  onChange={(e) =>
                    setAnnouncementConfig((prev) => ({ ...prev, isEnabled: e.target.checked }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* BILINGUAL SECTION 1: ARABIC (🇸🇦 المحتوى بالعربية) */}
            <div className="p-5 rounded-2xl bg-background border border-border/80 space-y-4">
              <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                <span className="text-base">🇸🇦</span>
                <h3 className="font-bold text-sm text-foreground">
                  {isRtl ? "المحتوى باللغة العربية (Arabic Version)" : "Arabic Content (🇸🇦)"}
                </h3>
              </div>

              {/* Arabic Announcement Text */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  {isRtl ? "نص الإعلان بالعربية (افصل بين العروض بـ | أو ✦) *" : "Arabic Announcement Text *"}
                </label>
                <input
                  type="text"
                  required
                  value={announcementConfig.text}
                  onChange={(e) =>
                    setAnnouncementConfig((prev) => ({ ...prev, text: e.target.value }))
                  }
                  placeholder="مثال: خصم 20% لفترة محدودة! كود: TRNDK20 | تسليم فوري وضمان حقيقي | خدمات VIP حصرية"
                  className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  dir="rtl"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Arabic Badge */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    {isRtl ? "نص الشارة بالعربية (Badge)" : "Arabic Badge Text"}
                  </label>
                  <input
                    type="text"
                    value={announcementConfig.badge || ""}
                    onChange={(e) =>
                      setAnnouncementConfig((prev) => ({ ...prev, badge: e.target.value }))
                    }
                    placeholder="مثال: عرض حصري"
                    className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    dir="rtl"
                  />
                </div>

                {/* Arabic Button Text */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    {isRtl ? "نص الزر بالعربية (Button Text)" : "Arabic Button Text"}
                  </label>
                  <input
                    type="text"
                    value={announcementConfig.linkText || ""}
                    onChange={(e) =>
                      setAnnouncementConfig((prev) => ({ ...prev, linkText: e.target.value }))
                    }
                    placeholder="مثال: تصفح العروض"
                    className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    dir="rtl"
                  />
                </div>
              </div>
            </div>

            {/* BILINGUAL SECTION 2: ENGLISH (🇬🇧 المحتوى بالإنجليزية) */}
            <div className="p-5 rounded-2xl bg-background border border-border/80 space-y-4">
              <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                <span className="text-base">🇬🇧</span>
                <h3 className="font-bold text-sm text-foreground">
                  {isRtl ? "المحتوى باللغة الإنجليزية (English Version)" : "English Content (🇬🇧)"}
                </h3>
              </div>

              {/* English Announcement Text */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  {isRtl
                    ? "نص الإعلان بالإنجليزية (English Announcement Text) (Separate with | or ✦)"
                    : "English Announcement Text (Separate offers with | or ✦)"}
                </label>
                <input
                  type="text"
                  value={announcementConfig.textEn || ""}
                  onChange={(e) =>
                    setAnnouncementConfig((prev) => ({ ...prev, textEn: e.target.value }))
                  }
                  placeholder="e.g. 🔥 20% OFF on all packages! Code: TRNDK20 | ⚡ Instant Delivery & 100% Real Refill | 👑 Exclusive VIP Services"
                  className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-sans"
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* English Badge */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    {isRtl ? "نص الشارة بالإنجليزية (English Badge)" : "English Badge Text"}
                  </label>
                  <input
                    type="text"
                    value={announcementConfig.badgeEn || ""}
                    onChange={(e) =>
                      setAnnouncementConfig((prev) => ({ ...prev, badgeEn: e.target.value }))
                    }
                    placeholder="e.g. Special Offer"
                    className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-sans"
                    dir="ltr"
                  />
                </div>

                {/* English Button Text */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    {isRtl ? "نص الزر بالإنجليزية (English Button Text)" : "English Button Text"}
                  </label>
                  <input
                    type="text"
                    value={announcementConfig.linkTextEn || ""}
                    onChange={(e) =>
                      setAnnouncementConfig((prev) => ({ ...prev, linkTextEn: e.target.value }))
                    }
                    placeholder="e.g. Shop Offers"
                    className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-sans"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* STYLE & SPEED CONTROLS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Style Selector */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  {isRtl ? "النمط اللوني للشريط (متوافق مع اللايت والدارك)" : "Visual Theme / Style (Light & Dark Compatible)"}
                </label>
                <select
                  value={announcementConfig.style || "dark"}
                  onChange={(e) =>
                    setAnnouncementConfig((prev) => ({
                      ...prev,
                      style: e.target.value as "dark" | "gradient" | "neon" | "primary",
                    }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                >
                  <option value="dark">
                    {isRtl ? "الوضع الذكي الفاخر (Cyber Luxury - متكيف لايت ودارك) [مستحسن]" : "Cyber Luxury (Adaptive Light & Dark)"}
                  </option>
                  <option value="neon">
                    {isRtl ? "التوهج النيوني الأحمر (Electric Neon Red)" : "Electric Neon Red"}
                  </option>
                  <option value="gradient">
                    {isRtl ? "التدرج المخملي الملكي (Velvet Fire Gradient)" : "Velvet Fire Gradient"}
                  </option>
                  <option value="primary">
                    {isRtl ? "اللون الأساسي الموحد (Solid Primary Red)" : "Solid Primary Red"}
                  </option>
                </select>
              </div>

              {/* Speed Selector */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  {isRtl ? "سرعة الحركة الانسيابية" : "Ticker Scroll Speed"}
                </label>
                <select
                  value={announcementConfig.speed || "normal"}
                  onChange={(e) =>
                    setAnnouncementConfig((prev) => ({
                      ...prev,
                      speed: e.target.value as "slow" | "normal" | "fast",
                    }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                >
                  <option value="slow">
                    {isRtl ? "بطيء هادئ (Slow - 40s)" : "Slow (40s)"}
                  </option>
                  <option value="normal">
                    {isRtl ? "متوازن واحترافي (Normal - 25s) [مستحسن]" : "Normal (25s) [Recommended]"}
                  </option>
                  <option value="fast">
                    {isRtl ? "سريع وحيوي (Fast - 15s)" : "Fast (15s)"}
                  </option>
                </select>
              </div>
            </div>

            {/* Icon Picker */}
            <div>
              <span className="text-xs font-semibold text-foreground block mb-2">
                {isRtl ? "أيقونة الشارة:" : "Badge Icon:"}
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
                {ANNOUNCEMENT_ICONS.map((item) => {
                  const isSelected = announcementConfig.icon === item.id;
                  const IconComp = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        setAnnouncementConfig((prev) => ({ ...prev, icon: item.id }))
                      }
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs gap-1 transition-all ${
                        isSelected
                          ? "border-primary bg-primary/20 text-primary font-bold shadow-sm ring-1 ring-primary"
                          : "border-border/80 bg-background hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <IconComp className="w-4 h-4 shrink-0" />
                      <span className="text-[10px] truncate w-full text-center">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Link & Link Custom */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                {isRtl ? "رابط التوجيه المشترك (Target Link)" : "Target Link (Optional)"}
              </label>
              <select
                value={announcementLinkType}
                onChange={(e) => handleAnnouncementLinkChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
              >
                {LINK_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {isRtl ? opt.label : opt.labelEn}
                  </option>
                ))}
              </select>

              {announcementLinkType === "custom" && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={announcementConfig.link || ""}
                    onChange={(e) =>
                      setAnnouncementConfig((prev) => ({ ...prev, link: e.target.value }))
                    }
                    placeholder={isRtl ? "مثال: /services أو https://..." : "e.g. /services or https://..."}
                    className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-sans"
                    dir="ltr"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end pt-4 border-t border-border">
              <button
                type="submit"
                disabled={savingAnnouncement}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
              >
                {savingAnnouncement && <Loader2 className="w-4 h-4 animate-spin" />}
                {isRtl ? "حفظ إعدادات الشريط الإعلاني" : "Save Announcement Settings"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 1: SLIDING BANNERS LIST & GUIDELINES */}
      {activeTab === "banners" && (
        <>
          {/* Recommended Dimensions & Guidelines Alert Box */}
          <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-6 mb-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
              {isRtl ? "المقاسات والمواصفات الموصى بها للصور" : "Recommended Image Dimensions & Specs"}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {isRtl
                ? "للحصول على أفضل مظهر جمالي وحركة سلسة تليق بتصميم المنصة، احرص على استخدام صور بهذه المعايير:"
                : "For optimal look and smooth animations fitting the application design, use images following these guidelines:"}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <div className="p-3 rounded-xl bg-background/60 border border-border">
                <span className="text-xs text-muted-foreground block mb-0.5">
                  {isRtl ? "المقاس المثالي (الكمبيوتر)" : "Ideal Desktop Size"}
                </span>
                <span className="font-bold text-primary text-base">1920 × 550 px</span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  {isRtl ? "أو 1400 × 450 px كحد أدنى" : "or 1400 × 450 px min"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-background/60 border border-border">
                <span className="text-xs text-muted-foreground block mb-0.5">
                  {isRtl ? "نسبة العرض للارتفاع" : "Aspect Ratio"}
                </span>
                <span className="font-bold text-foreground text-base">21:9 أو 16:9</span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  {isRtl ? "متجاوبة تلقائياً مع الهواتف" : "Auto-responsive on mobile"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-background/60 border border-border">
                <span className="text-xs text-muted-foreground block mb-0.5">
                  {isRtl ? "الصيغ المدعومة" : "Supported Formats"}
                </span>
                <span className="font-bold text-foreground text-base">WebP / JPG / PNG</span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  {isRtl ? "يُفضل WebP للسرعة الفائقة" : "WebP is best for speed"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-background/60 border border-border">
                <span className="text-xs text-muted-foreground block mb-0.5">
                  {isRtl ? "حجم الملف المفضل" : "Target File Size"}
                </span>
                <span className="font-bold text-foreground text-base">أقل من 1.5 MB</span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  {isRtl ? "لضمان سرعة تحميل الموقع" : "Ensures ultra-fast loading"}
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 p-2.5 rounded-lg border border-primary/10">
              <Info className="w-4 h-4 text-primary shrink-0" />
              <span>
                {isRtl
                  ? "نصيحة: ضع العناصر والنصوص المهمة داخل منتصف الصورة (Safe Area) حتى لا يتم اقتطاعها على شاشات الموبايل."
                  : "Tip: Keep important text and logos in the center safe zone to prevent edge cropping on mobile."}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Banners List */}
      <div className="space-y-4">
        {banners.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <h3 className="text-lg font-semibold text-foreground">
              {isRtl ? "لا توجد بانرات مضافة بعد" : "No banners added yet"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              {isRtl ? "ابدأ بإضافة أول بانر ليظهر في واجهة الموقع" : "Add your first banner to display on the homepage"}
            </p>
            <button
              onClick={handleOpenAddModal}
              className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {isRtl ? "إضافة بانر الآن" : "Add Banner Now"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {banners.map((banner, index) => {
              const imgUrl = banner.imageUrl?.startsWith("http")
                ? banner.imageUrl
                : banner.imageUrl?.startsWith("/")
                ? banner.imageUrl
                : `/${banner.imageUrl}`;

              return (
                <div
                  key={banner.id}
                  className="bg-card rounded-2xl border border-border p-4 transition-all hover:border-primary/40 flex flex-col md:flex-row items-center gap-5 shadow-sm"
                >
                  {/* Reorder Buttons */}
                  <div className="flex md:flex-col gap-1 items-center shrink-0">
                    <button
                      onClick={() => handleMoveOrder(index, "up")}
                      disabled={index === 0}
                      className="p-2 rounded-lg border border-border hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title={isRtl ? "تحريك لأعلى" : "Move Up"}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-muted-foreground px-2 py-1">
                      #{index + 1}
                    </span>
                    <button
                      onClick={() => handleMoveOrder(index, "down")}
                      disabled={index === banners.length - 1}
                      className="p-2 rounded-lg border border-border hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title={isRtl ? "تحريك لأسفل" : "Move Down"}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Image Thumbnail with Click-to-preview */}
                  <div
                    onClick={() => setPreviewImage(imgUrl)}
                    className="relative w-full md:w-56 h-32 rounded-xl overflow-hidden bg-muted border border-border shrink-0 cursor-pointer group"
                  >
                    <img
                      src={imgUrl}
                      alt={banner.title || "Banner"}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Eye className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Banner Content Details */}
                  <div className="flex-1 min-w-0 w-full text-start">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <h3 className="text-base font-bold text-foreground">
                        {banner.title || (isRtl ? "بانر بدون عنوان" : "Untitled Banner")}
                      </h3>
                      {banner.titleEn && (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-sans border border-border/60">
                          🇬🇧 {banner.titleEn}
                        </span>
                      )}
                      {(banner.badgeText || banner.badgeTextEn) && (
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold inline-flex items-center gap-1">
                          {(() => {
                            const MatchedIcon = BADGE_ICONS.find((b) => b.id === banner.badgeIcon)?.icon || Sparkles;
                            return <MatchedIcon className="w-3 h-3 shrink-0" />;
                          })()}
                          <span>{banner.badgeText || banner.badgeTextEn}</span>
                          {banner.badgeText && banner.badgeTextEn && (
                            <span className="text-[10px] opacity-70">({banner.badgeTextEn})</span>
                          )}
                        </span>
                      )}
                      <button
                        onClick={() => handleToggleStatus(banner)}
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1 transition-colors ${
                          banner.isActive !== false
                            ? "bg-green-500/10 text-green-500 border border-green-500/20"
                            : "bg-muted text-muted-foreground border border-border"
                        }`}
                      >
                        {banner.isActive !== false ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            {isRtl ? "مفعّل" : "Active"}
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            {isRtl ? "معطّل" : "Inactive"}
                          </>
                        )}
                      </button>
                    </div>

                    {(banner.subtitle || banner.subtitleEn) && (
                      <div className="space-y-0.5 mb-2">
                        {banner.subtitle && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {banner.subtitle}
                          </p>
                        )}
                        {banner.subtitleEn && (
                          <p className="text-xs text-muted-foreground/80 line-clamp-1 font-sans">
                            🇬🇧 {banner.subtitleEn}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-2">
                      {banner.link && (
                        <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
                          <LinkIcon className="w-3 h-3" />
                          <span className="truncate max-w-[200px]">{banner.link}</span>
                        </span>
                      )}
                      {(banner.buttonText || banner.buttonTextEn) && (
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded-md font-medium inline-flex items-center gap-1.5">
                          <span>{isRtl ? "الزر: " : "Button: "}</span>
                          <span>{banner.buttonText || banner.buttonTextEn}</span>
                          {banner.buttonText && banner.buttonTextEn && (
                            <span className="text-[10px] opacity-70">({banner.buttonTextEn})</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-border">
                    <button
                      onClick={() => handleOpenEditModal(banner)}
                      className="p-2.5 rounded-xl border border-border text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                      title={isRtl ? "تعديل" : "Edit"}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="p-2.5 rounded-xl border border-border text-destructive hover:bg-destructive/10 transition-colors"
                      title={isRtl ? "حذف" : "Delete"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card w-full max-w-3xl rounded-2xl border border-border shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                {editingBanner
                  ? isRtl
                    ? "تعديل البانر"
                    : "Edit Banner"
                  : isRtl
                  ? "إضافة بانر جديد"
                  : "Add New Banner"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-accent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Image Input Section */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">
                  {isRtl ? "صورة البانر *" : "Banner Image *"}
                </label>

                {/* Drag & drop / file picker */}
                <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/50 transition-colors bg-background/40">
                  <input
                    type="file"
                    id="bannerImageInput"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="bannerImageInput"
                    className="cursor-pointer flex flex-col items-center justify-center py-4"
                  >
                    <Upload className="w-8 h-8 text-primary mb-2" />
                    <span className="text-sm font-medium text-foreground">
                      {isRtl ? "انقر لاختيار صورة من جهازك" : "Click to upload an image from your device"}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      {isRtl ? "المقاس الموصى به: 1920×550 بكسل (أقصى حجم: 10MB)" : "Recommended size: 1920×550 px (Max: 10MB)"}
                    </span>
                  </label>
                </div>

                {/* Or Direct Image URL */}
                <div className="pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">
                      {isRtl ? "أو أدخل رابط صورة خارجي (URL):" : "Or enter external Image URL:"}
                    </span>
                  </div>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://example.com/banner.jpg"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                {/* Preview Selected Image */}
                {(filePreview || formData.imageUrl) && (
                  <div className="mt-3 relative rounded-xl overflow-hidden border border-border aspect-[21/9] bg-muted">
                    <img
                      src={filePreview || formData.imageUrl}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                      {isRtl ? "معاينة البانر" : "Preview"}
                    </div>
                  </div>
                )}
              </div>

              {/* Badge Section (الشارة العلوية المميزة) */}
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-primary" />
                    <span>{isRtl ? "الشارة العلوية المميزة (Badge)" : "Top Highlight Badge"}</span>
                  </label>
                  {(formData.badgeText || formData.badgeTextEn) && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 border border-primary/40 backdrop-blur-md text-primary text-xs font-semibold">
                      {(() => {
                        const MatchedIcon = BADGE_ICONS.find((b) => b.id === formData.badgeIcon)?.icon || Sparkles;
                        return <MatchedIcon className="w-3.5 h-3.5 shrink-0" />;
                      })()}
                      <span>{isRtl ? (formData.badgeText || formData.badgeTextEn) : (formData.badgeTextEn || formData.badgeText)}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Arabic Badge */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-1.5">
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">عربي</span>
                      <span>{isRtl ? "نص الشارة بالعربية (اختياري)" : "Arabic Badge Text (Optional)"}</span>
                    </label>
                    <input
                      type="text"
                      value={formData.badgeText}
                      onChange={(e) => setFormData((prev) => ({ ...prev, badgeText: e.target.value }))}
                      placeholder={isRtl ? "مثال: TRNDK VIP أو عرض خاص" : "e.g. TRNDK VIP"}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      dir="rtl"
                    />
                  </div>

                  {/* English Badge */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-1.5">
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 font-sans">EN</span>
                      <span>{isRtl ? "نص الشارة بالإنجليزية (اختياري)" : "English Badge Text (Optional)"}</span>
                    </label>
                    <input
                      type="text"
                      value={formData.badgeTextEn}
                      onChange={(e) => setFormData((prev) => ({ ...prev, badgeTextEn: e.target.value }))}
                      placeholder="e.g. TRNDK VIP or Special Offer"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-sans"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Badge Icon Grid Picker */}
                <div>
                  <span className="text-xs font-medium text-foreground block mb-1.5">
                    {isRtl ? "اختر الأيقونة المناسبة للشارة:" : "Select Badge Icon:"}
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {BADGE_ICONS.map((item) => {
                      const isSelected = formData.badgeIcon === item.id;
                      const IconComponent = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, badgeIcon: item.id }))}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs gap-1 transition-all ${
                            isSelected
                              ? "border-primary bg-primary/20 text-primary font-bold shadow-sm ring-1 ring-primary"
                              : "border-border/80 bg-background/80 hover:bg-muted text-muted-foreground"
                          }`}
                        >
                          <IconComponent className="w-4 h-4 shrink-0" />
                          <span className="text-[10px] truncate w-full text-center">{item.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* BILINGUAL SECTION 1: ARABIC (المحتوى باللغة العربية) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-background/50 border border-border/80 space-y-4">
                <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                  <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    🇸🇦 العربية
                  </span>
                  <h3 className="font-bold text-sm text-foreground">
                    {isRtl ? "المحتوى باللغة العربية (Arabic Version)" : "Arabic Content"}
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      {isRtl ? "العنوان الرئيسي بالعربية (اختياري)" : "Arabic Main Title (Optional)"}
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="مثال: دعم حسابات التواصل الاجتماعي"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      {isRtl ? "النص الفرعي / الوصف بالعربية (اختياري)" : "Arabic Subtitle / Description (Optional)"}
                    </label>
                    <textarea
                      rows={2}
                      value={formData.subtitle}
                      onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                      placeholder="مثال: بجودة عالية وضمان حقيقي - زيادة المتابعين والمشاهدات والتفاعل على جميع المنصات"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      {isRtl ? "نص الزر بالعربية (اختياري)" : "Arabic Button Text (Optional)"}
                    </label>
                    <input
                      type="text"
                      value={formData.buttonText}
                      onChange={(e) => setFormData((prev) => ({ ...prev, buttonText: e.target.value }))}
                      placeholder="مثال: تصفح الخدمات"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      dir="rtl"
                    />
                  </div>
                </div>
              </div>

              {/* BILINGUAL SECTION 2: ENGLISH (المحتوى باللغة الإنجليزية) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-background/50 border border-border/80 space-y-4">
                <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                  <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 font-sans">
                    🇬🇧 English
                  </span>
                  <h3 className="font-bold text-sm text-foreground">
                    {isRtl ? "المحتوى باللغة الإنجليزية (English Version)" : "English Content"}
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      {isRtl ? "العنوان الرئيسي بالإنجليزية (Main Title) (اختياري)" : "English Main Title (Optional)"}
                    </label>
                    <input
                      type="text"
                      value={formData.titleEn}
                      onChange={(e) => setFormData((prev) => ({ ...prev, titleEn: e.target.value }))}
                      placeholder="e.g. Elevate Your Social Presence"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-sans"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      {isRtl ? "النص الفرعي / الوصف بالإنجليزية (Subtitle) (اختياري)" : "English Subtitle / Description (Optional)"}
                    </label>
                    <textarea
                      rows={2}
                      value={formData.subtitleEn}
                      onChange={(e) => setFormData((prev) => ({ ...prev, subtitleEn: e.target.value }))}
                      placeholder="e.g. Premium quality & guaranteed refill - boost followers, views and engagement"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-sans"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      {isRtl ? "نص الزر بالإنجليزية (Button Text) (اختياري)" : "English Button Text (Optional)"}
                    </label>
                    <input
                      type="text"
                      value={formData.buttonTextEn}
                      onChange={(e) => setFormData((prev) => ({ ...prev, buttonTextEn: e.target.value }))}
                      placeholder="e.g. Browse Services"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-sans"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* Link Selection */}
              <div className="p-4 rounded-xl bg-card border border-border space-y-3">
                <label className="block text-sm font-semibold text-foreground">
                  {isRtl ? "صفحة / رابط التوجيه (اختياري)" : "Target Link / Page (Optional)"}
                </label>
                <select
                  value={selectedLinkType}
                  onChange={(e) => handleLinkSelectChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                >
                  {LINK_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {isRtl ? opt.label : opt.labelEn}
                    </option>
                  ))}
                </select>

                {/* Show custom URL text input only if 'custom' is selected */}
                {selectedLinkType === "custom" && (
                  <div className="animate-in fade-in slide-in-from-top-1">
                    <input
                      type="text"
                      value={formData.link}
                      onChange={(e) => setFormData((prev) => ({ ...prev, link: e.target.value }))}
                      placeholder={isRtl ? "أدخل الرابط، مثلاً: /services/1 أو رابط خارجي https://..." : "Enter URL e.g. /services/1 or https://..."}
                      className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-sans"
                      dir="ltr"
                    />
                  </div>
                )}
              </div>

              {/* Active Toggle & Order */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-border">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                    className="w-5 h-5 rounded text-primary focus:ring-primary border-border bg-background"
                  />
                  <div>
                    <span className="text-sm font-semibold text-foreground block">
                      {isRtl ? "تفعيل البانر (عرضه للزوار)" : "Active (Visible to visitors)"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {isRtl ? "إذا تم تعطيله لن يظهر في الصفحة الرئيسية" : "Disabled banners won't show on the homepage"}
                    </span>
                  </div>
                </label>

                {/* Display Order with clear explanation */}
                <div className="flex flex-col items-start sm:items-end gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {isRtl ? "ترتيب العرض:" : "Display Order:"}
                    </span>
                    <input
                      type="number"
                      min="1"
                      value={formData.order}
                      onChange={(e) => setFormData((prev) => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                      className="w-16 px-2.5 py-1.5 rounded-lg bg-background border border-border text-foreground text-center text-sm font-bold focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <span className="text-[11px] text-muted-foreground text-start sm:text-end max-w-xs">
                    {isRtl
                      ? "رقم 1 يظهر أولاً، ثم يليه 2، ثم 3 وهكذا في السلايدر"
                      : "#1 shows first, followed by #2, #3 in the slider sequence"}
                  </span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-border text-muted-foreground hover:bg-accent font-medium transition-colors"
                >
                  {isRtl ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingBanner ? (isRtl ? "حفظ التعديلات" : "Save Changes") : (isRtl ? "إضافة البانر" : "Add Banner")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Image Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-auto max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminBanners;
