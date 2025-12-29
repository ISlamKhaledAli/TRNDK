import PublicLayout from "@/components/layouts/PublicLayout";
import ServiceCard from "@/components/common/ServiceCard";
import { ChevronDown, Home } from "lucide-react";
import { Link } from "react-router-dom";

const dummyServices = [
  { id: "youtube-views", title: "زيادة مشاهدات يوتيوب", titleEn: "Increase YouTube Views", price: 0, image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=400&fit=crop", badge: "#زيادة مشاهدات", badgeColor: "success" as const },
  { id: "youtube-subs", title: "زيادة 4000 مشترك يوتيوب للقناة", titleEn: "Increase 4000 Subscribers", price: 450, image: "https://images.unsplash.com/photo-1529539795054-3c162aab037a?w=400&h=400&fit=crop" },
  { id: "youtube-channel-subs", title: "زيادة مشتركين قناتك يوتيوب", titleEn: "YouTube Channel Subscribers", price: 49, image: "https://images.unsplash.com/photo-1493711662062-fa541f7f3d24?w=400&h=400&fit=crop" },
  { id: "youtube-package", title: "بكج مشتركين ومشاهدات ولايكات للقناة", titleEn: "Full YouTube Package", price: 199, image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=400&h=400&fit=crop", badge: "OFFER", badgeColor: "warning" as const },
  { id: "youtube-100k", title: "زيادة 100 ألف مشاهدة يوتيوب", titleEn: "Increase 100K YouTube Views", price: 0, image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400&h=400&fit=crop" },
  { id: "youtube-50k", title: "زيادة 50 ألف مشاهدة يوتيوب", titleEn: "Increase 50K YouTube Views", price: 0, image: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=400&h=400&fit=crop" },
  { id: "youtube-likes", title: "زيادة لايكات يوتيوب", titleEn: "Increase YouTube Likes", price: 0, image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=400&fit=crop" },
  { id: "youtube-views-package", title: "بكج زيادة مشاهدات ولايكات", titleEn: "Views & Likes Package", price: 0, image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop" },
];

const ServicesPage = () => {
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
            <span className="text-foreground">خدمات يوتيوب</span>
          </nav>
        </div>
      </div>

      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              <span className="w-1 h-8 bg-primary inline-block ml-3 rounded-full" />
              خدمات يوتيوب
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dummyServices.map((service) => (
            <ServiceCard key={service.id} {...service} />
          ))}
        </div>
      </div>
    </PublicLayout>
  );
};

export default ServicesPage;
