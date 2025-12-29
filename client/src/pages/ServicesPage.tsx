import PublicLayout from "@/components/layouts/PublicLayout";
import ServiceCard from "@/components/common/ServiceCard";
import { ChevronDown, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

const ServicesPage = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await apiClient.getServices();
        const serviceData = response.data || response;
        setServices(Array.isArray(serviceData) ? serviceData : []);
      } catch (error) {
        toast.error('Failed to load services');
        console.error('Error fetching services:', error);
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
    price: service.price / 100, // Convert from cents
    image: service.imageUrl || "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=400&fit=crop",
    badge: service.category,
    badgeColor: "success" as const,
  }));

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
            <span className="text-foreground">الخدمات</span>
          </nav>
        </div>
      </div>

      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              <span className="w-1 h-8 bg-primary inline-block ml-3 rounded-full" />
              جميع الخدمات
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-outline px-4 py-2 rounded-lg text-sm flex items-center gap-2">
              <span>ترتيب</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">جاري تحميل الخدمات...</p>
          </div>
        ) : formattedServices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">لا توجد خدمات متاحة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {formattedServices.map((service: any) => (
              <ServiceCard key={service.id} {...service} />
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default ServicesPage;
