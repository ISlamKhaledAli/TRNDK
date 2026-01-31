import { Link } from "react-router-dom";
import { useSidebar } from "@/contexts/SidebarContext";

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
  const { isMobile, closeSidebar } = useSidebar();

  const handleClick = () => {
    if (isMobile) {
      closeSidebar();
    }
  };

  return (
    <Link 
      to="/" 
      onClick={handleClick}
      className={`inline-flex items-center justify-center ${className}`}
    >
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
