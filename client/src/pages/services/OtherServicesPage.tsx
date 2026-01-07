import PublicLayout from "@/components/layouts/PublicLayout";
import ServiceCard from "@/components/common/ServiceCard";
import { Home } from "lucide-react";
import { Link, useLoaderData } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface Service {
  id: string | number;
  name: string;
  nameEn?: string;
  price: number;
  imageUrl?: string;
  category: string;
  description: string;
  isActive?: boolean;
}

const OtherServicesPage = () => {
  const { services } = useLoaderData() as { services: Service[] };
  const { i18n } = useTranslation();
  const { t } = useTranslation("common"); 
  const { t: ts } = useTranslation("services");
  const isRtl = i18n.language === "ar";
  
  // Filter for "Other Services" only
  const filteredServices = services.filter((service) => service.category === "Other Services");

  const formattedServices = filteredServices.map((service: Service) => {
    // Determine localized name
    const localizedName = (!isRtl && service.nameEn) ? service.nameEn : service.name;
    
    return {
      id: service.id?.toString() || service.name,
      title: localizedName,
      titleEn: service.nameEn,
      price: service.price / 100,
      image: service.imageUrl || "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=400&fit=crop",
      badge: service.category,
      badgeColor: "success" as const,
      isAvailable: service.isActive !== false,
    };
  });

  const pageTitle = t("nav.otherServices");

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
            <span className="text-foreground">{pageTitle}</span>
          </nav>
        </div>
      </div>

      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6 flex items-center">
            <span className="w-1 h-8 bg-primary inline-block me-3 rounded-full shrink-0" />
            {pageTitle}
          </h1>
          
          <p className="text-muted-foreground">
            {ts("otherServicesDesc")}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {formattedServices.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground bg-card rounded-lg border border-border">
              <p className="text-lg mb-2">{ts("noResults")}</p>
            </div>
          ) : (
            formattedServices.map((service) => (
              <ServiceCard key={service.id} {...service} />
            ))
          )}
        </div>
      </div>
    </PublicLayout>
  );
};

export default OtherServicesPage;
