import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Flame,
  Sparkles,
  Zap,
  Gift,
  Bell,
  Megaphone,
  ArrowLeft,
  ArrowRight,
  X,
  Tag,
  Star,
  ShieldCheck,
} from "lucide-react";
import { apiClient } from "@/services/api";
import { useTranslation } from "react-i18next";
import { AnnouncementBarConfig } from "@shared/schema";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Flame,
  Sparkles,
  Zap,
  Gift,
  Bell,
  Megaphone,
  Tag,
  Star,
  ShieldCheck,
};

interface AnnouncementBarProps {
  initialConfig?: AnnouncementBarConfig;
  isPreview?: boolean;
}

export default function AnnouncementBar({ initialConfig, isPreview = false }: AnnouncementBarProps) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const [config, setConfig] = useState<AnnouncementBarConfig | null>(initialConfig || null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    } else {
      apiClient
        .getAnnouncement()
        .then((res) => {
          if (res?.data) {
            setConfig(res.data);
          }
        })
        .catch(() => {});
    }

    if (!isPreview) {
      const dismissed = sessionStorage.getItem("trndk_announcement_dismissed");
      if (dismissed === "true") {
        setIsDismissed(true);
      }
    }
  }, [initialConfig, isPreview]);

  const handleDismiss = () => {
    if (isPreview) return;
    setIsDismissed(true);
    sessionStorage.setItem("trndk_announcement_dismissed", "true");
  };

  // Resolved text based on active store language
  const activeText = (isAr ? config?.text : (config?.textEn || config?.text)) || "";
  const activeBadge = (isAr ? config?.badge : (config?.badgeEn || config?.badge)) || "";
  const activeLinkText = (isAr
    ? (config?.linkText || "تصفح العروض")
    : (config?.linkTextEn || config?.linkText || "Shop Offers"));

  // Parse messages (splits by | or ✦ if provided, otherwise single message)
  const messageItems = useMemo(() => {
    if (!activeText) return [];
    let parts: string[] = [];
    if (activeText.includes("|")) {
      parts = activeText.split("|").map((s) => s.trim()).filter(Boolean);
    } else if (activeText.includes("✦")) {
      parts = activeText.split("✦").map((s) => s.trim()).filter(Boolean);
    } else {
      parts = [activeText.trim()];
    }

    // Multiply to guarantee seamless looping across wide displays
    const repeatCount = parts.length === 1 ? 4 : 3;
    const list: string[] = [];
    for (let i = 0; i < repeatCount; i++) {
      list.push(...parts);
    }
    return list;
  }, [activeText]);

  if ((!isPreview && isDismissed) || !config || !config.isEnabled || !activeText) {
    return null;
  }

  const IconComponent = ICON_MAP[config.icon || "Flame"] || Flame;

  // Speed class
  const getSpeedClass = () => {
    switch (config.speed) {
      case "slow":
        return "animate-marquee-slow";
      case "fast":
        return "animate-marquee-fast";
      case "normal":
      default:
        return "animate-marquee-normal";
    }
  };

  // Color theme styling - seamless Light Mode & Dark Mode harmony with TRNDK branding
  const getThemeStyles = () => {
    switch (config.style) {
      case "neon":
        return {
          wrapper: "bg-white/95 dark:bg-[#07090e]/95 border-b border-primary/30 text-zinc-900 dark:text-white shadow-sm dark:shadow-[0_2px_15px_rgba(239,68,68,0.2)] backdrop-blur-md",
          fadeLeft: "from-white dark:from-[#07090e]",
          fadeRight: "to-white dark:to-[#07090e]",
          badge: "bg-primary/10 dark:bg-primary/20 text-primary dark:text-red-400 border border-primary/30 dark:border-primary/50 shadow-sm",
          btn: "bg-primary hover:bg-primary/90 text-white shadow-sm shadow-primary/25",
          iconColor: "text-primary dark:text-red-400",
          textColor: "text-zinc-900 dark:text-zinc-100",
          sparkleColor: "text-primary",
          dismissBtn: "bg-zinc-200/80 hover:bg-zinc-300 dark:bg-white/10 dark:hover:bg-white/20 text-zinc-700 dark:text-white/80 border border-zinc-300/60 dark:border-white/10",
        };
      case "gradient":
        return {
          wrapper: "bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 dark:from-[#1e0709] dark:via-primary/90 dark:to-[#290a0d] border-b border-white/15 text-white shadow-md",
          fadeLeft: "from-red-600 dark:from-[#1e0709]",
          fadeRight: "to-orange-600 dark:to-[#290a0d]",
          badge: "bg-black/25 text-amber-300 border border-white/20",
          btn: "bg-white/25 hover:bg-white/35 text-white border border-white/30 backdrop-blur-sm",
          iconColor: "text-amber-300",
          textColor: "text-white",
          sparkleColor: "text-amber-300",
          dismissBtn: "bg-black/25 hover:bg-black/40 text-white/90 border border-white/20",
        };
      case "primary":
        return {
          wrapper: "bg-primary border-b border-primary-foreground/15 text-primary-foreground shadow-md",
          fadeLeft: "from-primary",
          fadeRight: "to-primary",
          badge: "bg-black/20 text-white border border-white/20",
          btn: "bg-black/25 hover:bg-black/40 text-white border border-white/20",
          iconColor: "text-amber-300",
          textColor: "text-white",
          sparkleColor: "text-amber-300",
          dismissBtn: "bg-black/20 hover:bg-black/35 text-white border border-white/20",
        };
      case "dark":
      default:
        return {
          wrapper: "bg-zinc-50/95 dark:bg-[#0c1017]/95 border-b border-primary/20 dark:border-primary/25 text-zinc-900 dark:text-zinc-100 backdrop-blur-md shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)]",
          fadeLeft: "from-zinc-50 dark:from-[#0c1017]",
          fadeRight: "to-zinc-50 dark:to-[#0c1017]",
          badge: "bg-primary/10 dark:bg-primary/15 text-primary border border-primary/25 dark:border-primary/30 shadow-sm",
          btn: "bg-primary hover:bg-primary/90 text-white shadow-sm shadow-primary/20",
          iconColor: "text-amber-500 dark:text-amber-400",
          textColor: "text-zinc-900 dark:text-zinc-100",
          sparkleColor: "text-primary",
          dismissBtn: "bg-zinc-200/80 hover:bg-zinc-300 dark:bg-white/10 dark:hover:bg-white/20 text-zinc-700 dark:text-white/80 border border-zinc-300/60 dark:border-white/10",
        };
    }
  };

  const theme = getThemeStyles();
  const speedClass = getSpeedClass();

  // Single ticker track item component
  const renderTickerItem = (text: string, idx: string | number) => (
    <div
      key={idx}
      dir={isAr ? "rtl" : "ltr"}
      className="inline-flex items-center gap-2.5 sm:gap-3.5 px-3 sm:px-5 shrink-0 select-none"
    >
      {/* Badge with Icon */}
      {activeBadge && (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold shrink-0 transition-transform ${theme.badge}`}
        >
          <IconComponent className={`w-3.5 h-3.5 animate-pulse shrink-0 ${theme.iconColor}`} />
          <span>{activeBadge}</span>
        </span>
      )}

      {/* Main Text */}
      <span className={`font-semibold text-xs sm:text-sm tracking-wide whitespace-nowrap drop-shadow-sm ${theme.textColor}`}>
        {text}
      </span>

      {/* Action Button / Link */}
      {config.link && (
        <Link
          to={config.link}
          className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-bold transition-all shrink-0 ${theme.btn}`}
        >
          <span>{activeLinkText}</span>
          {isAr ? (
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
          ) : (
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          )}
        </Link>
      )}

      {/* Sparkle separator */}
      <span className={`font-bold text-xs sm:text-sm select-none opacity-80 px-1 ${theme.sparkleColor}`}>
        ✦
      </span>
    </div>
  );

  return (
    <aside
      aria-label="شريط إعلانات المتجر"
      className={`relative z-40 transition-all duration-300 overflow-hidden pause-on-hover group py-1.5 sm:py-2 ${theme.wrapper}`}
    >
      <div className="relative w-full flex items-center min-w-0">
        {/* Left Edge Fade Mask */}
        <div
          className={`pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-20 bg-gradient-to-r ${theme.fadeLeft} to-transparent z-10`}
        />

        {/* Right Edge Fade Mask */}
        <div
          className={`pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-20 bg-gradient-to-l ${theme.fadeRight} to-transparent z-10`}
        />

        {/* Continuous Infinite Marquee Track (Double tracks for 100% seamless infinite loop) */}
        <div className="flex-1 min-w-0 overflow-hidden" dir="ltr">
          <div className={`flex w-max will-change-transform ${speedClass}`}>
            {/* Track 1 */}
            <div className="flex items-center shrink-0">
              {messageItems.map((msg, i) => renderTickerItem(msg, `t1-${i}`))}
            </div>

            {/* Track 2 (Exact clone for seamless looping) */}
            <div className="flex items-center shrink-0" aria-hidden="true">
              {messageItems.map((msg, i) => renderTickerItem(msg, `t2-${i}`))}
            </div>
          </div>
        </div>

        {/* Dismiss Button (Sticky on far side) */}
        <div className="shrink-0 z-20 px-2 sm:px-3">
          <button
            onClick={handleDismiss}
            className={`p-1 rounded-full transition-all shadow-sm ${theme.dismissBtn}`}
            aria-label={isAr ? "إغلاق الشريط الإعلاني" : "Dismiss announcement"}
            title={isAr ? "إغلاق" : "Close"}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
