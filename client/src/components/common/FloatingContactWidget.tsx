/**
 * client/src/components/common/FloatingContactWidget.tsx
 * 
 * Floating contact widget (WhatsApp & Telegram) with customizable channel,
 * position, direct links or interactive modal, pulse glowing effects,
 * and seamless support for Dark & Light themes in both Arabic (RTL) and English (LTR).
 */

import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Sparkles, Phone, Headphones, ShieldCheck, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { apiClient } from "@/services/api";
import { ContactButtonConfig, DEFAULT_CONTACT_BUTTON_CONFIG } from "@shared/schema";
import { useLocation } from "react-router-dom";
import { useTheme } from "next-themes";

// Clean phone number for WhatsApp wa.me link
const formatWhatsAppUrl = (phone: string, message?: string) => {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const base = `https://wa.me/${cleanPhone}`;
  if (message && message.trim()) {
    return `${base}?text=${encodeURIComponent(message.trim())}`;
  }
  return base;
};

// Clean Telegram username or link
const formatTelegramUrl = (userOrLink: string) => {
  if (!userOrLink) return "https://t.me";
  const trimmed = userOrLink.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  const cleanUser = trimmed.replace(/^@/, "");
  return `https://t.me/${cleanUser}`;
};

export interface FloatingContactWidgetProps {
  customConfig?: ContactButtonConfig;
  isPreview?: boolean;
  previewTheme?: "light" | "dark";
  previewLang?: "ar" | "en";
}

export const FloatingContactWidget: React.FC<FloatingContactWidgetProps> = ({
  customConfig,
  isPreview = false,
  previewTheme,
  previewLang,
}) => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const { resolvedTheme } = useTheme();
  const currentLang = previewLang || (i18n.language === "ar" ? "ar" : "en");
  const isRtl = currentLang === "ar";

  // System & Preview Theme: Follows system theme by default, or previewTheme if explicitly set
  const activeTheme = isPreview
    ? (previewTheme || (resolvedTheme as "light" | "dark") || "light")
    : ((resolvedTheme as "light" | "dark") || "light");
  const isDark = activeTheme === "dark";

  const [config, setConfig] = useState<ContactButtonConfig>(
    customConfig || DEFAULT_CONTACT_BUTTON_CONFIG
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isTooltipDismissed, setIsTooltipDismissed] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Sync when customConfig changes (e.g. in Admin Live Preview)
  useEffect(() => {
    if (customConfig) {
      setConfig(customConfig);
    }
  }, [customConfig]);

  // Load config on mount if not preview
  useEffect(() => {
    if (isPreview) return;

    let isMounted = true;
    apiClient
      .getContactButton()
      .then((res) => {
        if (isMounted && res?.data) {
          setConfig(res.data);
        }
      })
      .catch((err) => {
        console.warn("Could not load contact button settings, using default", err);
      });

    // Custom event listener for immediate updates when admin saves
    const handleConfigUpdate = (e: any) => {
      if (e.detail) {
        setConfig(e.detail);
      }
    };
    window.addEventListener("trndk:contact-config-updated", handleConfigUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("trndk:contact-config-updated", handleConfigUpdate);
    };
  }, [isPreview]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // If in non-preview mode, hide on admin dashboard pages
  if (!isPreview && location.pathname.startsWith("/admin")) {
    return null;
  }

  // If disabled and not in preview, hide
  if (!config.enabled && !isPreview) {
    return null;
  }

  const whatsappLink = formatWhatsAppUrl(config.whatsappNumber, config.whatsappMessage);
  const telegramLink = formatTelegramUrl(config.telegramLink || config.telegramUsername);

  const displayButtonText = isRtl
    ? config.buttonText || "تواصل معنا"
    : config.buttonTextEn || config.buttonText || "Contact Us";

  const displayTooltipText = isRtl
    ? config.tooltipText || "فريق الدعم متاح الآن لمساعدتك"
    : config.tooltipTextEn || config.tooltipText || "Support team is online 24/7";

  const handleMainButtonClick = () => {
    setHasInteracted(true);
    setIsTooltipDismissed(true);

    if (config.channel === "whatsapp") {
      window.open(whatsappLink, "_blank", "noopener,noreferrer");
    } else if (config.channel === "telegram") {
      window.open(telegramLink, "_blank", "noopener,noreferrer");
    } else {
      // Channel === 'both' -> Toggle popup card
      setIsOpen((prev) => !prev);
    }
  };

  const isPositionRight = config.position !== "left";

  // --- RENDER PIECES ---
  const renderButton = (
    <div className="relative group">
      {/* Animated Glow Aura */}
      {config.glowEffect && (
        <span
          className={`absolute -inset-1 rounded-full blur-md opacity-70 group-hover:opacity-100 transition duration-500 animate-pulse ${
            config.channel === "whatsapp"
              ? "bg-emerald-500/60"
              : config.channel === "telegram"
              ? "bg-sky-500/60"
              : "bg-gradient-to-r from-emerald-500 via-primary to-sky-500"
          }`}
        />
      )}

      <button
        onClick={handleMainButtonClick}
        aria-label={displayButtonText}
        className={`relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl transition-all duration-300 transform group-hover:scale-105 active:scale-95 text-white ${
          config.channel === "whatsapp"
            ? "bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-600 shadow-emerald-500/40"
            : config.channel === "telegram"
            ? "bg-gradient-to-br from-sky-400 to-[#229ED9] hover:from-sky-300 hover:to-[#229ED9] shadow-sky-500/40"
            : isDark
            ? "bg-gradient-to-tr from-slate-900 via-slate-800 to-primary shadow-primary/40 border border-white/20"
            : "bg-gradient-to-tr from-primary to-rose-600 shadow-primary/30 border border-white/40"
        }`}
      >
        {/* If open and channel is both, show X icon */}
        {config.channel === "both" && isOpen ? (
          <X className="w-7 h-7 transition-transform duration-300 rotate-90 group-hover:rotate-180" />
        ) : config.channel === "whatsapp" ? (
          <svg className="w-7 h-7 fill-current drop-shadow" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.991.564 1.775.814 2.802.814l.006.001a5.77 5.77 0 0 0 5.767-5.767c.001-3.181-2.585-5.768-5.767-5.768zm3.385 8.167c-.145.407-.745.748-1.026.793-.274.043-.629.071-1.018-.053-.404-.128-1.034-.343-1.849-1.069-.99-.884-1.636-1.996-1.78-2.203-.146-.207-.384-.51-.384-.972 0-.462.242-.69.328-.785.086-.095.188-.119.251-.119.064 0 .128.001.184.004.059.002.137-.022.213.16.078.188.267.653.29.701.023.048.039.105.008.168-.031.063-.047.102-.093.156-.047.055-.098.122-.14.164-.047.047-.097.098-.042.193.055.094.244.402.524.651.36.321.663.42.757.467.094.047.151.039.207-.024.055-.064.236-.274.298-.369.063-.094.126-.079.212-.047.086.031.547.258.641.305.094.047.157.071.18.11.023.039.023.232-.122.639z" />
            <path d="M12 2C6.486 2 2 6.486 2 12c0 1.944.557 3.757 1.518 5.292L2.053 22l4.851-1.428C8.384 21.493 10.137 22 12 22c5.514 0 10-4.486 10-10S17.514 2 12 2zm0 18.286c-1.688 0-3.255-.494-4.576-1.343l-.328-.211-2.871.846.852-2.802-.23-.342A8.257 8.257 0 0 1 3.714 12c0-4.568 3.718-8.286 8.286-8.286s8.286 3.718 8.286 8.286-3.718 8.286-8.286 8.286z" />
          </svg>
        ) : config.channel === "telegram" ? (
          <svg className="w-7 h-7 fill-current drop-shadow" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
          </svg>
        ) : (
          <div className="relative flex items-center justify-center">
            <MessageCircle className="w-7 h-7 transition-transform group-hover:scale-110 drop-shadow" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-slate-900 flex items-center justify-center text-[7px] text-white font-bold">
              W
            </span>
            <span className="absolute -bottom-1 -left-1 w-3.5 h-3.5 rounded-full bg-sky-500 border border-slate-900 flex items-center justify-center text-[7px] text-white font-bold">
              T
            </span>
          </div>
        )}

        {/* Pulsing Green Online Indicator Badge */}
        <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900"></span>
        </span>
      </button>
    </div>
  );

  const renderTooltip = config.showTooltip && !isOpen && !isTooltipDismissed ? (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      onClick={handleMainButtonClick}
      className={`hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl shadow-xl border cursor-pointer transition-all duration-300 transform hover:scale-105 ${
        isDark
          ? "bg-slate-900/90 border-slate-800 text-white shadow-black/30 backdrop-blur-md"
          : "bg-white/95 border-slate-200 text-slate-800 shadow-slate-200/50 backdrop-blur-md"
      }`}
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold">{displayButtonText}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
        <span className="text-[10px] text-muted-foreground">{displayTooltipText}</span>
      </div>
    </div>
  ) : null;

  return (
    <div
      ref={widgetRef}
      dir="ltr"
      className={`${
        isPreview
          ? "relative inline-flex flex-col items-center"
          : `fixed z-40 flex flex-col ${
              isPositionRight
                ? "right-5 sm:right-7 bottom-5 sm:bottom-7 items-end"
                : "left-5 sm:left-7 bottom-5 sm:bottom-7 items-start"
            }`
      } select-none transition-all duration-300 font-sans`}
    >
      {/* --- POPUP MODAL CARD (When channel === 'both' and isOpen) --- */}
      {config.channel === "both" && isOpen && (
        <div
          dir={isRtl ? "rtl" : "ltr"}
          className={`mb-4 w-[330px] sm:w-[360px] max-w-[calc(100vw-32px)] rounded-3xl p-5 shadow-2xl backdrop-blur-2xl transition-all duration-300 transform scale-100 ${
            isPositionRight ? "origin-bottom-right" : "origin-bottom-left"
          } border animate-in fade-in-50 zoom-in-95 ${
            isDark
              ? "bg-slate-950/95 border-slate-800/90 text-white shadow-emerald-950/30 ring-1 ring-white/10"
              : "bg-white/95 border-slate-200/90 text-slate-900 shadow-slate-300/40 ring-1 ring-black/5"
          }`}
        >
          {/* Card Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-rose-500 flex items-center justify-center text-white shadow-md shadow-primary/30">
                  <Headphones className="w-6 h-6 animate-pulse" />
                </div>
                {/* Active pulse status badge */}
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-background"></span>
                </span>
              </div>

              <div>
                <h4 className="font-bold text-base tracking-tight flex items-center gap-1.5">
                  <span>{isRtl ? "الدعم الفني المباشر" : "Customer Support"}</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h4>
                <p className="text-xs text-emerald-500 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                  {isRtl ? "متصل الآن • رد فوري" : "Online • Instant reply"}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Card Body & Welcome Message */}
          <div className="py-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isRtl
                ? "أهلاً بك في TRNDK 👋 يسعدنا تواصلك معنا مباشرة للإجابة على جميع استفساراتك وتنفيذ طلباتك فوراً."
                : "Welcome to TRNDK 👋 We're here to answer all your questions and process your orders instantly."}
            </p>
          </div>

          {/* Contact Channels List */}
          <div className="space-y-2.5">
            {/* WhatsApp Option Button */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="group flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent hover:from-emerald-500/20 hover:to-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/50 transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.991.564 1.775.814 2.802.814l.006.001a5.77 5.77 0 0 0 5.767-5.767c.001-3.181-2.585-5.768-5.767-5.768zm3.385 8.167c-.145.407-.745.748-1.026.793-.274.043-.629.071-1.018-.053-.404-.128-1.034-.343-1.849-1.069-.99-.884-1.636-1.996-1.78-2.203-.146-.207-.384-.51-.384-.972 0-.462.242-.69.328-.785.086-.095.188-.119.251-.119.064 0 .128.001.184.004.059.002.137-.022.213.16.078.188.267.653.29.701.023.048.039.105.008.168-.031.063-.047.102-.093.156-.047.055-.098.122-.14.164-.047.047-.097.098-.042.193.055.094.244.402.524.651.36.321.663.42.757.467.094.047.151.039.207-.024.055-.064.236-.274.298-.369.063-.094.126-.079.212-.047.086.031.547.258.641.305.094.047.157.071.18.11.023.039.023.232-.122.639z" />
                    <path d="M12 2C6.486 2 2 6.486 2 12c0 1.944.557 3.757 1.518 5.292L2.053 22l4.851-1.428C8.384 21.493 10.137 22 12 22c5.514 0 10-4.486 10-10S17.514 2 12 2zm0 18.286c-1.688 0-3.255-.494-4.576-1.343l-.328-.211-2.871.846.852-2.802-.23-.342A8.257 8.257 0 0 1 3.714 12c0-4.568 3.718-8.286 8.286-8.286s8.286 3.718 8.286 8.286-3.718 8.286-8.286 8.286z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">
                      {isRtl ? "واتساب (WhatsApp)" : "WhatsApp Chat"}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold">
                      {isRtl ? "سريع" : "Fast"}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground block font-mono" dir="ltr">
                    {config.whatsappNumber}
                  </span>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <ExternalLink className="w-4 h-4" />
              </div>
            </a>

            {/* Telegram Option Button */}
            <a
              href={telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="group flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-sky-500/10 via-sky-500/5 to-transparent hover:from-sky-500/20 hover:to-sky-500/10 border border-sky-500/20 hover:border-sky-500/50 transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#229ED9] text-white flex items-center justify-center shadow-md shadow-[#229ED9]/30 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">
                      {isRtl ? "تليجرام (Telegram)" : "Telegram Support"}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-400 font-semibold">
                      {isRtl ? "متاح 24/7" : "24/7"}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground block font-mono" dir="ltr">
                    @{config.telegramUsername ? config.telegramUsername.replace(/^@/, '') : 'trndk_support'}
                  </span>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-500 group-hover:bg-[#229ED9] group-hover:text-white transition-colors">
                <ExternalLink className="w-4 h-4" />
              </div>
            </a>
          </div>

          {/* Card Footer Guarantee */}
          <div className="mt-3.5 pt-3 border-t border-border/50 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>{isRtl ? "خدمة عملاء معتمدة وموثوقة 100%" : "Verified 100% Secure Support"}</span>
          </div>
        </div>
      )}

      {/* --- FLOATING TRIGGER BUTTON & CALLOUT TOOLTIP --- */}
      <div className="flex items-center gap-3">
        {isPositionRight ? (
          <>
            {renderTooltip}
            {renderButton}
          </>
        ) : (
          <>
            {renderButton}
            {renderTooltip}
          </>
        )}
      </div>
    </div>
  );
};

export default FloatingContactWidget;
