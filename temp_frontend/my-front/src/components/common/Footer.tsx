import { Link } from "react-router-dom";
import { Mail, Phone, MessageCircle } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">س</span>
              </div>
              <span className="font-bold text-lg">ستالكر ستور</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              متجر رائد لخدمات التسويق الإلكتروني ودعم حسابات التواصل الاجتماعي بجودة عالية وضمان حقيقي.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-primary">روابط سريعة</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  جميع الخدمات
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  تسجيل الدخول
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  إنشاء حساب جديد
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4 text-primary">خدماتنا</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/services/youtube" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  خدمات يوتيوب
                </Link>
              </li>
              <li>
                <Link to="/services/instagram" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  خدمات انستقرام
                </Link>
              </li>
              <li>
                <Link to="/services/tiktok" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  خدمات تيك توك
                </Link>
              </li>
              <li>
                <Link to="/services/twitter" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  خدمات تويتر
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-primary">تواصل معنا</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span dir="ltr">+966 59 798 8788</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>support@staalkr.com</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageCircle className="w-4 h-4" />
                <span>واتساب للدعم الفني</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 ستالكر. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">الرقم الضريبي: 310413597400003</span>
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
