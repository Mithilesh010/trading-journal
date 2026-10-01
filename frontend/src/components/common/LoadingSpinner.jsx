import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ text = "Loading...", className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 gap-3 text-slate-400 ${className}`}>
      <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      {text && <span className="text-sm font-medium">{text}</span>}
    </div>
  );
};
