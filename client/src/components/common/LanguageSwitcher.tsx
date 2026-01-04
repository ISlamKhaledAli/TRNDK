import { Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "react-i18next";

interface LanguageSwitcherProps {
  className?: string;
}

const LanguageSwitcher = ({ className = "" }: LanguageSwitcherProps) => {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation("common");

  return (
    <button 
      onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
      className={`p-2 rounded-lg hover:bg-accent hover:text-red-600 transition-colors ${className}`}
      title={language === "ar" ? t("language.switchToEnglish") : t("language.switchToArabic")}
    >
      <Globe className="w-5 h-5 text-red-500 hover:text-red-500 transition-colors" />
      <span className="sr-only">{language === "ar" ? "EN" : "AR"}</span>
    </button>
  );
};

export default LanguageSwitcher;
