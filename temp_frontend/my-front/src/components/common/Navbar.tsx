import { Link, NavLink } from "react-router-dom";
import { ShoppingCart, User, Globe, Menu, X, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation("common");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/services", label: t("nav.services") },
    { href: "/services/youtube", label: t("nav.youtubeServices") },
    { href: "/services/instagram", label: t("nav.instagramServices") },
    { href: "/services/tiktok", label: t("nav.tiktokServices") },
  ];

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">س</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg text-foreground">{t("brand.name")}</h1>
              <p className="text-xs text-muted-foreground">{t("brand.subtitle")}</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                end={link.href === "/" || link.href === "/services"}
                className={({ isActive }) =>
                  `relative px-4 py-2 text-sm transition-all rounded-lg ${
                    isActive
                      ? "font-bold text-primary bg-primary/15 shadow-sm border-b-2 border-primary"
                      : "font-medium text-foreground/70 hover:text-foreground hover:bg-accent/50"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <button 
              onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
              className="p-2 rounded-lg hover:bg-accent transition-colors" 
              title={language === "ar" ? "Switch to English" : "التبديل إلى العربية"}
            >
              <Globe className="w-5 h-5 text-muted-foreground" />
              <span className="sr-only">{language === "ar" ? "EN" : "AR"}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
              title={theme === "dark" ? t("theme.switchToLight") : t("theme.switchToDark")}
            >
              {mounted && theme === "dark" ? (
                <Sun className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Moon className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            {/* Cart */}
            <Link to="/checkout" className="p-2 rounded-lg hover:bg-accent transition-colors relative">
              <ShoppingCart className="w-5 h-5 text-muted-foreground" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                2
              </span>
            </Link>

            {/* User / Login */}
            <Link
              to="/login"
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <User className="w-5 h-5" />
              <span>{t("nav.login")}</span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-border animate-fade-in">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                end={link.href === "/" || link.href === "/services"}
                className={({ isActive }) =>
                  `relative block px-4 py-3 text-sm transition-all rounded-lg ${
                    isActive
                      ? "font-bold text-primary bg-primary/15 shadow-sm border-s-4 border-primary"
                      : "font-medium text-foreground/70 hover:text-foreground hover:bg-accent/50"
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            <Link
              to="/login"
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors sm:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <User className="w-5 h-5" />
              <span>{t("nav.login")}</span>
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
