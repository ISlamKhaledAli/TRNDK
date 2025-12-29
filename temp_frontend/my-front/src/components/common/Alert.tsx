import { AlertCircle, CheckCircle, Info, XCircle, X } from "lucide-react";
import { ReactNode } from "react";

type AlertType = "info" | "success" | "warning" | "error";

interface AlertProps {
  type: AlertType;
  title?: string;
  children: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const alertStyles: Record<AlertType, { bg: string; border: string; icon: typeof Info }> = {
  info: {
    bg: "bg-info/10",
    border: "border-info/20",
    icon: Info,
  },
  success: {
    bg: "bg-success/10",
    border: "border-success/20",
    icon: CheckCircle,
  },
  warning: {
    bg: "bg-warning/10",
    border: "border-warning/20",
    icon: AlertCircle,
  },
  error: {
    bg: "bg-destructive/10",
    border: "border-destructive/20",
    icon: XCircle,
  },
};

const Alert = ({ type, title, children, dismissible, onDismiss }: AlertProps) => {
  const styles = alertStyles[type];
  const Icon = styles.icon;

  return (
    <div
      className={`${styles.bg} ${styles.border} border rounded-lg p-4 flex items-start gap-3`}
    >
      <Icon className={`w-5 h-5 mt-0.5 text-${type === "error" ? "destructive" : type}`} />
      <div className="flex-1">
        {title && <p className="font-medium mb-1">{title}</p>}
        <div className="text-sm text-muted-foreground">{children}</div>
      </div>
      {dismissible && (
        <button
          onClick={onDismiss}
          className="p-1 rounded hover:bg-background/50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;
