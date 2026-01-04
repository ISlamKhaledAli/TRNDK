import PublicLayout from "@/components/layouts/PublicLayout";
import ServiceCard from "@/components/common/ServiceCard";
import { Home } from "lucide-react";
import { Link, useLoaderData, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiClient } from "@/services/api";
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

const ServicesPage = () => {
  const { services } = useLoaderData() as { services: Service[] };
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, i18n } = useTranslation("home");
  const { t: ts } = useTranslation("services");
  const isRtl = i18n.language === "ar";
  const categoryParam = searchParams.get("category");
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || "all");
  const [categories, setCategories] = useState<{ id: string; label: string }[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await apiClient.getServiceCategories();
        const formatted = data.map((cat: string) => ({
          id: cat,
          label: cat
        }));
        setCategories([{ id: "all", label: ts("allCategories") }, ...formatted]);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, [ts]);

  // Update URL when category changes
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", category);
    }
    setSearchParams(searchParams);
  };
  
  // Sync state with URL param if it changes externally
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat && cat !== selectedCategory) {
      setSelectedCategory(cat);
    } else if (!cat && selectedCategory !== "all") {
      setSelectedCategory("all");
    }
  }, [searchParams, selectedCategory]);

  const filteredServices = services.filter((service) => {
    return selectedCategory === "all" || service.category === selectedCategory;
  });

  const formattedServices = filteredServices.map((service: Service) => {
    // Determine localized name
    // If not RTL (meaning English) and nameEn exists, use it. Otherwise fallback to name (Arabic).
    // Or if we want strict locale text:
    const localizedName = (!isRtl && service.nameEn) ? service.nameEn : service.name;
    
    return {
      id: service.id?.toString() || service.name,
      title: localizedName,
      titleEn: service.nameEn, // Pass English name separately if needed for card subtitle (optional)
      price: service.price / 100,
      image: service.imageUrl || "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=400&fit=crop",
      badge: service.category,
      badgeColor: "success" as const,
      isAvailable: service.isActive !== false, // Default to true if undefined
    };
  });

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
            <span className="text-foreground">{ts("title")}</span>
          </nav>
        </div>
      </div>

      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6 flex items-center">
            <span className="w-1 h-8 bg-primary inline-block me-3 rounded-full shrink-0" />
            {ts("title")}
          </h1>
          
          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-2 mb-8 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-card border border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {formattedServices.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground bg-card rounded-lg border border-border">
              <p className="text-lg mb-2">{ts("noResults")}</p>
              <p className="text-sm">{ts("tryFilters")}</p>
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

export default ServicesPage;
