import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  trend,
  className = ''
}) => {
  const valueColorClasses = {
    profit: 'text-emerald-500 dark:text-emerald-400',
    loss: 'text-rose-500 dark:text-rose-400',
    neutral: 'text-slate-700 dark:text-slate-300',
    accent: 'text-cyan-500 dark:text-cyan-400',
    default: 'text-slate-900 dark:text-white'
  };

  const iconBgClasses = {
    profit: 'bg-emerald-500/10 text-emerald-500',
    loss: 'bg-rose-500/10 text-rose-500',
    accent: 'bg-cyan-500/10 text-cyan-500',
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
  };

  return (
    <div className={`p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-lg ${iconBgClasses[variant] || iconBgClasses.default}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className={`text-2xl font-bold tracking-tight font-mono ${valueColorClasses[variant] || valueColorClasses.default}`}>
          {value}
        </div>
      </div>
      {subtitle && (
        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
          {subtitle}
        </div>
      )}
    </div>
  );
};
