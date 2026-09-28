import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  isLoading = false,
  disabled = false,
  type = 'button',
  icon: Icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#faf6ee] disabled:opacity-50 disabled:cursor-not-allowed select-none active:translate-y-[1px]';

  const variants = {
    primary: 'bg-amber-800 hover:bg-amber-900 text-amber-50 shadow-paper-flat border border-amber-950/20 focus:ring-amber-800',
    secondary: 'bg-[#f4ebd9] hover:bg-[#ebdcc4] text-stone-800 border border-[#d6c5a5] shadow-paper-flat focus:ring-stone-400',
    emerald: 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-paper-flat border border-emerald-900/20 focus:ring-emerald-700',
    outline: 'bg-white/90 hover:bg-[#f6f0e2] text-stone-700 border border-[#d8cab0] shadow-paper-flat focus:ring-amber-700',
    ghost: 'bg-transparent hover:bg-[#f3ebd9]/70 text-stone-600 hover:text-stone-900 focus:ring-stone-400',
    danger: 'bg-rose-700 hover:bg-rose-800 text-white shadow-paper-flat border border-rose-950/20 focus:ring-rose-600',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5 font-semibold',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon ? (
        <Icon className={`w-4 h-4 ${size === 'lg' ? 'w-5 h-5' : ''}`} />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
