type Status = "pending" | "processing" | "completed" | "cancelled";

interface StatusBadgeProps {
  status: Status;
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  pending: { label: "قيد الانتظار", className: "badge-pending" },
  processing: { label: "قيد التنفيذ", className: "badge-processing" },
  completed: { label: "مكتمل", className: "badge-completed" },
  cancelled: { label: "ملغي", className: "badge-cancelled" },
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current ml-1.5" />
      {config.label}
    </span>
  );
};

export default StatusBadge;
