import PublicLayout from "@/components/layouts/PublicLayout";
import { Link } from "react-router-dom";
import { Home, Star, Shield, Zap, Headphones, Clock, ShoppingCart, Heart, CheckCircle } from "lucide-react";

const relatedServices = [
  { id: "youtube-likes", title: "زيادة 1000 لايك فيديو يوتيوب", price: 45, image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=100&h=100&fit=crop" },
  { id: "youtube-vip", title: "باكيج مشاهدات يوتيوب VIP", price: 99, image: "https://images.unsplash.com/photo-1529539795054-3c162aab037a?w=100&h=100&fit=crop" },
  { id: "youtube-comments", title: "زيادة تعليقات عربية مخصصة", price: 30, image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=100&h=100&fit=crop" },
];

const reviews = [
  { name: "أحمد محمد", rating: 5, date: "منذ يومين", comment: "خدمة ممتازة وسريعة جداً. المشتركون وصلوا في أقل من 24 ساعة والعدد ثابت. شكراً لكم على المصداقية." },
  { name: "سارة علي", rating: 5, date: "منذ أسبوع", comment: "تعامل راقي وسرعة في الإنجاز. سأتعامل معكم مرة أخرى بالتأكيد لزيادة اللايكات." },
];

const ServiceDetailsPage = () => {
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
              خدمات يوتيوب
            </Link>
            <span>/</span>
            <span className="text-foreground">زيادة 4000 مشترك يوتيوب للقناة</span>
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
                  موصى به
                </span>
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                {/* Image */}
                <div className="w-full md:w-64 h-48 md:h-auto rounded-lg overflow-hidden bg-muted shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1493711662062-fa541f7f3d24?w=400&h=400&fit=crop"
                    alt="Service"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold mb-2">زيادة 4000 مشترك يوتيوب للقناة</h1>
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

                  <p className="text-muted-foreground mb-6">
                    خدمة متميزة لزيادة مشتركي قناتك على اليوتيوب بطريقة آمنة وفعالة. المشتركون حقيقيون ونضمن عدم النقص. هذه الخدمة تساعد في تفعيل الربح وتحقيق شروط اليوتيوب بسرعة قياسية.
                  </p>

                  {/* Order Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">رابط القناة أو الفيديو</label>
                      <input
                        type="url"
                        placeholder="https://youtube.com/channel/..."
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
                        defaultValue={1000}
                        className="input-base"
                        dir="ltr"
                      />
                      <p className="text-xs text-muted-foreground mt-1">الحد الأدنى: 100 | الحد الأقصى: 10,000</p>
                    </div>

                    <div className="flex items-center justify-between py-4 border-t border-border">
                      <div>
                        <p className="text-sm text-muted-foreground">وقت التنفيذ المقدر</p>
                        <p className="font-medium flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          24 - 48 ساعة
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm text-muted-foreground">السعر الإجمالي</p>
                        <p className="text-2xl font-bold text-primary">150.00 ر.س</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button className="p-3 rounded-lg border border-border hover:bg-accent transition-colors">
                        <Heart className="w-5 h-5" />
                      </button>
                      <button className="flex-1 btn-primary py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
                        <ShoppingCart className="w-5 h-5" />
                        إضافة للسلة
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-xl font-bold mb-4">مميزات الخدمة</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">مشتركين حقيقيين</p>
                    <p className="text-sm text-muted-foreground">حسابات نشطة وفعالة تضمن بقاء العدد.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">دعم فني 24/7</p>
                    <p className="text-sm text-muted-foreground">فريقنا جاهز للمساعدة في أي وقت عبر الواتساب.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">بدون كلمة سر</p>
                    <p className="text-sm text-muted-foreground">لا نطلب كلمة مرور حسابك أبداً. فقط الرابط.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">ضمان التعويض</p>
                    <p className="text-sm text-muted-foreground">نضمن تعويض أي نقص قد يحدث خلال فترة الضمان.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">آراء العملاء</h2>
                <button className="text-sm text-primary hover:underline">عرض كل التقييمات</button>
              </div>
              <div className="space-y-4">
                {reviews.map((review, index) => (
                  <div key={index} className="border-b border-border last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">{review.name[0]}</span>
                        </div>
                        <div>
                          <p className="font-medium">{review.name}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-warning text-warning" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{review.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Why Choose Us */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-bold mb-4">لماذا تختارنا؟</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="text-sm">مدفوعات آمنة 100%</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="text-sm">تنفيذ فوري للطلبات</span>
                </div>
                <div className="flex items-center gap-3">
                  <Headphones className="w-5 h-5 text-primary" />
                  <span className="text-sm">دعم فني متواصل</span>
                </div>
              </div>
            </div>

            {/* Related Services */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-bold mb-4">خدمات ذات صلة</h3>
              <div className="space-y-3">
                {relatedServices.map((service) => (
                  <Link
                    key={service.id}
                    to={`/services/${service.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{service.title}</p>
                      <p className="text-sm text-primary font-bold">{service.price} ر.س</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Affiliate CTA */}
            <div className="bg-primary rounded-xl p-6 text-primary-foreground">
              <h3 className="font-bold mb-2">اشترك في التسويق بالعمولة</h3>
              <p className="text-sm text-primary-foreground/80 mb-4">
                اربح معنا عمولات مجزية من خلال تسويق خدماتنا.
              </p>
              <button className="w-full bg-card text-foreground py-2 rounded-lg font-medium hover:bg-card/90 transition-colors">
                سجل الآن
              </button>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default ServiceDetailsPage;
