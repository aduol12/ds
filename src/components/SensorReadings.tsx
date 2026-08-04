import React from 'react';
import { Droplet, Thermometer, Leaf, Cloud, Zap } from 'lucide-react';

interface SensorReading {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  status?: 'optimal' | 'warning' | 'critical';
}

interface SensorReadingsProps {
  readings: SensorReading[];
  loading?: boolean;
  className?: string;
}

const iconMap = {
  moisture: Droplet,
  temperature: Thermometer,
  npk: Leaf,
  weather: Cloud,
  energy: Zap,
};

const statusColors = {
  optimal: 'text-success-600 bg-success-50 dark:bg-success-900/30',
  warning: 'text-warning-600 bg-warning-50 dark:bg-warning-900/30',
  critical: 'text-danger-600 bg-danger-50 dark:bg-danger-900/30',
};

export const SensorReadings: React.FC<SensorReadingsProps> = ({
  readings,
  loading = false,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {loading
        ? Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg p-4 bg-slate-100 dark:bg-slate-800 animate-pulse"
            >
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-2" />
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-16" />
            </div>
          ))
        : readings.map((reading, idx) => (
            <div
              key={idx}
              className={`
                rounded-lg p-4 border border-slate-200 dark:border-slate-700
                ${reading.status ? statusColors[reading.status] : 'bg-white dark:bg-slate-800'}
              `}
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {reading.label}
                </p>
                {reading.icon && <div className="text-lg">{reading.icon}</div>}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                  {reading.value}
                </span>
                {reading.unit && (
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {reading.unit}
                  </span>
                )}
              </div>
            </div>
          ))}
    </div>
  );
};
