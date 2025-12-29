import PublicLayout from "@/components/layouts/PublicLayout";
import ServiceCard from "@/components/common/ServiceCard";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Zap, Headphones, Youtube, Instagram, Twitter } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

const features = [
  { icon: Shield, title: "مدفوعات آمنة 100%", description: "جميع المعاملات مشفرة ومحمية" },
  { icon: Zap, title: "تنفيذ فوري للطلبات", description: "ابدأ في استلام الخدمة خلال دقائق" },
  { icon: Headphones, title: "دعم فني متواصل 24/7", description: "فريقنا جاهز لمساعدتك في أي وقت" },
];

const categories = [
  { icon: Youtube, label: "خدمات يوتيوب", href: "/services/youtube", color: "bg-red-500" },
  { icon: Instagram, label: "خدمات انستقرام", href: "/services/instagram", color: "bg-gradient-to-br from-purple-500 to-pink-500" },
  { icon: Twitter, label: "خدمات تويتر", href: "/services/twitter", color: "bg-blue-400" },
];

const HomePage = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await apiClient.getServices();
        const serviceData = response.data || response;
        setServices((Array.isArray(serviceData) ? serviceData : []).slice(0, 4));
      } catch (error) {
        toast.error('Failed to load services');
        console.error('Error:', error);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const formattedServices = services.map((service: any) => ({
    id: service.id?.toString() || service.name,
    title: service.name,
    titleEn: service.name,
    price: service.price / 100,
    image: service.imageUrl || "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=400&fit=crop",
  }));

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-card to-background py-16 md:py-24">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            دعم حسابات التواصل الاجتماعي
            <span className="text-primary block mt-2">بجودة عالية وضمان حقيقي</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            منصة رائدة لخدمات التسويق الإلكتروني. زيادة المتابعين والمشاهدات والتفاعل على جميع منصات التواصل الاجتماعي.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/services"
              className="btn-primary px-8 py-4 rounded-lg font-semibold text-lg inline-flex items-center justify-center gap-2"
            >
              تصفح الخدمات
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link
              to="/register"
              className="btn-outline px-8 py-4 rounded-lg font-semibold text-lg"
            >
              إنشاء حساب مجاني
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 border-b border-border">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-6 rounded-xl bg-card border border-border"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">اختر منصتك المفضلة</h2>
            <p className="text-muted-foreground">نقدم خدمات متنوعة لجميع منصات التواصل الاجتماعي</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {categories.map((cat, index) => (
              <Link
                key={index}
                to={cat.href}
                className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg text-center"
              >
                <div className={`w-16 h-16 mx-auto rounded-2xl ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <cat.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg">{cat.label}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-16 bg-card">
        <div className="container">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">الخدمات الأكثر طلباً</h2>
              <p className="text-muted-foreground">اكتشف خدماتنا الأكثر شعبية</p>
            </div>
            <Link
              to="/services"
              className="hidden sm:flex items-center gap-2 text-primary font-medium hover:underline"
            >
              عرض الكل
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">جاري التحميل...</div>
            ) : formattedServices.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">لا توجد خدمات متاحة</div>
            ) : (
              formattedServices.map((service: any) => (
                <ServiceCard key={service.id} {...service} />
              ))
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default HomePage;
