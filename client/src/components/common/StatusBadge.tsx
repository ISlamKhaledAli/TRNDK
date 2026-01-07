import { useTranslation } from "react-i18next";

type Status = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "completed" | "cancelled" | "failed";

interface StatusBadgeProps {
  status: string;
}

const statusClasses: Record<string, string> = {
  pending: "badge-pending",
  pending_payment: "badge-pending",
  confirmed: "badge-info",
  processing: "badge-processing",
  shipped: "badge-processing",
  delivered: "badge-completed",
  completed: "badge-completed",
  cancelled: "badge-cancelled",
  failed: "badge-cancelled",
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const { t, i18n } = useTranslation("common");
  const isRtl = i18n.language === "ar";
  
  const className = statusClasses[status] || "badge-default";
  const label = t(`statusLabels.${status}`, { defaultValue: status });

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full bg-current ${isRtl ? 'ml-1.5' : 'mr-1.5'}`} />
      {label}
    </span>
  );
};

export default StatusBadge;
