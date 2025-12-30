import PublicLayout from "@/components/layouts/PublicLayout";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Home, Star, Shield, Zap, Headphones, Clock, ShoppingCart, Heart, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  category?: string;
  duration?: string;
  imageUrl?: string;
  isActive?: boolean;
}

const relatedServices = [
  { id: 2, title: "زيادة 1000 لايك فيديو يوتيوب", price: 45, image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=100&h=100&fit=crop" },
  { id: 3, title: "باكيج مشاهدات يوتيوب VIP", price: 99, image: "https://images.unsplash.com/photo-1529539795054-3c162aab037a?w=100&h=100&fit=crop" },
];

const reviews = [
  { name: "أحمد محمد", rating: 5, date: "منذ يومين", comment: "خدمة ممتازة وسريعة جداً. المشتركون وصلوا في أقل من 24 ساعة والعدد ثابت. شكراً لكم على المصداقية." },
  { name: "سارة علي", rating: 5, date: "منذ أسبوع", comment: "تعامل راقي وسرعة في الإنجاز. سأتعامل معكم مرة أخرى بالتأكيد لزيادة اللايكات." },
];

const ServiceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1000);
  const [link, setLink] = useState('');

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await apiClient.getService(Number(id));
        setService(response.data || response);
      } catch (error) {
        toast.error('Failed to load service');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchService();
  }, [id]);

  const handleAddToCart = () => {
    if (!link.trim()) {
      toast.error('Please enter a valid link');
      return;
    }

    if (!service) {
      toast.error('Service not loaded');
      return;
    }

    navigate('/checkout', {
      state: {
        service,
        quantity,
        link,
        totalAmount: Math.round((service.price / 100) * (quantity / 1000))
      }
    });
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="container py-8 text-center text-muted-foreground">جاري التحميل...</div>
      </PublicLayout>
    );
  }

  if (!service) {
    return (
      <PublicLayout>
        <div className="container py-8 text-center text-muted-foreground">الخدمة غير موجودة</div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* Breadcrumb */}
      <div className="bg-card border-b border-border py-4">
        <div className="container">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">
              <Home className="w-4 h-4" />
            </Link>
            <span>/</span>
            <Link to="/services" className="hover:text-foreground transition-colors">
              خدمات
            </Link>
            <span>/</span>
            <span className="text-foreground">{service.name}</span>
          </nav>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Card */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-start justify-between mb-4">
                <span className="bg-success/10 text-success text-xs font-medium px-3 py-1 rounded-full">
                  متاح الآن
                </span>
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                {/* Image */}
                <div className="w-full md:w-64 h-48 md:h-auto rounded-lg overflow-hidden bg-muted shrink-0">
                  <img
                    src={service.imageUrl || "https://images.unsplash.com/photo-1493711662062-fa541f7f3d24?w=400&h=400&fit=crop"}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold mb-2">{service.name}</h1>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">(4.8) تقييم</span>
                    <span className="text-sm text-success flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      ضمان مدى الحياة
                    </span>
                  </div>

                  <p className="text-muted-foreground mb-6">{service.description}</p>

                  {/* Order Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">رابط القناة أو الفيديو</label>
                      <input
                        type="url"
                        placeholder="https://youtube.com/channel/..."
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        className="input-base"
                        dir="ltr"
                      />
                      <p className="text-xs text-muted-foreground mt-1">تأكد من أن الحساب عام وليس خاص.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">الكمية المطلوبة</label>
                      <input
                        type="number"
                        placeholder="1000"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="input-base"
                        dir="ltr"
                      />
                      <p className="text-xs text-muted-foreground mt-1">الحد الأدنى: 100 | الحد الأقصى: 100,000</p>
                    </div>

                    <div className="flex items-center justify-between py-4 border-t border-border">
                      <div>
                        <p className="text-sm text-muted-foreground">وقت التنفيذ المقدر</p>
                        <p className="font-medium flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {service.duration || "24 - 48 ساعة"}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm text-muted-foreground">السعر الإجمالي</p>
                        <p className="text-2xl font-bold text-primary">${((service.price / 100) * (quantity / 1000)).toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button className="p-3 rounded-lg border border-border hover:bg-accent transition-colors">
                        <Heart className="w-5 h-5" />
                      </button>
                      <button onClick={handleAddToCart} className="flex-1 btn-primary py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
                        <ShoppingCart className="w-5 h-5" />
                        إضافة للسلة
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: Shield, title: "ضمان آمن", desc: "حسابك آمن 100%" },
                { icon: Zap, title: "سريع", desc: "بدء التنفيذ في دقائق" },
                { icon: Headphones, title: "دعم 24/7", desc: "متعاونون دائماً" },
              ].map((feature, i) => (
                <div key={i} className="bg-card rounded-xl border border-border p-4 text-center">
                  <feature.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>

            {/* Reviews */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-xl font-bold mb-6">تقييمات العملاء</h2>
              <div className="space-y-4">
                {reviews.map((review, i) => (
                  <div key={i} className="border-b border-border pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{review.name}</h3>
                      <span className="text-xs text-muted-foreground">{review.date}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(review.rating)].map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-warning text-warning" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Related Services */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-bold mb-4">خدمات مشابهة</h3>
              <div className="space-y-3">
                {relatedServices.map((svc) => (
                  <Link
                    key={svc.id}
                    to={`/services/1/${svc.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <img src={svc.image} alt={svc.title} className="w-12 h-12 rounded object-cover" />
                    <div className="flex-1 text-right">
                      <p className="text-sm font-medium line-clamp-2">{svc.title}</p>
                      <p className="text-xs text-primary font-bold">${svc.price}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-primary/10 rounded-xl border border-primary/20 p-6">
              <h3 className="font-bold text-primary mb-3">تنبيهات مهمة</h3>
              <ul className="text-sm space-y-2 text-foreground">
                <li>✓ جميع الخدمات مضمونة 100%</li>
                <li>✓ بدء التنفيذ خلال 24 ساعة</li>
                <li>✓ عدم النقص مضمون</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default ServiceDetailsPage;
