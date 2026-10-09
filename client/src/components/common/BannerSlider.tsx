import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  ArrowRight,
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
} from "lucide-react";
import { Banner } from "@shared/schema";
import { useTranslation } from "react-i18next";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
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
};

interface BannerSliderProps {
  banners: Banner[];
  autoPlayInterval?: number; // in milliseconds (default: 5000)
}

export default function BannerSlider({
  banners,
  autoPlayInterval = 5500,
}: BannerSliderProps) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  // Filter only active banners
  const activeBanners = (banners || []).filter((b) => b.isActive !== false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = activeBanners.length;

  const goToNext = useCallback(() => {
    if (totalSlides <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
    setProgress(0);
  }, [totalSlides]);

  const goToPrev = useCallback(() => {
    if (totalSlides <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    setProgress(0);
  }, [totalSlides]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setProgress(0);
  };

  // Reset progress when slide changes
  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  // Run or pause progress timer without resetting on unpause
  useEffect(() => {
    if (totalSlides <= 1 || isPaused) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    const stepTime = 50; // update every 50ms
    const stepIncrement = (stepTime / autoPlayInterval) * 100;

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          goToNext();
          return 0;
        }
        return prev + stepIncrement;
      });
    }, stepTime);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPaused, autoPlayInterval, totalSlides, goToNext]);

  // Handle touch gestures for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;

    // Minimum swipe distance
    if (Math.abs(diffX) > 45) {
      if (isRtl) {
        // In RTL, positive diffX (swipe left) moves previous
        if (diffX > 0) goToPrev();
        else goToNext();
      } else {
        if (diffX > 0) goToNext();
        else goToPrev();
      }
    }
    setTouchStartX(null);
  };

  if (!activeBanners || activeBanners.length === 0) {
    return null;
  }

  return (
    <div
      className="relative w-full overflow-hidden select-none group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Aspect Ratio Container with Smooth Rounded Corners & Neon Ring Glow */}
      <div className="relative w-full h-[260px] sm:h-[360px] md:h-[440px] lg:h-[500px] rounded-2xl md:rounded-3xl overflow-hidden border border-border/60 shadow-2xl bg-card">
        {/* Carousel Slides */}
        {activeBanners.map((banner, index) => {
          const isActive = index === currentIndex;
          const imgUrl = banner.imageUrl?.startsWith("http")
            ? banner.imageUrl
            : banner.imageUrl?.startsWith("/")
            ? banner.imageUrl
            : `/${banner.imageUrl}`;

          const displayTitle = isRtl ? banner.title : (banner.titleEn || banner.title);
          const displaySubtitle = isRtl ? banner.subtitle : (banner.subtitleEn || banner.subtitle);
          const displayButtonText = isRtl ? banner.buttonText : (banner.buttonTextEn || banner.buttonText);
          const displayBadgeText = isRtl ? banner.badgeText : (banner.badgeTextEn || banner.badgeText);

          const hasTextContent = Boolean(
            displayTitle || displaySubtitle || displayButtonText || displayBadgeText
          );

          return (
            <div
              key={banner.id || index}
              className={`absolute inset-0 w-full h-full transition-all duration-700 ease-out ${
                isActive
                  ? "opacity-100 z-10 translate-x-0 scale-100"
                  : "opacity-0 z-0 pointer-events-none scale-105"
              }`}
            >
              {/* Background Image */}
              <img
                src={imgUrl}
                alt={displayTitle || "Banner"}
                className="w-full h-full object-cover object-center transform transition-transform duration-1000 ease-out group-hover:scale-[1.02]"
                loading={index === 0 ? "eager" : "lazy"}
              />

              {/* Gradient Overlay for Text Readability (only if slide has text) */}
              {hasTextContent && (
                <div
                  className={`absolute inset-0 ${
                    isRtl
                      ? "bg-gradient-to-t from-black/90 via-black/50 to-transparent sm:bg-gradient-to-l sm:from-black/85 sm:via-black/50 sm:to-transparent"
                      : "bg-gradient-to-t from-black/90 via-black/50 to-transparent sm:bg-gradient-to-r sm:from-black/85 sm:via-black/50 sm:to-transparent"
                  }`}
                />
              )}

              {/* Optional Link Wrapping entire slide if no explicit button */}
              {banner.link && !displayButtonText && (
                <Link
                  to={banner.link}
                  className="absolute inset-0 z-20"
                  aria-label={displayTitle || "Banner link"}
                />
              )}

              {/* Text & Button Overlay Content with Safe Padding from Side Arrows */}
              {hasTextContent && (
                <div className="absolute inset-0 z-20 flex flex-col justify-end sm:justify-center px-16 sm:px-20 md:px-24 py-8 sm:py-10 md:py-14 max-w-2xl text-white">
                  {/* Dynamic Badge */}
                  {displayBadgeText && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 border border-primary/40 backdrop-blur-md text-primary text-xs font-semibold mb-3 w-fit animate-in fade-in duration-500">
                      {(() => {
                        const BadgeIconComp = ICON_MAP[banner.badgeIcon || "Sparkles"] || Sparkles;
                        return <BadgeIconComp className="w-3.5 h-3.5 shrink-0" />;
                      })()}
                      <span>{displayBadgeText}</span>
                    </div>
                  )}

                  {/* Title */}
                  {displayTitle && (
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 leading-tight tracking-tight drop-shadow-md animate-in fade-in slide-in-from-bottom-2 duration-500">
                      {displayTitle}
                    </h2>
                  )}

                  {/* Subtitle */}
                  {displaySubtitle && (
                    <p className="text-sm sm:text-base md:text-lg text-slate-200/90 max-w-xl mb-6 line-clamp-2 sm:line-clamp-3 leading-relaxed drop-shadow animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100">
                      {displaySubtitle}
                    </p>
                  )}

                  {/* Action Button */}
                  {displayButtonText && banner.link && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
                      <Link
                        to={banner.link}
                        className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base bg-primary text-primary-foreground hover:bg-primary/90 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/30"
                      >
                        <span>{displayButtonText}</span>
                        {isRtl ? (
                          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Navigation Arrows (Prev / Next) */}
        {totalSlides > 1 && (
          <>
            {/* Prev Button */}
            <button
              onClick={goToPrev}
              aria-label="Previous Slide"
              className={`absolute top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white transition-all transform hover:scale-110 active:scale-95 shadow-xl ${
                isRtl ? "right-4 sm:right-6" : "left-4 sm:left-6"
              }`}
            >
              {isRtl ? (
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </button>

            {/* Next Button */}
            <button
              onClick={goToNext}
              aria-label="Next Slide"
              className={`absolute top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white transition-all transform hover:scale-110 active:scale-95 shadow-xl ${
                isRtl ? "left-4 sm:left-6" : "right-4 sm:right-6"
              }`}
            >
              {isRtl ? (
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </button>
          </>
        )}

        {/* Dots Pagination Indicators */}
        {totalSlides > 1 && (
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 p-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 shadow-lg">
            {activeBanners.map((_, index) => {
              const isActive = index === currentIndex;
              return (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`h-2.5 transition-all duration-300 rounded-full ${
                    isActive
                      ? "w-8 bg-primary shadow-md shadow-primary/50"
                      : "w-2.5 bg-white/40 hover:bg-white/70"
                  }`}
                />
              );
            })}
          </div>
        )}

        {/* Auto-Slide Progress Bar */}
        {totalSlides > 1 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-30 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-75 ease-linear shadow-[0_0_8px_rgba(var(--primary),0.8)]"
              style={{
                width: `${progress}%`,
                [isRtl ? "marginRight" : "marginLeft"]: 0,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
