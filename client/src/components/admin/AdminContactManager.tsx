/**
 * client/src/components/admin/AdminContactManager.tsx
 * 
 * Admin settings component for the floating contact button.
 * Allows managing channel (WhatsApp / Telegram / Both), numbers, handles,
 * position (Right / Left), messages, and live previewing in Light/Dark modes.
 */

import React, { useState, useEffect } from "react";
import {
  MessageCircle,
  Save,
  RotateCcw,
  Sparkles,
  Smartphone,
  Send,
  Eye,
  CheckCircle2,
  Moon,
  Sun,
  Languages,
  HelpCircle,
  ShieldCheck,
  Check,
  Phone
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { apiClient } from "@/services/api";
import { ContactButtonConfig, DEFAULT_CONTACT_BUTTON_CONFIG } from "@shared/schema";
import FloatingContactWidget from "@/components/common/FloatingContactWidget";
import { useTheme } from "next-themes";

export const AdminContactManager: React.FC = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const { resolvedTheme } = useTheme();

  const [config, setConfig] = useState<ContactButtonConfig>(DEFAULT_CONTACT_BUTTON_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Live preview state: Automatically follows system / app theme (light or dark)
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark">(
    (resolvedTheme as "light" | "dark") || "light"
  );
  const [previewLang, setPreviewLang] = useState<"ar" | "en">("ar");

  // Keep preview synced with system theme changes
  useEffect(() => {
    if (resolvedTheme === "light" || resolvedTheme === "dark") {
      setPreviewTheme(resolvedTheme);
    }
  }, [resolvedTheme]);

  // Load config on mount
  useEffect(() => {
    let isMounted = true;
    apiClient
      .getContactButton()
      .then((res) => {
        if (isMounted && res?.data) {
          setConfig(res.data);
        }
      })
      .catch((err) => {
        console.error("Error loading contact button settings:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      const res = await apiClient.updateContactButton(config);
      if (res?.data) {
        setConfig(res.data);
        // Dispatch window event so any open widgets immediately sync
        window.dispatchEvent(
          new CustomEvent("trndk:contact-config-updated", { detail: res.data })
        );
      }
      toast.success(
        isRtl
          ? "تم حفظ إعدادات زر التواصل بنجاح!"
          : "Contact button settings saved successfully!"
      );
    } catch (err: any) {
      toast.error(
        err.message ||
          (isRtl ? "حدث خطأ أثناء حفظ الإعدادات" : "Failed to save settings")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (
      window.confirm(
        isRtl
          ? "هل أنت متأكد من استعادة الإعدادات الافتراضية لزر التواصل؟"
          : "Are you sure you want to restore default contact button settings?"
      )
    ) {
      setConfig({ ...DEFAULT_CONTACT_BUTTON_CONFIG });
      toast.info(isRtl ? "تم استعادة القيم الافتراضية" : "Defaults restored");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 bg-card rounded-2xl border border-border">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner & Description */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-primary/10 to-sky-500/10 border border-emerald-500/20 rounded-3xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-500 dark:text-emerald-400">
                <MessageCircle className="w-5 h-5" />
              </span>
              <h3 className="text-xl font-bold tracking-tight text-foreground">
                {isRtl ? "إعدادات زر التواصل السريع العائم" : "Floating Contact Widget Settings"}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
              {isRtl
                ? "يمكنك التحكم في زر التواصل الذي يظهر لزوار المتجر، وتوجيهه إلى الواتساب أو التليجرام أو كلاهما معاً، وضبط الرسائل التلقائية وموقع الزر على اليمين أو اليسار مع دعم المظهر الداكن والفاتح."
                : "Manage the customer support button shown on the store, route to WhatsApp, Telegram or both, set position, default messages, and preview in dark & light themes."}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold transition-all shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isRtl ? "استعادة الافتراضي" : "Reset Defaults"}</span>
            </button>
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold shadow-lg shadow-primary/25 transition-all transform active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? (isRtl ? "جاري الحفظ..." : "Saving...") : (isRtl ? "حفظ التغييرات" : "Save Changes")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- LIVE INTERACTIVE PREVIEW SECTION --- */}
      <div className="bg-card rounded-3xl border border-border p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            <h4 className="font-bold text-base">
              {isRtl ? "معاينة حية تفاعلية (Live Preview)" : "Interactive Live Preview"}
            </h4>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20">
              {isRtl ? "تجربة فورية" : "Real-time"}
            </span>
          </div>

          {/* Theme & Language Toggles for Preview */}
          <div className="flex items-center gap-2">
            {/* Lang toggle */}
            <div className="flex items-center bg-muted p-1 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setPreviewLang("ar")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  previewLang === "ar"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                عربي
              </button>
              <button
                type="button"
                onClick={() => setPreviewLang("en")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  previewLang === "en"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                EN
              </button>
            </div>

            {/* Theme toggle */}
            <div className="flex items-center bg-muted p-1 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setPreviewTheme(resolvedTheme === "dark" ? "dark" : "light")}
                title={isRtl ? "مزامنة مع سمة النظام" : "Sync with System Theme"}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  previewTheme === resolvedTheme
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{isRtl ? "تلقائي (النظام)" : "Auto (System)"}</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewTheme("dark")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  previewTheme === "dark" && previewTheme !== resolvedTheme
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>{isRtl ? "داكن" : "Dark"}</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewTheme("light")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  previewTheme === "light" && previewTheme !== resolvedTheme
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>{isRtl ? "فاتح" : "Light"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Preview Sandbox Box */}
        <div
          className={`mt-4 rounded-2xl p-6 sm:p-10 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[360px] ${
            previewTheme === "dark"
              ? "bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-slate-800 text-white"
              : "bg-gradient-to-b from-slate-50 via-white to-slate-100 border-slate-200 text-slate-900"
          }`}
        >
          {/* Mockup store header snippet */}
          <div className="flex items-center justify-between opacity-60 text-xs border-b pb-3 mb-6 border-current/10">
            <span className="font-bold tracking-wider">TRNDK STORE MOCKUP</span>
            <span>{previewTheme === "dark" ? "🌙 Dark Identity" : "☀️ Light Identity"}</span>
          </div>

          <div className="text-center py-6">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium border border-current/20 mb-2">
              {isRtl ? "جرّب النقر على الزر بالأسفل لاختبار التجربة الحقيقية للعميل" : "Click the button below to test actual customer experience"}
            </span>
            <p className="text-sm opacity-70">
              {config.channel === "whatsapp" && (isRtl ? "الوضع الحالي: تحويل مباشر للواتساب 💬" : "Direct WhatsApp redirection 💬")}
              {config.channel === "telegram" && (isRtl ? "الوضع الحالي: تحويل مباشر للتليجرام ✈️" : "Direct Telegram redirection ✈️")}
              {config.channel === "both" && (isRtl ? "الوضع الحالي: قائمة ذكية منبثقة تجمع الواتساب والتليجرام ✨" : "Smart popup featuring both WhatsApp & Telegram ✨")}
            </p>
          </div>

          {/* Render the actual FloatingContactWidget in preview mode */}
          <div className={`w-full flex ${config.position === "left" ? "justify-start" : "justify-end"}`}>
            <FloatingContactWidget
              customConfig={config}
              isPreview={true}
              previewTheme={previewTheme}
              previewLang={previewLang}
            />
          </div>
        </div>
      </div>

      {/* --- SETTINGS FORM --- */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: MASTER TOGGLE & CHANNEL TYPE */}
        <div className="bg-card rounded-3xl border border-border p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <h4 className="font-bold text-base text-foreground">
                {isRtl ? "الحالة والوجهة الأساسية" : "Status & Channel Destination"}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isRtl
                  ? "حدد ما إذا كان الزر مفعلاً والمنصة التي ترغب في توجيه العملاء إليها"
                  : "Choose whether the button is active and which platform to direct customers to"}
              </p>
            </div>

            {/* Master Toggle */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
              <span className="ms-3 text-sm font-bold text-foreground">
                {config.enabled ? (isRtl ? "مفعّل" : "Enabled") : (isRtl ? "معطّل" : "Disabled")}
              </span>
            </label>
          </div>

          {/* CHANNEL SELECTION CARDS */}
          <div>
            <label className="block text-sm font-semibold mb-3">
              {isRtl ? "اختر وجهة الزر (أين يذهب العميل عند النقر؟)" : "Select Channel Destination"}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Option: BOTH */}
              <button
                type="button"
                onClick={() => setConfig({ ...config, channel: "both" })}
                className={`flex flex-col items-start p-4 rounded-2xl border-2 text-start transition-all relative ${
                  config.channel === "both"
                    ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                    : "border-border bg-card hover:bg-muted/50"
                }`}
              >
                {config.channel === "both" && (
                  <span className="absolute top-3 end-3 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-sky-500 text-white flex items-center justify-center mb-2.5 shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm text-foreground">
                  {isRtl ? "كلاهما معاً (قائمة تفاعلية)" : "Both (Interactive Popup)"}
                </span>
                <span className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {isRtl
                    ? "يفتح نافذة منبثقة فخمة تعرض الواتساب والتليجرام للاختيار بينهما (المفضل)"
                    : "Opens a sleek card popup offering both WhatsApp & Telegram options"}
                </span>
              </button>

              {/* Option: WHATSAPP ONLY */}
              <button
                type="button"
                onClick={() => setConfig({ ...config, channel: "whatsapp" })}
                className={`flex flex-col items-start p-4 rounded-2xl border-2 text-start transition-all relative ${
                  config.channel === "whatsapp"
                    ? "border-emerald-500 bg-emerald-500/5 shadow-md shadow-emerald-500/10"
                    : "border-border bg-card hover:bg-muted/50"
                }`}
              >
                {config.channel === "whatsapp" && (
                  <span className="absolute top-3 end-3 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center mb-2.5 shadow-sm">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.991.564 1.775.814 2.802.814l.006.001a5.77 5.77 0 0 0 5.767-5.767c.001-3.181-2.585-5.768-5.767-5.768zm3.385 8.167c-.145.407-.745.748-1.026.793-.274.043-.629.071-1.018-.053-.404-.128-1.034-.343-1.849-1.069-.99-.884-1.636-1.996-1.78-2.203-.146-.207-.384-.51-.384-.972 0-.462.242-.69.328-.785.086-.095.188-.119.251-.119.064 0 .128.001.184.004.059.002.137-.022.213.16.078.188.267.653.29.701.023.048.039.105.008.168-.031.063-.047.102-.093.156-.047.055-.098.122-.14.164-.047.047-.097.098-.042.193.055.094.244.402.524.651.36.321.663.42.757.467.094.047.151.039.207-.024.055-.064.236-.274.298-.369.063-.094.126-.079.212-.047.086.031.547.258.641.305.094.047.157.071.18.11.023.039.023.232-.122.639z" />
                    <path d="M12 2C6.486 2 2 6.486 2 12c0 1.944.557 3.757 1.518 5.292L2.053 22l4.851-1.428C8.384 21.493 10.137 22 12 22c5.514 0 10-4.486 10-10S17.514 2 12 2zm0 18.286c-1.688 0-3.255-.494-4.576-1.343l-.328-.211-2.871.846.852-2.802-.23-.342A8.257 8.257 0 0 1 3.714 12c0-4.568 3.718-8.286 8.286-8.286s8.286 3.718 8.286 8.286-3.718 8.286-8.286 8.286z" />
                  </svg>
                </div>
                <span className="font-bold text-sm text-foreground">
                  {isRtl ? "واتساب فقط (WhatsApp Direct)" : "WhatsApp Only"}
                </span>
                <span className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {isRtl
                    ? "عند النقر يتم فتح محادثة الواتساب فوراً مع الرسالة التلقائية"
                    : "Directly opens WhatsApp chat with the pre-filled message"}
                </span>
              </button>

              {/* Option: TELEGRAM ONLY */}
              <button
                type="button"
                onClick={() => setConfig({ ...config, channel: "telegram" })}
                className={`flex flex-col items-start p-4 rounded-2xl border-2 text-start transition-all relative ${
                  config.channel === "telegram"
                    ? "border-sky-500 bg-sky-500/5 shadow-md shadow-sky-500/10"
                    : "border-border bg-card hover:bg-muted/50"
                }`}
              >
                {config.channel === "telegram" && (
                  <span className="absolute top-3 end-3 w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
                <div className="w-9 h-9 rounded-xl bg-[#229ED9] text-white flex items-center justify-center mb-2.5 shadow-sm">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                  </svg>
                </div>
                <span className="font-bold text-sm text-foreground">
                  {isRtl ? "تليجرام فقط (Telegram Direct)" : "Telegram Only"}
                </span>
                <span className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {isRtl
                    ? "عند النقر يتم فتح حساب أو قناة التليجرام فوراً"
                    : "Directly opens Telegram account or support channel"}
                </span>
              </button>
            </div>
          </div>

          {/* POSITION SELECTOR (Right vs Left) */}
          <div className="pt-2">
            <label className="block text-sm font-semibold mb-2">
              {isRtl ? "موقع الزر على الشاشة" : "Button Screen Position"}
            </label>
            <div className="flex items-center gap-3 max-w-md">
              <button
                type="button"
                onClick={() => setConfig({ ...config, position: "right" })}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all ${
                  config.position === "right"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                <span>➡️ {isRtl ? "يمين الشاشة (الموصى به)" : "Right Side (Recommended)"}</span>
              </button>
              <button
                type="button"
                onClick={() => setConfig({ ...config, position: "left" })}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all ${
                  config.position === "left"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                <span>⬅️ {isRtl ? "يسار الشاشة" : "Left Side"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 2: WHATSAPP CONFIGURATION */}
        <div className="bg-card rounded-3xl border border-border p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-base text-foreground">
              {isRtl ? "بيانات الواتساب (WhatsApp Settings)" : "WhatsApp Settings"}
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                {isRtl ? "رقم الهاتف مع رمز الدولة (مثال: 966597988788+)" : "WhatsApp Phone (e.g. +966597988788)"}
              </label>
              <input
                type="text"
                dir="ltr"
                value={config.whatsappNumber}
                onChange={(e) => setConfig({ ...config, whatsappNumber: e.target.value })}
                placeholder="+966 59 798 8788"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                {isRtl ? "الرسالة التلقائية المسبقة (تظهر تلقائياً للعميل)" : "Pre-filled Greeting Message"}
              </label>
              <input
                type="text"
                value={config.whatsappMessage || ""}
                onChange={(e) => setConfig({ ...config, whatsappMessage: e.target.value })}
                placeholder={isRtl ? "مرحباً، أود الاستفسار عن خدمات متجر TRNDK" : "Hello, I want to inquire about TRNDK services"}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: TELEGRAM CONFIGURATION */}
        <div className="bg-card rounded-3xl border border-border p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-500 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-base text-foreground">
              {isRtl ? "بيانات التليجرام (Telegram Settings)" : "Telegram Settings"}
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                {isRtl ? "اسم المستخدم (Username e.g. @trndk_support)" : "Telegram Username (@username)"}
              </label>
              <input
                type="text"
                dir="ltr"
                value={config.telegramUsername}
                onChange={(e) => setConfig({ ...config, telegramUsername: e.target.value })}
                placeholder="@trndk_support"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                {isRtl ? "رابط مباشر مخصص (اختياري، يترك فارغاً إذا وُجد اسم المستخدم)" : "Direct Link (Optional, e.g. https://t.me/trndk_support)"}
              </label>
              <input
                type="text"
                dir="ltr"
                value={config.telegramLink || ""}
                onChange={(e) => setConfig({ ...config, telegramLink: e.target.value })}
                placeholder="https://t.me/trndk_support"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: TEXTS & EFFECTS */}
        <div className="bg-card rounded-3xl border border-border p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-base text-foreground">
              {isRtl ? "النصوص والمؤثرات البصرية" : "Texts & Visual Effects"}
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                {isRtl ? "نص الزر (بالعربية)" : "Button Text (Arabic)"}
              </label>
              <input
                type="text"
                value={config.buttonText}
                onChange={(e) => setConfig({ ...config, buttonText: e.target.value })}
                placeholder="تواصل معنا"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                {isRtl ? "نص الزر (بالإنجليزية)" : "Button Text (English)"}
              </label>
              <input
                type="text"
                value={config.buttonTextEn || ""}
                onChange={(e) => setConfig({ ...config, buttonTextEn: e.target.value })}
                placeholder="Contact Us"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                {isRtl ? "نص التلميح الترحيبي (عربي)" : "Tooltip Text (Arabic)"}
              </label>
              <input
                type="text"
                value={config.tooltipText || ""}
                onChange={(e) => setConfig({ ...config, tooltipText: e.target.value })}
                placeholder="تواصل مع فريق الدعم الفني مباشرة"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                {isRtl ? "نص التلميح الترحيبي (إنجليزي)" : "Tooltip Text (English)"}
              </label>
              <input
                type="text"
                value={config.tooltipTextEn || ""}
                onChange={(e) => setConfig({ ...config, tooltipTextEn: e.target.value })}
                placeholder="Chat directly with our support team"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Show Tooltip Toggle */}
            <label className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-background hover:bg-muted/30 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={config.showTooltip}
                onChange={(e) => setConfig({ ...config, showTooltip: e.target.checked })}
                className="w-4 h-4 rounded text-primary focus:ring-primary"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">
                  {isRtl ? "إظهار التلميح العائم بجانب الزر" : "Show Floating Tooltip Badge"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {isRtl ? "عرض رسالة دعوة سريعة بجوار الأيقونة لجذب انتباه العميل" : "Shows a subtle invitation pill next to the button"}
                </span>
              </div>
            </label>

            {/* Glow Effect Toggle */}
            <label className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-background hover:bg-muted/30 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={config.glowEffect}
                onChange={(e) => setConfig({ ...config, glowEffect: e.target.checked })}
                className="w-4 h-4 rounded text-primary focus:ring-primary"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">
                  {isRtl ? "تأثير التوهج النبضي (Glow & Pulse Aura)" : "Enable Glowing Pulse Animation"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {isRtl ? "هالة ضوئية نابضة حول الزر تلفت الانتباه وتزيد التفاعل" : "Pulsing radiant aura around the button to boost engagement"}
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-base font-bold shadow-xl shadow-primary/30 transition-all transform active:scale-95 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? (isRtl ? "جاري الحفظ..." : "Saving...") : (isRtl ? "حفظ التغييرات الآن" : "Save Changes Now")}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminContactManager;
