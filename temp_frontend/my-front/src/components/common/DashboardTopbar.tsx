import { Bell, Search, Sun, Moon, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface DashboardTopbarProps {
  isAdmin?: boolean;
}

const DashboardTopbar = ({ isAdmin = false }: DashboardTopbarProps) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation("common");

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("search.placeholder")}
            className="w-full bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg pr-10 pl-4 py-2 text-sm border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
          title={theme === "dark" ? t("theme.switchToLight") : t("theme.switchToDark")}
        >
          {mounted && theme === "dark" ? (
            <Sun className="w-5 h-5 text-muted-foreground" />
          ) : (
            <Moon className="w-5 h-5 text-muted-foreground" />
          )}
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-lg hover:bg-secondary transition-colors relative">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
        </button>

        {/* User */}
        <div className="flex items-center gap-3 pr-3 border-r border-border">
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">
              {isAdmin ? "المدير" : "يوسف أحمد"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isAdmin ? "Admin" : "عضو مميز"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {isAdmin ? "A" : "ي"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardTopbar;
