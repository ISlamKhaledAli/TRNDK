import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

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
}: ServiceCardProps) => {
  const badgeStyles = {
    primary: "bg-primary text-primary-foreground",
    success: "bg-success text-success-foreground",
    warning: "bg-warning text-warning-foreground",
  };

  return (
    <Link to={`/services/${id}`} className="service-card group block">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {badge && (
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
        {titleEn && (
          <p className="text-sm text-muted-foreground mb-3">{titleEn}</p>
        )}
        <div className="flex items-center justify-between">
          <button
            onClick={(e) => {
              e.preventDefault();
              // Wishlist logic placeholder
            }}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <Heart className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="text-left">
            <span className="text-lg font-bold text-primary">{price}</span>
            <span className="text-sm text-muted-foreground mr-1">ر.س</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ServiceCard;
