import React, { ReactNode } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  title: string;
  message?: string;
  children?: ReactNode;
  closeable?: boolean;
  onClose?: () => void;
  icon?: ReactNode;
  className?: string;
}

const alertConfig = {
  success: {
    bg: 'bg-success-50 dark:bg-success-900/30',
    border: 'border-success-200 dark:border-success-800',
    text: 'text-success-800 dark:text-success-200',
    icon: CheckCircle,
    iconColor: 'text-success-600',
  },
  error: {
    bg: 'bg-danger-50 dark:bg-danger-900/30',
    border: 'border-danger-200 dark:border-danger-800',
    text: 'text-danger-800 dark:text-danger-200',
    icon: AlertCircle,
    iconColor: 'text-danger-600',
  },
  warning: {
    bg: 'bg-warning-50 dark:bg-warning-900/30',
    border: 'border-warning-200 dark:border-warning-800',
    text: 'text-warning-800 dark:text-warning-200',
    icon: AlertTriangle,
    iconColor: 'text-warning-600',
  },
  info: {
    bg: 'bg-secondary-50 dark:bg-secondary-900/30',
    border: 'border-secondary-200 dark:border-secondary-800',
    text: 'text-secondary-800 dark:text-secondary-200',
    icon: Info,
    iconColor: 'text-secondary-600',
  },
};

export const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  children,
  closeable = false,
  onClose,
  icon: customIcon,
  className = '',
}) => {
  const [isOpen, setIsOpen] = React.useState(true);

  if (!isOpen) return null;

  const config = alertConfig[type];
  const IconComponent = config.icon;

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  return (
    <div
      className={`
        rounded-md border p-4 
        ${config.bg} ${config.border} ${config.text}
        ${className}
      `}
      role="alert"
    >
      <div className="flex gap-3">
        <div className={`flex-shrink-0 ${config.iconColor} mt-0.5`}>
          {customIcon || <IconComponent className="w-5 h-5" />}
        </div>

        <div className="flex-1">
          <p className="font-semibold text-sm">{title}</p>
          {message && <p className="text-sm mt-1 opacity-90">{message}</p>}
          {children && <div className="text-sm mt-2">{children}</div>}
        </div>

        {closeable && (
          <button
            onClick={handleClose}
            className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
