import React, { useState, useEffect } from 'react';
import { getAvatarUrl } from '../../utils/imageUrl';

/**
 * Robust User Avatar component that handles image loading,
 * broken image errors, and stylish fallbacks with student initials.
 */
export const Avatar = ({
  src,
  name = 'Student',
  className = '',
  imageClassName = '',
  fallbackClassName = '',
  size = 'md',
  shape = 'rounded',
  alt,
}) => {
  const [hasError, setHasError] = useState(false);
  const avatarSrc = getAvatarUrl(src);

  // Reset error state when src changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const initial = name?.trim() ? name.trim().charAt(0).toUpperCase() : 'U';

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm font-semibold',
    lg: 'w-14 h-14 text-lg font-bold',
    xl: 'w-20 h-20 text-2xl font-bold',
    '2xl': 'w-24 h-24 md:w-28 md:h-28 text-3xl font-bold',
    full: 'w-full h-full text-base',
  }[size] || 'w-10 h-10 text-sm font-semibold';

  const shapeClasses = {
    circle: 'rounded-full',
    rounded: 'rounded-2xl',
    square: 'rounded-lg',
    sm: 'rounded-md',
  }[shape] || 'rounded-2xl';

  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden shrink-0 select-none ${sizeClasses} ${shapeClasses} ${className}`}
    >
      {avatarSrc && !hasError ? (
        <img
          src={avatarSrc}
          alt={alt || name || 'Avatar'}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover ${imageClassName}`}
          loading="lazy"
        />
      ) : (
        <div
          className={`w-full h-full bg-[#ebdcc2] border border-[#d6c7b2] flex items-center justify-center font-bold text-amber-950 shadow-inner ${fallbackClassName}`}
        >
          {initial}
        </div>
      )}
    </div>
  );
};

export default Avatar;
