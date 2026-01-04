import PublicLayout from "@/components/layouts/PublicLayout";
import { Link, useNavigate, useParams, useLoaderData } from "react-router-dom";
import { Home, Star, Shield, Zap, Headphones, Clock, ShoppingCart, Heart, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { apiClient } from "@/services/api";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { useTranslation } from "react-i18next";
import PriceDisplay from "@/components/common/PriceDisplay";

interface Service {
  id: number;
  name: string;
  nameEn?: string;
  description: string;
  descriptionEn?: string;
  price: number;
  category?: string;
  duration?: string;
  imageUrl?: string;
  isActive?: boolean;
  quantity?: number;
}

interface Review {
  id: number;
  userId: number;
  serviceId: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  userName: string;
}

const ServiceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { service, services } = useLoaderData() as { service: Service, services: Service[] };
  const { addItem, isInWishlist, toggleWishlist } = useCart();
  const { t, i18n } = useTranslation(["serviceDetails", "home", "common"]);
  const isRtl = i18n.language === "ar";
  
  // Localization Helper
  const localizedName = (!isRtl && service.nameEn) ? service.nameEn : service.name;
  const localizedDescription = (!isRtl && service.descriptionEn) ? service.descriptionEn : service.description;

  const [link, setLink] = useState('');
  
  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const serviceId = Number(id);
  const isLoved = isInWishlist(serviceId);

  // Fetch reviews
  useEffect(() => {
    apiClient.getReviews(serviceId)
      .then(data => {
        setReviews(data.data);
      })
      .catch(console.error)
      .finally(() => setLoadingReviews(false));
  }, [serviceId]);

  const handleSubmitReview = async () => {
    try {
      setSubmittingReview(true);
      await apiClient.createReview({
        serviceId,
        rating: newReview.rating,
        comment: newReview.comment
      });
      toast.success(t("serviceDetails:reviews.success"));
      
      // Refresh reviews
      const data = await apiClient.getReviews(serviceId);
      setReviews(data.data);
      setNewReview({ rating: 5, comment: '' });
      setShowReviewForm(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "5.0";

  const relatedServices = Array.isArray(services) 
    ? services
        .filter(s => s.id !== serviceId && s.category === service?.category)
        .slice(0, 3)
    : [];

  const handleAddToCart = () => {
    if (!link.trim()) {
      toast.error(t("serviceDetails:linkError"));
      return;
    }

    if (!service) {
      toast.error(t("serviceDetails:serviceError"));
      return;
    }

    addItem({
      id: Date.now(),
      serviceId: service.id,
      name: service.name,
      price: service.price,
      quantity: service.quantity || 1000,
      link,
      imageUrl: service.imageUrl
    });

    toast.success(t("serviceDetails:addedToCart"));
  };

  const handleToggleWishlist = () => {
    toggleWishlist(serviceId);
    toast.success(isLoved ? t("serviceDetails:wishlistRemove") : t("serviceDetails:wishlistAdd"));
  };

  const features = [
    { icon: Shield, title: t("serviceDetails:features.secure"), desc: t("serviceDetails:features.secureDesc") },
    { icon: Zap, title: t("serviceDetails:features.fast"), desc: t("serviceDetails:features.fastDesc") },
    { icon: Headphones, title: t("serviceDetails:features.support"), desc: t("serviceDetails:features.supportDesc") },
  ];

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
              {t("serviceDetails:backToServices")}
            </Link>
            <span>/</span>
            <span className="text-foreground">{localizedName}</span>
          </nav>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
              {/* Service Card */}
            <div className={`bg-card rounded-xl border border-border p-6 shadow-sm ${!service.isActive ? 'opacity-90' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                {service.isActive !== false ? (
                  <span className="bg-success/10 text-success text-xs font-medium px-3 py-1 rounded-full">
                    {t("serviceDetails:availableNow")}
                  </span>
                ) : (
                  <span className="bg-destructive/10 text-destructive text-xs font-medium px-3 py-1 rounded-full">
                    {t("common:status.unavailable", { defaultValue: "Unavailable" })}
                  </span>
                )}
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                {/* Image */}
                <div className="w-full md:w-64 h-48 md:h-auto rounded-lg overflow-hidden bg-muted shrink-0">
                  <img
                    src={service.imageUrl || "https://images.unsplash.com/photo-1493711662062-fa541f7f3d24?w=400&h=400&fit=crop"}
                    alt={localizedName}
                    className={`w-full h-full object-cover ${service.isActive === false ? 'grayscale' : ''}`}
                  />
                </div>

                {/* Details */}
                <div className="flex-1 text-start">
                  <h1 className="text-2xl font-bold mb-2">{localizedName}</h1>
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < Math.round(Number(averageRating)) ? 'fill-warning text-warning' : 'text-muted-foreground'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {t("serviceDetails:rating", { rating: averageRating, count: reviews.length })}
                    </span>
                    <span className="text-sm text-success flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      {t("serviceDetails:lifetimeGuarantee")}
                    </span>
                  </div>

                  <p className="text-muted-foreground mb-6">{localizedDescription}</p>

                  {/* Order Form */}
                  <div className="space-y-4">
                    <div className="text-start">
                      <label className="block text-sm font-medium mb-2">{t("serviceDetails:linkPlaceholder")}</label>
                      <input
                        type="url"
                        placeholder="https://youtube.com/channel/..."
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        className="input-base w-full bg-secondary text-foreground rounded-lg px-4 py-3 text-sm border border-border focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        dir="ltr"
                        disabled={service.isActive === false}
                      />
                      <p className="text-xs text-muted-foreground mt-1">{t("serviceDetails:linkHint")}</p>
                    </div>

                    <div className="text-start">
                      <p className="text-sm font-medium mb-2">{t("serviceDetails:quantityLabel")}</p>
                      <div className={`input-base bg-secondary text-foreground rounded-lg px-4 py-3 text-sm border border-border flex items-center ${service.isActive === false ? 'opacity-50' : ''}`}>
                        {service.quantity || 1000}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{t("serviceDetails:quantityFixed")}</p>
                    </div>

                    <div className="flex items-center justify-between py-4 border-t border-border">
                      <div className="text-start">
                        <p className="text-sm text-muted-foreground">{t("serviceDetails:estimatedDuration")}</p>
                        <p className="font-medium flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {service.duration || "24 - 48 hours"}
                        </p>
                      </div>
                      <div className="text-end">
                        <p className="text-sm text-muted-foreground">{t("serviceDetails:totalPrice")}</p>
                        <PriceDisplay amount={service.price / 100} isBold className="items-end text-lg" />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={handleToggleWishlist}
                        disabled={service.isActive === false}
                        className="p-3 rounded-lg border border-border hover:bg-accent transition-colors group/heart disabled:opacity-50 disabled:cursor-not-allowed"
                        title={isLoved ? t("serviceDetails:wishlistRemove") : t("serviceDetails:wishlistAdd")}
                      >
                        <Heart className={`w-5 h-5 transition-colors ${isLoved ? 'fill-destructive text-destructive' : 'text-muted-foreground group-hover/heart:text-destructive'}`} />
                      </button>
                      <button 
                        onClick={handleAddToCart} 
                        disabled={service.isActive === false}
                        className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        {service.isActive === false ? t("common:status.unavailable", { defaultValue: "Unavailable" }) : t("serviceDetails:addToCart")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {features.map((feature, i) => (
                <div key={i} className="bg-card rounded-xl border border-border p-4 text-center shadow-sm">
                  <feature.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>

            {/* Reviews */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl font-bold text-start">{t("serviceDetails:reviews.title")}</h2>
                 <button 
                   onClick={() => setShowReviewForm(!showReviewForm)}
                   className="text-primary text-sm font-medium hover:underline"
                 >
                   {showReviewForm ? t("serviceDetails:reviews.cancelReview") : t("serviceDetails:reviews.addReview")}
                 </button>
              </div>

              {showReviewForm && (
                <div className="mb-8 bg-secondary/30 p-4 rounded-lg border border-border text-start">
                  <h3 className="font-semibold mb-4">{t("serviceDetails:reviews.newReviewTitle")}</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm mb-2">{t("serviceDetails:reviews.ratingLabel")}</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setNewReview({ ...newReview, rating: star })}
                            className="focus:outline-none"
                          >
                            <Star 
                              className={`w-6 h-6 ${star <= newReview.rating ? 'fill-warning text-warning' : 'text-muted-foreground'}`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm mb-2">{t("serviceDetails:reviews.commentLabel")}</label>
                      <textarea
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-primary"
                        rows={3}
                        placeholder={t("serviceDetails:reviews.commentPlaceholder")}
                      />
                    </div>
                    <button
                      onClick={handleSubmitReview}
                      disabled={submittingReview}
                      className="bg-primary text-primary-foreground py-2 px-4 rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {submittingReview ? t("serviceDetails:reviews.submitting") : t("serviceDetails:reviews.submit")}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">{t("serviceDetails:reviews.noReviews")}</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="border-b border-border pb-4 last:border-0 text-start">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{review.userName || t("serviceDetails:reviews.anonymous")}</h3>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(review.rating)].map((_, j) => (
                          <Star key={j} className="w-4 h-4 fill-warning text-warning" />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    </div>
                  ) )
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Related Services */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h3 className="font-bold mb-4 text-start">{t("serviceDetails:relatedServices")}</h3>
              <div className="space-y-3">
                {relatedServices.map((svc) => (
                  <Link
                    key={svc.id}
                    to={`/services/${svc.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <img 
                      src={svc.imageUrl || "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=100&h=100&fit=crop"} 
                      alt={svc.name} 
                      className="w-12 h-12 rounded object-cover" 
                    />
                    <div className="flex-1 text-end">
                      <p className="text-sm font-medium line-clamp-2 text-start">{svc.name}</p>
                      <PriceDisplay amount={svc.price / 100} isBold className="text-xs" />
                    </div>
                  </Link>
                ))}
                {relatedServices.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">{t("serviceDetails:noRelated")}</p>
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-primary/10 rounded-xl border border-primary/20 p-6 shadow-sm text-start">
              <h3 className="font-bold text-primary mb-3">{t("serviceDetails:importantNotes")}</h3>
              <ul className="text-sm space-y-2 text-foreground">
                {(t("serviceDetails:notes", { returnObjects: true }) as string[]).map((note, i) => (
                  <li key={i}>✓ {note}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default ServiceDetailsPage;
