import { useMemo } from "react";
import { Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PasswordStrengthProps {
  password: string;
}

const PasswordStrength = ({ password }: PasswordStrengthProps) => {
  const { t } = useTranslation(["auth"]);

  const score = useMemo(() => {
    let s = 0;
    if (password.length > 7) s += 1;
    if (password.length > 11) s += 1;
    if (/[A-Z]/.test(password)) s += 1;
    if (/[0-9]/.test(password)) s += 1;
    if (/[^A-Za-z0-9]/.test(password)) s += 1;
    return s; // Max 5, but let's cap effectively at 4 for 4 bars
  }, [password]);

  const requirements = [
    { label: t("auth:passwordStrength.requirements.length"), met: password.length >= 8 },
    { label: t("auth:passwordStrength.requirements.number"), met: /[0-9]/.test(password) },
    { label: t("auth:passwordStrength.requirements.special"), met: /[^A-Za-z0-9]/.test(password) },
    { label: t("auth:passwordStrength.requirements.uppercase"), met: /[A-Z]/.test(password) },
  ];

  const getStrengthColor = (s: number) => {
    if (s === 0) return "bg-border";
    if (s < 2) return "bg-red-500";
    if (s < 4) return "bg-yellow-500";
    if (s < 5) return "bg-blue-500";
    return "bg-green-500";
  };

  const strengthLabel = useMemo(() => {
    if (!password) return t("auth:passwordStrength.enterPassword");
    if (score < 2) return t("auth:passwordStrength.weak");
    if (score < 4) return t("auth:passwordStrength.fair");
    if (score < 5) return t("auth:passwordStrength.good");
    return t("auth:passwordStrength.strong");
  }, [score, password, t]);

  return (
    <div className="space-y-3 mt-2 animate-in fade-in slide-in-from-top-1 duration-300">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-muted-foreground font-medium">{t("auth:passwordStrength.title")}</span>
        <span className={`text-xs font-bold ${
            score < 2 ? "text-red-500" : 
            score < 4 ? "text-yellow-600" : 
            score < 5 ? "text-blue-500" : "text-green-500"
        }`}>
            {strengthLabel}
        </span>
      </div>
      
      <div className="flex gap-1 h-1.5 w-full">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-full flex-1 rounded-full transition-all duration-500 ${
              score >= level || (score === 0 && level === 0) 
                 ? getStrengthColor(score) 
                 : "bg-muted"
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {requirements.map((req, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
             {req.met ? (
                <Check className="w-3 h-3 text-green-500" />
             ) : (
                <div className="w-3 h-3 rounded-full border border-muted-foreground/30" />
             )}
             <span className={`text-[10px] ${req.met ? "text-foreground" : "text-muted-foreground"}`}>
                {req.label}
             </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrength;
