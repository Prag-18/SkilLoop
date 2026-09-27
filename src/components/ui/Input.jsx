import React from 'react';

export const Input = React.forwardRef(({
  label,
  error,
  icon: Icon,
  helperText,
  className = '',
  id,
  type = 'text',
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-stone-700 tracking-wide">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-stone-400 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`w-full rounded-xl bg-[#fffdfa] border ${
            error ? 'border-red-400 focus:ring-red-400/20 focus:border-red-500' : 'border-[#dfd7c5] focus:border-amber-700 focus:ring-2 focus:ring-amber-700/15 shadow-sm'
          } px-4 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none transition-all duration-200 ${
            Icon ? 'pl-10' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs font-medium text-red-600">{error}</span>}
      {helperText && !error && <span className="text-xs text-stone-500">{helperText}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
