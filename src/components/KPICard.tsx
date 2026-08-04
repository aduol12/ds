import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    period: string;
  };
  status?: 'success' | 'warning' | 'danger' | 'neutral';
  onClick?: () => void;
  loading?: boolean;
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  unit,
  icon,
  trend,
  status = 'neutral',
  onClick,
  loading = false,
  className = '',
}) => {
  const statusColors = {
    success: 'text-success-600',
    warning: 'text-warning-500',
    danger: 'text-danger-500',
    neutral: 'text-secondary-600',
  };

  const trendIcons = {
    up: <ArrowUpRight className="w-4 h-4" />,
    down: <ArrowDownRight className="w-4 h-4" />,
    neutral: <Minus className="w-4 h-4" />,
  };

  return (
    <div
      onClick={onClick}
      className={`
        rounded-lg p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 
        shadow-xs hover:shadow-sm transition-all duration-250 
        ${onClick ? 'cursor-pointer hover:border-secondary-300' : ''}
        ${className}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
            {loading ? (
              <div className="w-20 h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            ) : (
              <>
                <span className="text-3xl font-semibold text-slate-900 dark:text-slate-50">{value}</span>
                {unit && <span className="text-slate-500 dark:text-slate-400 text-sm">{unit}</span>}
              </>
            )}
          </div>
        </div>
        {icon && <div className={`${statusColors[status]}`}>{icon}</div>}
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span
            className={`
              flex items-center gap-1 font-medium
              ${trend.direction === 'up' ? 'text-success-600' : ''}
              ${trend.direction === 'down' ? 'text-danger-600' : ''}
              ${trend.direction === 'neutral' ? 'text-slate-500' : ''}
            `}
          >
            {trendIcons[trend.direction]}
            {Math.abs(trend.value)}%
          </span>
          <span className="text-slate-500 dark:text-slate-400">{trend.period}</span>
        </div>
      )}
    </div>
  );
};
