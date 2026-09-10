import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold'
  };

  const variantClasses = {
    buy: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    sell: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
    open: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    closed: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
    profit: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono',
    loss: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono',
    neutral: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20',
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
  };

  return (
    <span className={`inline-flex items-center rounded-md font-medium tracking-wide ${sizeClasses[size]} ${variantClasses[variant] || variantClasses.default} ${className}`}>
      {children}
    </span>
  );
};
