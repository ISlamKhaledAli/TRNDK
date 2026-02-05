import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useTranslation } from "react-i18next";
import PriceDisplay from "./PriceDisplay";

interface ServiceCardProps {
  id: string;
  title: string;
  titleEn?: string;
  price: number;
  image: string;
  badge?: string;
  badgeColor?: "primary" | "success" | "warning";
}

const ServiceCard = ({
  id,
  title,
  titleEn,
  price,
  image,
  badge,
  badgeColor = "primary",
  isAvailable = true,
}: ServiceCardProps & { isAvailable?: boolean }) => {
  const { isInWishlist, toggleWishlist } = useCart();
  const { t, i18n } = useTranslation("common");
  const isRtl = i18n.language === "ar";
  const serviceId = Number(id);
  const isLoved = isInWishlist(serviceId);

  const badgeStyles = {
    primary: "bg-primary text-primary-foreground",
    success: "bg-success text-success-foreground",
    warning: "bg-warning text-warning-foreground",
    destructive: "bg-destructive text-destructive-foreground",
  };

  return (
    <div className={`service-card group bg-card rounded-xl border border-border overflow-hidden hover-elevate transition-all duration-300 ${!isAvailable ? 'opacity-75' : ''}`}>
      <Link to={isAvailable ? `/services/${id}` : '#'} className={`block ${!isAvailable ? 'cursor-not-allowed pointer-events-none' : ''}`}>
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={image}
            alt={title}
            className={`w-full h-full object-cover transition-transform duration-300 ${isAvailable ? 'group-hover:scale-105' : 'grayscale'}`}
          />
          {!isAvailable ? (
             <span className={`absolute top-3 right-3 px-2 py-1 text-xs font-medium rounded ${badgeStyles.destructive}`}>
               {t("status.unavailable", { defaultValue: "Unavailable" })}
             </span>
          ) : badge && (
            <span
              className={`absolute top-3 right-3 px-2 py-1 text-xs font-medium rounded ${badgeStyles[badgeColor]}`}
            >
              {badge}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-foreground mb-1 line-clamp-2">{title}</h3>
        {isRtl && titleEn && titleEn !== title && (
          <p className="text-sm text-muted-foreground mb-3 text-start" dir="ltr">{titleEn}</p>
        )}
        </div>
      </Link>
      
      <div className="px-4 pb-4 flex items-center justify-between mt-auto">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isAvailable) toggleWishlist(serviceId);
          }}
          disabled={!isAvailable}
          className={`p-2 rounded-lg hover:bg-accent transition-colors group/heart ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="Toggle Wishlist"
        >
          <Heart className={`w-5 h-5 transition-colors ${isLoved ? 'fill-destructive text-destructive' : 'text-muted-foreground group-hover/heart:text-destructive'}`} />
        </button>
        <div className="text-start">
             {isAvailable ? (
                <PriceDisplay amount={price} isBold />
             ) : (
                <span className="text-sm font-medium text-muted-foreground">{t("status.unavailable", { defaultValue: "Unavailable" })}</span>
             )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
