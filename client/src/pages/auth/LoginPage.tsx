import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { apiClient } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import Brand from "@/components/common/Brand";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation(["auth", "common"]);
  const isRtl = i18n.language === "ar";
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const response = await apiClient.login(email, password);
      login(response.user);

      toast.success(t("common:messages.success"));

      navigate("/");
    } catch (error) {
      toast.error(t("common:messages.error"));
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-2">
          <Brand scale={4} />
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl border border-border p-8">
          <h1 className="text-2xl font-bold text-center mb-2">
            {t("login.title")}
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            {t("login.subtitle")}
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("login.email")}
              </label>
              <div className="relative">
                <Mail
                  className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground ${
                    isRtl ? "right-3" : "left-3"
                  }`}
                />
                <input
                  type="email"
                  name="email"
                  placeholder={t("login.emailPlaceholder")}
                  className={`input-base ${
                    isRtl ? "pr-10" : "pl-10"
                  }`}
                  dir="ltr"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("login.password")}
              </label>
              <div className="relative">
                <Lock
                  className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground ${
                    isRtl ? "right-3" : "left-3"
                  }`}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder={t("login.passwordPlaceholder")}
                  className="input-base pl-10 pr-10"
                  dir="ltr"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors ${
                    isRtl ? "left-3" : "right-3"
                  }`}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between py-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">
                  {t("login.rememberMe")}
                </span>
              </label>

              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                {t("login.forgotPassword")}
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              {loading && (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {t("login.button")}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8">
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  {t("login.orContinueWith")}
                </span>
              </div>
            </div>

            {/* Google */}
            <div className="flex justify-center">
              <a 
                href="/auth/google"
                className="flex items-center justify-center gap-3 px-6 py-2 border border-border rounded-full hover:bg-muted transition-colors w-full max-w-[280px]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                  <path fill="none" d="M1 1h22v22H1z" />
                </svg>
                <span className="text-sm font-medium">
                  {t("login.orContinueWithGoogle", { defaultValue: "Sign in with Google" })}
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Register */}
        <p className="text-center mt-8 text-muted-foreground">
          {t("login.dontHaveAccount")}{" "}
          <Link
            to="/register"
            className="text-primary font-semibold hover:underline"
          >
            {t("login.registerLink")}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
