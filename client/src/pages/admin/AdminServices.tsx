import AdminLayout from "@/components/layouts/AdminLayout";
import { Search, Plus, Edit, Trash2, ToggleLeft, ToggleRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  category?: string;
  duration?: string;
  imageUrl?: string;
  isActive?: boolean;
}

interface FormData {
  name: string;
  description: string;
  price: string;
  category?: string;
  duration?: string;
  imageUrl?: string;
}

const AdminServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    category: '',
    duration: '',
    imageUrl: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchServices = async () => {
    try {
      const response = await apiClient.getServices();
      const serviceData = response.data || response;
      setServices(Array.isArray(serviceData) ? serviceData : []);
    } catch (error) {
      toast.error('Failed to load services');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingId(service.id);
      setFormData({
        name: service.name,
        description: service.description,
        price: (service.price / 100).toString(),
        category: service.category || '',
        duration: service.duration || '',
        imageUrl: service.imageUrl || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
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
      if (editingId) {
        await apiClient.updateService(editingId, { 
          name: formData.name,
          description: formData.description,
          price,
          category: formData.category,
          duration: formData.duration,
          imageUrl: formData.imageUrl,
        });
        toast.success('Service updated successfully');
      } else {
        await apiClient.createService({
          name: formData.name,
          description: formData.description,
          price,
          category: formData.category,
          duration: formData.duration,
          imageUrl: formData.imageUrl,
        });
        toast.success('Service created successfully');
      }
      
      handleCloseModal();
      await fetchServices();
    } catch (error) {
      toast.error(editingId ? 'Failed to update service' : 'Failed to create service');
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      await apiClient.deleteService(id);
      toast.success('Service deleted successfully');
      await fetchServices();
    } catch (error) {
      toast.error('Failed to delete service');
      console.error('Error:', error);
    }
  };

  const handleToggleStatus = async (service: Service) => {
    try {
      const newStatus = !service.isActive;
      await apiClient.updateServiceStatus(service.id, newStatus);
      toast.success(newStatus ? 'Service activated' : 'Service deactivated');
      await fetchServices();
    } catch (error) {
      toast.error('Failed to update service status');
      console.error('Error:', error);
    }
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">إدارة الخدمات</h1>
          <p className="text-muted-foreground">إضافة وتعديل الخدمات المتاحة</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          إضافة خدمة
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4 mb-6 card-shadow">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="ابحث عن خدمة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg pr-10 pl-4 py-2 text-sm border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden card-shadow">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>
          ) : filteredServices.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">لا توجد خدمات</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">#</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">اسم الخدمة</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">الفئة</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">السعر</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">المدة</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">الحالة</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service) => (
                  <tr key={service.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                    <td className="p-4 text-sm text-muted-foreground">{service.id}</td>
                    <td className="p-4 text-sm font-medium text-foreground">{service.name}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-secondary text-foreground">
                        {service.category || 'بدون فئة'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-foreground">${(service.price / 100).toFixed(2)}</td>
                    <td className="p-4 text-sm text-foreground">{service.duration || '-'}</td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleToggleStatus(service)}
                        className="flex items-center hover:opacity-70 transition-opacity cursor-pointer"
                        title={service.isActive ? 'Click to deactivate' : 'Click to activate'}
                      >
                        {service.isActive !== false ? (
                          <ToggleRight className="w-8 h-8 text-success" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-muted-foreground" />
                        )}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleOpenModal(service)}
                          className="p-2 rounded-lg hover:bg-secondary transition-colors" 
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button 
                          onClick={() => handleDelete(service.id)}
                          className="p-2 rounded-lg hover:bg-destructive/10 transition-colors" 
                          title="حذف"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">
                {editingId ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="p-1 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">اسم الخدمة</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">السعر ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">الفئة</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="مثل: يوتيوب، انستقرام"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">المدة</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="مثل: 2 ساعات"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">رابط الصورة</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  {editingId ? 'تحديث' : 'إضافة'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-secondary text-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
                >
                  إلغاء
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
