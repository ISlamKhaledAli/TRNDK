import { Link } from "react-router-dom";
import { Mail, Phone, MessageCircle, Youtube, Instagram, Facebook, Twitter, Send } from "lucide-react";
import { FaTiktok } from "react-icons/fa";
import { FaSnapchat } from "react-icons/fa6";
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
                <Link to="https://trndk.com/about/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer.aboutUs", "About Us")}
                </Link>
              </li>
              <li>
                <Link to="https://trndk.com/portfolio/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                   {t("footer.ourWorkGallery", "Business Gallery")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4 text-primary">{t("footer.ourServices")}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/services?category=Business Solutions" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("common:categories.businessSolutions")}
                </Link>
              </li>
              <li>
                <Link to="/services?category=Best Sellers" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("common:categories.bestSellers")}
                </Link>
              </li>
              <li>
                <Link to="/services?category=Creative Design" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("common:categories.creativeDesign")}
                </Link>
              </li>
              <li>
                <Link to="/services?category=Video Production" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("common:categories.videoProduction")}
                </Link>
              </li>
              <li>
                <Link to="/services?category=Web Design" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("common:categories.webDesign")}
                </Link>
              </li>
              <li>
                <Link to="/services?category=Growth Services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("common:categories.growthServices")}
                </Link>
              </li>
              <li>
                <Link to="/services?category=Digital Library" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("common:categories.digitalLibrary")}
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
                <span dir="ltr">+966*******</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>support@trndk.com</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageCircle className="w-4 h-4" />
                <span>{t("footer.whatsappSupport")}</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Send className="w-4 h-4" />
                <a href="https://t.me/TrndkSupport" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">{t("footer.telegramSupport")}</a>
              </li>
            </ul>
            <div className="flex items-center gap-3 mt-4">
              {[
                { icon: Youtube, label: "YouTube", href: "https://www.youtube.com/@trndk_CO" },
                { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/trndk.co/" },
                { icon: Facebook, label: "Facebook", href: "https://www.facebook.com/trndk.co/" },
                { icon: FaTiktok, label: "TikTok", href: "https://www.tiktok.com/@trndk.co?lang=ar" },
                { icon: Twitter, label: "X (Twitter)", href: "https://x.com/trndk_co" },
                { icon: FaSnapchat, label: "Snapchat", href: "https://snapchat.com/t/Ux4RFL8q" },
              ].map((social) => (
                <a 
                  key={social.label}
                  href={social.href} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-muted hover:bg-primary/20 hover:text-primary transition-all"
                  aria-label={social.label}
                  title={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
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
