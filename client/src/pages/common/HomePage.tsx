import PublicLayout from "@/components/layouts/PublicLayout";
import ServiceCard from "@/components/common/ServiceCard";
import { Link, useLoaderData } from "react-router-dom";
import { ArrowLeft, Shield, Zap, Headphones, Youtube, Instagram, Music, Facebook } from "lucide-react";
import { useState } from "react";
import { apiClient } from "@/services/api";
import { toast } from "sonner";

import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";

const HomePage = () => {
  const { services } = useLoaderData() as { services: any[] };
  const { t, i18n } = useTranslation("home");
  const { user } = useAuth();
  const isRtl = i18n.language === "ar";
  
  const featuresList = [
    { icon: Shield, title: t("features.secure.title"), description: t("features.secure.description") },
    { icon: Zap, title: t("features.instant.title"), description: t("features.instant.description") },
    { icon: Headphones, title: t("features.support.title"), description: t("features.support.description") },
  ];

  const categoriesList = [
    { icon: Youtube, label: t("categories.youtubeServices"), href: "/services?category=YouTube", color: "bg-red-500" },
    { icon: Instagram, label: t("categories.instagramServices"), href: "/services?category=Instagram", color: "bg-gradient-to-br from-purple-500 to-pink-500" },
    { icon: Facebook, label: t("categories.facebookServices"), href: "/services?category=Facebook", color: "bg-blue-600" },
    { icon: Music, label: t("categories.tiktokServices"), href: "/services?category=TikTok", color: "bg-black" },
  ];
  // Taking first 4 services as "Popular"
  const popularServices = Array.isArray(services) ? services.slice(0, 4) : [];

  const formattedServices = popularServices.map((service: any) => ({
    id: service.id?.toString() || service.name,
    title: service.name,
    titleEn: service.name,
    price: service.price,
    image: service.imageUrl || "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=400&fit=crop",
  }));

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-card to-background py-16 md:py-24">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            {t("hero.title")}
            <span className="text-primary block mt-2">{t("hero.subtitle")}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {t("hero.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/services"
              className="px-8 py-4 rounded-lg font-semibold text-lg inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {t("hero.browseServices")}
              <ArrowLeft className={`w-5 h-5 ${isRtl ? "" : "rotate-180"}`} />
            </Link>
            {!user && (
              <Link
                to="/register"
                className="px-8 py-4 rounded-lg font-semibold text-lg border border-primary text-primary hover:bg-primary/10 transition-colors"
              >
                {t("hero.createAccount")}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 border-b border-border">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuresList.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-6 rounded-xl bg-card border border-border"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">{t("categories.title")}</h2>
            <p className="text-muted-foreground">{t("categories.subtitle")}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoriesList.map((cat, index) => (
              <Link
                key={index}
                to={cat.href}
                className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg text-center"
              >
                <div className={`w-16 h-16 mx-auto rounded-2xl ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <cat.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg">{cat.label}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-16 bg-card">
        <div className="container">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">{t("popularServices.title")}</h2>
              <p className="text-muted-foreground">{t("popularServices.subtitle")}</p>
            </div>
            <Link
              to="/services"
              className="hidden sm:flex items-center gap-2 text-primary font-medium hover:underline"
            >
              {t("popularServices.viewAll")}
              <ArrowLeft className={`w-4 h-4 ${isRtl ? "" : "rotate-180"}`} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {formattedServices.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">{t("popularServices.noServices", { defaultValue: "No services available" })}</div>
            ) : (
              formattedServices.map((service: any) => (
                <ServiceCard key={service.id} {...service} />
              ))
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default HomePage;
