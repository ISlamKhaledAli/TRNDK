import { Link, NavLink, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { ShoppingCart, User, Globe, Menu, X, Sun, Moon, LogOut, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "react-i18next";
import Brand from "./Brand";
import { useTheme } from "next-themes";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import NotificationsMenu from "./NotificationsMenu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import CurrencySelector from "./CurrencySelector";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation("common");
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get("category");

  const allNavLinks = [
    { href: "/services?category=Business Solutions", label: t("common:categories.businessSolutions"), category: "Business Solutions" },
    { href: "/services?category=Best Sellers", label: t("common:categories.bestSellers"), category: "Best Sellers" },
    { href: "/services?category=Creative Design", label: t("common:categories.creativeDesign"), category: "Creative Design" },
    { href: "/services?category=Video Production", label: t("common:categories.videoProduction"), category: "Video Production" },
    { href: "/services?category=Web Design", label: t("common:categories.webDesign"), category: "Web Design" },
    { href: "/services?category=Growth Services", label: t("common:categories.growthServices"), category: "Growth Services" },
    { href: "/services?category=Digital Library", label: t("common:categories.digitalLibrary"), category: "Digital Library" },
  ];

  const isLinkActive = (category?: string) => {
    if (location.pathname !== "/services") return false;
    return currentCategory === category;
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Brand scale={3} />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-0.5">
            {allNavLinks.map((link) => {
              const active = isLinkActive(link.category);
              return (
                <NavLink
                  key={link.href}
                  to={link.href}
                  className={`relative px-1.5 py-2 text-sm transition-all rounded-lg whitespace-nowrap ${
                    active
                      ? "font-bold text-primary bg-primary/15 shadow-sm border-b-2 border-primary"
                      : "font-medium text-foreground/70 hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  {link.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Currency Selector */}
            <div className="hidden sm:block">
              <CurrencySelector />
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-accent transition-colors "
              title={resolvedTheme === "dark" ? t("theme.switchToLight") : t("theme.switchToDark")}
              aria-label={resolvedTheme === "dark" ? t("theme.switchToLight") : t("theme.switchToDark")}
            >
              {mounted && resolvedTheme === "dark" ? (
                <Sun className="w-5 h-5 text-red-500 hover:text-red-600 transition-colors" />
              ) : (
                <Moon className="w-5 h-5 text-red-500 hover:text-red-600 transition-colors" />
              )}
            </button>

            {/* Cart */}
            <Link to="/checkout" className="p-2 rounded-lg hover:bg-accent transition-colors relative">
              <ShoppingCart className="w-5 h-5 text-red-500 hover:text-red-600 transition-colors" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Notifications */}
            {user && <NotificationsMenu />}

            {/* User / Login */}
            {user ? (
              <div className="hidden sm:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-3 pe-3 border-s border-border hover:bg-accent/50 transition-colors rounded-lg p-1 outline-none">
                      <div className="text-start hidden sm:block">
                        <p className="text-sm font-medium text-foreground leading-none mb-1">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground leading-none text-start">
                          {user.role === 'admin' ? t("userMenu.admin") : (user.isVip ? t("userMenu.vip") : t("userMenu.user"))}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-medium text-primary uppercase">
                          {user.name?.charAt(0)}
                        </span>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="text-start">{t("userMenu.title")}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer justify-start gap-2 text-start">
                      <Link to={user.role === 'admin' ? "/admin/dashboard" : "/client/dashboard"}>
                        <LayoutDashboard className="w-4 h-4" />
                        <span>{user.role === 'admin' ? t("userMenu.adminDashboard") : t("client:sidebar.dashboard")}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer justify-start gap-2 text-start">
                      <Link to={user.role === 'admin' ? "/admin/profile" : "/client/profile"}>
                        <Settings className="w-4 h-4" />
                        <span>{t("userMenu.settings")}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="cursor-pointer justify-start gap-2 text-destructive focus:text-destructive text-start"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t("userMenu.logout")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
              >
                <User className="w-5 h-5" />
                <span>{t("nav.login")}</span>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="xl:hidden p-2 rounded-lg hover:bg-accent transition-colors"
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
          <nav className="xl:hidden py-4 border-t border-border animate-fade-in">
            {allNavLinks.map((link) => {
              const active = isLinkActive(link.category);
              return (
                <NavLink
                  key={link.href}
                  to={link.href}
                  className={`relative block px-4 py-3 text-sm transition-all rounded-lg ${
                    active
                      ? "font-bold text-primary bg-primary/15 shadow-sm border-s-4 border-primary"
                      : "font-medium text-foreground/70 hover:text-foreground hover:bg-accent/50"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </NavLink>
              );
            })}
            {user ? (
              <div className="sm:hidden border-t border-border mt-2 pt-2">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 mb-1">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-medium text-primary uppercase">
                      {user.name?.charAt(0)}
                    </span>
                  </div>
                  <div className="text-start">
                    <p className="text-sm font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.role === 'admin' ? t("userMenu.admin") : (user.isVip ? t("userMenu.vip") : t("userMenu.user"))}</p>
                  </div>
                </div>
                <Link
                  to={user.role === 'admin' ? "/admin/dashboard" : "/client/dashboard"}
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-accent/50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>{user.role === 'admin' ? t("userMenu.adminDashboard") : t("client:sidebar.dashboard")}</span>
                </Link>
                <Link
                  to={user.role === 'admin' ? "/admin/profile" : "/client/profile"}
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-accent/50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings className="w-5 h-5" />
                  <span>{t("userMenu.settings")}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>{t("userMenu.logout")}</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors sm:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="w-5 h-5" />
                <span>{t("nav.login")}</span>
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
