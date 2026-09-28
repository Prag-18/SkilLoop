import React from 'react';

export const Badge = ({
  children,
  variant = 'indigo',
  size = 'md',
  className = '',
  icon: Icon,
  ...props
}) => {
  const variants = {
    indigo: 'bg-amber-100 text-amber-900 border-amber-300/80 shadow-[0_1px_2px_rgba(0,0,0,0.05)] font-medium',
    emerald: 'bg-emerald-100 text-emerald-900 border-emerald-300/80 shadow-[0_1px_2px_rgba(0,0,0,0.05)] font-medium',
    amber: 'bg-orange-100 text-orange-900 border-orange-300/80 shadow-[0_1px_2px_rgba(0,0,0,0.05)] font-medium',
    purple: 'bg-purple-100 text-purple-900 border-purple-300/80 shadow-[0_1px_2px_rgba(0,0,0,0.05)] font-medium',
    rose: 'bg-rose-100 text-rose-900 border-rose-300/80 shadow-[0_1px_2px_rgba(0,0,0,0.05)] font-medium',
    slate: 'bg-stone-200 text-stone-800 border-stone-300/80 shadow-[0_1px_2px_rgba(0,0,0,0.05)] font-medium',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] gap-1 font-semibold tracking-wider uppercase',
    md: 'px-2.5 py-1 text-xs gap-1.5 font-medium',
    lg: 'px-3 py-1.5 text-sm gap-2 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      {children}
    </span>
  );
};

export default Badge;
