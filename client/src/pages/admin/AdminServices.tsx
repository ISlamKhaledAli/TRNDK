/**
 * client/src/pages/admin/AdminServices.tsx
 * 
 * Admin services management page.
 * Displays all services in a grid with search and category filtering.
 * Allows admins to create, edit, delete, and toggle service availability.
 */

import AdminLayout from "@/components/layouts/AdminLayout";
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, X, Percent } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/services/api";
import { toast } from "sonner";
import { formatPrice } from "../../lib/utils";
import { useTranslation } from "react-i18next";
import { useLoaderData, useRevalidator } from "react-router-dom";

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
}

interface FormData {
  name: string;
  nameEn?: string;
  description: string;
  descriptionEn?: string;
  price: string;
  category?: string;
  duration?: string;
  imageUrl?: string;
}

const AdminServices = () => {
  const { services: initialServices } = useLoaderData() as { services: Service[] };
  const { revalidate } = useRevalidator();
  const [services, setServices] = useState<Service[]>(initialServices);
  const [taxRate, setTaxRate] = useState<string>('15');
  const [savingTax, setSavingTax] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const { t, i18n } = useTranslation(["admin", "common"]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    nameEn: '',
    description: '',
    descriptionEn: '',
    price: '',
    category: '',
    duration: '',
    imageUrl: '',
  });

  // Fetch categories and sync state if loader data changes
  useEffect(() => {
    setServices(initialServices);
    
    const fetchCategories = async () => {
      try {
        const { data } = await apiClient.getServiceCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();

    const fetchTaxRate = async () => {
      try {
        const { data } = await apiClient.getSetting('taxRate');
        setTaxRate(data.value);
      } catch (error) {
        console.error('Failed to fetch tax rate:', error);
      }
    };
    fetchTaxRate();
  }, [initialServices]);

  const handleUpdateTax = async () => {
    try {
      setSavingTax(true);
      await apiClient.updateSetting('taxRate', taxRate);
      toast.success(t("services.tax.updateSuccess"));
    } catch (error) {
      toast.error(t("services.tax.updateError"));
    } finally {
      setSavingTax(false);
    }
  };

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingId(service.id);
      setFormData({
        name: service.name,
        nameEn: service.nameEn || '',
        description: service.description,
        descriptionEn: service.descriptionEn || '',
        price: (service.price / 100).toFixed(2),
        category: service.category || '',
        duration: service.duration || '',
        imageUrl: service.imageUrl || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        nameEn: '',
        description: '',
        descriptionEn: '',
        price: '',
        category: categories[0] || '', // Default to first category
        duration: '',
        imageUrl: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const price = Math.round(parseFloat(formData.price) * 100);
    if (isNaN(price) || price < 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      setLoading(true);
      if (editingId) {
        await apiClient.updateService(editingId, { 
          name: formData.name,
          nameEn: formData.nameEn,
          description: formData.description,
          descriptionEn: formData.descriptionEn,
          price,
          category: formData.category,
          duration: formData.duration,
          imageUrl: formData.imageUrl,
        });
        toast.success(t("services.updateSuccess"));
      } else {
        await apiClient.createService({
          name: formData.name,
          nameEn: formData.nameEn,
          description: formData.description,
          descriptionEn: formData.descriptionEn,
          price,
          category: formData.category,
          duration: formData.duration,
          imageUrl: formData.imageUrl,
        });
        toast.success(t("services.createSuccess"));
      }
      
      revalidate();
      handleCloseModal();
    } catch (error) {
      toast.error(editingId ? t("services.updateError") : t("services.createError"));
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("services.deleteConfirm"))) return;

    try {
      await apiClient.deleteService(id);
      toast.success(t("services.deleteSuccess"));
      revalidate();
    } catch (error) {
      toast.error(t("services.deleteError"));
      console.error('Error:', error);
    }
  };

  const handleToggleStatus = async (service: Service) => {
    try {
      const newStatus = !service.isActive;
      await apiClient.updateServiceStatus(service.id, newStatus);
      toast.success(t("services.statusSuccess"));
      revalidate();
    } catch (error) {
      toast.error(t("services.statusError"));
      console.error('Error:', error);
    }
  };

  const filteredServices = services;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{t("services.title")}</h1>
          <p className="text-muted-foreground">{t("services.subtitle")}</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t("services.addService")}
        </button>
      </div>

      {/* Tax Rate Setting */}
      <div className="bg-card rounded-xl border border-border p-4 mb-6 card-shadow flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Percent className="w-5 h-5 text-primary" />
          </div>
          <div className="text-start">
            <h3 className="font-bold text-foreground">{t("services.tax.title")}</h3>
            <p className="text-xs text-muted-foreground">{t("services.tax.description")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
            className="w-24 bg-secondary text-foreground rounded-lg px-3 py-2 text-sm border border-border focus:outline-none focus:border-primary"
            placeholder="15"
          />
          <button
            onClick={handleUpdateTax}
            disabled={savingTax}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {savingTax ? t("common:loading") : t("common:buttons.save")}
          </button>
        </div>
      </div>


      {/* Services Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden card-shadow">
        <div className="overflow-x-auto">
          {filteredServices.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">{t("services.noServices")}</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-start text-xs font-medium text-muted-foreground p-4">#</th>
                  <th className="text-start text-xs font-medium text-muted-foreground p-4">{t("services.fields.name")}</th>
                  <th className="text-start text-xs font-medium text-muted-foreground p-4">{t("services.fields.category")}</th>
                  <th className="text-start text-xs font-medium text-muted-foreground p-4">{t("services.fields.price")}</th>
                  <th className="text-start text-xs font-medium text-muted-foreground p-4">{t("services.fields.duration")}</th>
                  <th className="text-start text-xs font-medium text-muted-foreground p-4">{t("common:status")}</th>
                  <th className="text-start text-xs font-medium text-muted-foreground p-4">{t("common:actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service) => (
                  <tr key={service.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                    <td className="p-4 text-sm text-muted-foreground">{service.id}</td>
                    <td className="p-4 text-sm font-medium text-foreground text-start">{service.name}</td>
                    <td className="p-4 text-start">
                      <span className="px-2 py-1 text-xs rounded-full bg-secondary text-foreground">
                        {service.category || t("services.fields.noCategory")}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-foreground text-start">{formatPrice(service.price)}</td>
                    <td className="p-4 text-sm text-foreground text-start">{service.duration || '-'}</td>
                    <td className="p-4 text-start">
                      <button 
                        onClick={() => handleToggleStatus(service)}
                        className="flex items-center hover:opacity-70 transition-opacity cursor-pointer"
                        title={service.isActive !== false ? t("services.deactivate") : t("services.activate")}
                      >
                        {service.isActive !== false ? (
                          <ToggleRight className="w-8 h-8 text-success" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-muted-foreground" />
                        )}
                      </button>
                    </td>
                    <td className="p-4 text-start">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleOpenModal(service)}
                          className="p-2 rounded-lg hover:bg-secondary transition-colors" 
                          title={t("common:edit")}
                        >
                          <Edit className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button 
                          onClick={() => handleDelete(service.id)}
                          className="p-2 rounded-lg hover:bg-destructive/10 transition-colors" 
                          title={t("common:delete")}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 [html[dir=rtl]_&]:translate-x-[11rem] sm:[html[dir=rtl]_&]:translate-x-0">
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto ">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">
                {editingId ? t("services.modal.editTitle") : t("services.modal.addTitle")}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="p-1 hover:bg-secondary rounded-lg transition-colors"
                type="button"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-start">
                <label className="block text-sm font-medium text-foreground mb-1">{t("services.fields.name")} (Arabic)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                  dir="rtl"
                />
              </div>

              <div className="text-start">
                <label className="block text-sm font-medium text-foreground mb-1">{t("services.fields.name")} (English)</label>
                <input
                  type="text"
                  value={formData.nameEn || ''}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  dir="ltr"
                />
              </div>

              <div className="text-start">
                <label className="block text-sm font-medium text-foreground mb-1">{t("services.fields.description")} (Arabic)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  rows={3}
                  required
                  dir="rtl"
                />
              </div>

              <div className="text-start">
                <label className="block text-sm font-medium text-foreground mb-1">{t("services.fields.description")} (English)</label>
                <textarea
                  value={formData.descriptionEn || ''}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  rows={3}
                  dir="ltr"
                />
              </div>

              <div className="text-start">
                <label className="block text-sm font-medium text-foreground mb-1">{t("services.fields.price")}</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="text-start">
                <label className="block text-sm font-medium text-foreground mb-1">{t("services.fields.category")}</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                >
                  <option value="" disabled>{t("services.fields.selectCategory")}</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="text-start">
                <label className="block text-sm font-medium text-foreground mb-1">{t("services.fields.duration")}</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder={t("services.fields.durationPlaceholder")}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="text-start">
                <label className="block text-sm font-medium text-foreground mb-1">{t("services.fields.imageUrl")}</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex gap-2 pt-4 col-span-1 md:col-span-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  {editingId ? t("services.modal.update") : t("services.modal.add")}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-secondary text-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
                >
                  {t("common.cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminServices;
