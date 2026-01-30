import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface BrandProps {
  className?: string;
  logoSize?: string;
  scale?: number;
}

const Brand = ({ 
  className = "", 
  logoSize = "w-10 h-10", 
  scale = 2.5
}: BrandProps) => {
  return (
    <Link to="/" className={`inline-flex items-center justify-center ${className}`}>
      <img 
        src="/TRNDK.svg" 
        alt="TRNDK" 
        className={`${logoSize} object-contain`}
        style={{ transform: `scale(${scale})` }}
      />
    </Link>
  );
};

export default Brand;
