import {
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  Menu,
} from "lucide-react";
import NotificationsMenu from "./NotificationsMenu";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

interface DashboardTopbarProps {
  isAdmin?: boolean;
}

const DashboardTopbar = ({ isAdmin = false }: DashboardTopbarProps) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation("common");
  const { user, logout } = useAuth();
  const { toggleSidebar, isMobile, isOpen } = useSidebar();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      {/* Mobile Menu Button - Only visible on mobile */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-secondary transition-colors lg:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
          type="button"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
          title={
            theme === "dark"
              ? t("theme.switchToLight")
              : t("theme.switchToDark")
          }
        >
          {mounted && theme === "dark" ? (
            <Sun className="w-5 h-5 text-red-500 hover:text-red-600 transition-colors" />
          ) : (
            <Moon className="w-5 h-5 text-red-500 hover:text-red-600 transition-colors" />
          )}
        </button>

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Notifications */}
        <NotificationsMenu />

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 pe-3 border-s border-border hover:bg-secondary/50 transition-colors rounded-lg p-1 outline-none">
              <div className="text-start hidden sm:block">
                <p className="text-sm font-medium text-foreground leading-none mb-1">
                  {user?.name ||
                    (isAdmin ? t("userMenu.admin") : t("userMenu.user"))}
                </p>
                <p className="text-xs text-muted-foreground leading-none text-start">
                  {user?.role === "admin"
                    ? t("userMenu.admin")
                    : user?.isVip
                    ? t("userMenu.vip")
                    : t("userMenu.user")}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-medium text-primary uppercase">
                  {user?.name?.charAt(0) || (isAdmin ? "A" : "U")}
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-start">
              {t("userMenu.title")}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              asChild
              className="cursor-pointer justify-start gap-2 text-start"
            >
              <Link to={user?.role === "admin" ? "/admin/dashboard" : "/client/dashboard"}>
                <LayoutDashboard className="w-4 h-4" />
                <span>
                  {user?.role === "admin"
                    ? t("userMenu.adminDashboard")
                    : t("userMenu.dashboard", "Dashboard")}
                </span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              asChild
              className="cursor-pointer justify-start gap-2 text-start"
            >
              <Link to={user?.role === "admin" ? "/admin/profile" : "/client/profile"}>
                <Settings className="w-4 h-4" />
                <span>{t("userMenu.settings")}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout()}
              className="cursor-pointer justify-start gap-2 text-destructive focus:text-destructive text-start"
            >
              <LogOut className="w-4 h-4" />
              <span>{t("userMenu.logout")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardTopbar;
