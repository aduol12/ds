import React, { InputHTMLAttributes, ReactNode } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
  required?: boolean;
  containerClassName?: string;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      required,
      className,
      disabled,
      containerClassName = '',
      ...props
    },
    ref
  ) => {
    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {label}
            {required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            disabled={disabled}
            className={`
              w-full px-4 py-2.5 rounded-md border border-slate-300 dark:border-slate-600
              text-slate-900 dark:text-slate-50 placeholder-slate-500 dark:placeholder-slate-400
              focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent
              disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed
              transition-all duration-200
              ${error ? 'border-danger-500 focus:ring-danger-500' : ''}
              ${icon ? 'pl-10' : ''}
              ${className || ''}
            `}
            {...props}
          />
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400">
              {icon}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-danger-500 dark:text-danger-400 mt-1">{error}</p>}
        {helperText && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{helperText}</p>}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
