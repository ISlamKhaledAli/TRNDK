import { Link } from "react-router-dom";
import { Mail, Phone, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import Brand from "./Brand";

const Footer = () => {
  const { t } = useTranslation(["common", "auth", "home"]);
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="mb-4 text-center">
              <Brand scale={3}/>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              {t("footer.brandDescription")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-primary">{t("footer.quickLinks")}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer.allServices")}
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("nav.login")}
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("auth:register.title")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4 text-primary">{t("footer.ourServices")}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/services/youtube" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("nav.youtubeServices")}
                </Link>
              </li>
              <li>
                <Link to="/services/instagram" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("nav.instagramServices")}
                </Link>
              </li>
              <li>
                <Link to="/services/tiktok" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("nav.tiktokServices")}
                </Link>
              </li>
              <li>
                <Link to="/services/twitter" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("home:categories.twitterServices")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-primary">{t("footer.contactUs")}</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span dir="ltr">+966 59 798 8788</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>support@trndk.com</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageCircle className="w-4 h-4" />
                <span>{t("footer.whatsappSupport")}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {t("footer.allRightsReserved")}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">{t("footer.taxNumber")}</span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-5 bg-muted rounded flex items-center justify-center text-xs">Visa</div>
              <div className="w-8 h-5 bg-muted rounded flex items-center justify-center text-xs">MC</div>
              <div className="w-8 h-5 bg-muted rounded flex items-center justify-center text-xs">mada</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
