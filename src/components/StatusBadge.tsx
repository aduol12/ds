import React from 'react';

type StatusType = 'online' | 'offline' | 'warning' | 'idle' | 'active' | 'inactive' | 'success' | 'error';

interface StatusBadgeProps {
  status: StatusType;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const statusConfig = {
  online: { bg: 'bg-success-50 dark:bg-success-900/30', text: 'text-success-700 dark:text-success-300', dot: 'bg-success-600' },
  offline: { bg: 'bg-danger-50 dark:bg-danger-900/30', text: 'text-danger-700 dark:text-danger-300', dot: 'bg-danger-600' },
  warning: { bg: 'bg-warning-50 dark:bg-warning-900/30', text: 'text-warning-700 dark:text-warning-300', dot: 'bg-warning-500' },
  idle: { bg: 'bg-slate-50 dark:bg-slate-900/30', text: 'text-slate-700 dark:text-slate-300', dot: 'bg-slate-500' },
  active: { bg: 'bg-secondary-50 dark:bg-secondary-900/30', text: 'text-secondary-700 dark:text-secondary-300', dot: 'bg-secondary-600' },
  inactive: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', dot: 'bg-slate-400' },
  success: { bg: 'bg-success-50 dark:bg-success-900/30', text: 'text-success-700 dark:text-success-300', dot: 'bg-success-600' },
  error: { bg: 'bg-danger-50 dark:bg-danger-900/30', text: 'text-danger-700 dark:text-danger-300', dot: 'bg-danger-600' },
};

const sizeConfig = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  animated = true,
}) => {
  const config = statusConfig[status];
  const sizeClass = sizeConfig[size];

  return (
    <span
      className={`
        inline-flex items-center gap-2 rounded-full font-medium
        ${config.bg} ${config.text} ${sizeClass}
      `}
    >
      <span
        className={`w-2 h-2 rounded-full ${config.dot} ${animated ? 'animate-pulse' : ''}`}
      />
      {label}
    </span>
  );
};
