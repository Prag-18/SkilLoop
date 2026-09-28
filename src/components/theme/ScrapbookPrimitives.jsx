import React from 'react';

/**
 * All decorative scrapbook primitives.
 * STRICT SAFETY RULES:
 * - Every decorative element has aria-hidden="true" and pointer-events-none.
 * - Rotations use deterministic Tailwind classes (-rotate-2, -rotate-1, rotate-1, rotate-2).
 * - Inline SVGs with white cutout borders and drop shadows.
 */

// 1. Binder Clip (Vintage bronze/metal clip)
export const BinderClip = ({ className = 'w-10 h-8 -top-4 left-1/2 -translate-x-1/2' }) => (
  <div
    aria-hidden="true"
    className={`absolute z-20 pointer-events-none drop-shadow-md ${className}`}
  >
    <svg viewBox="0 0 50 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Wire loop */}
      <path
        d="M18 18V8C18 4.686 20.686 2 24 2H26C29.314 2 32 4.686 32 8V18"
        stroke="#4a423b"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M20 18V9C20 6.79 21.79 5 24 5H26C28.21 5 30 6.79 30 9V18"
        stroke="#8a7e72"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Metal clip body */}
      <rect x="10" y="16" width="30" height="20" rx="3" fill="#2d2722" stroke="#1a1614" strokeWidth="1.5" />
      {/* Highlight ridge */}
      <rect x="13" y="19" width="24" height="2" rx="1" fill="#6b5f54" opacity="0.8" />
      <rect x="13" y="24" width="24" height="8" rx="2" fill="#3d352e" />
    </svg>
  </div>
);

// 2. Washi Tape Strip
export const WashiTape = ({
  variant = 'mauve', // 'mauve' | 'sage' | 'yellow' | 'pink'
  rotation = 'rotate-1', // '-rotate-2' | '-rotate-1' | 'rotate-1' | 'rotate-2'
  className = 'w-24 -top-3 left-1/2 -translate-x-1/2',
}) => {
  const variantClass = {
    mauve: 'washi-tape-mauve',
    sage: 'washi-tape-sage',
    yellow: 'washi-tape-yellow',
    pink: 'washi-tape-pink',
  }[variant] || 'washi-tape-mauve';

  return (
    <div
      aria-hidden="true"
      className={`washi-tape ${variantClass} ${rotation} ${className}`}
    />
  );
};

// 3. Smiley Sticker (Original hand-drawn cutout)
export const SmileySticker = ({ className = 'w-14 h-14', rotation = '-rotate-2' }) => (
  <div
    aria-hidden="true"
    className={`inline-block pointer-events-none drop-shadow-md ${rotation} ${className}`}
  >
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* White cutout background */}
      <circle cx="30" cy="30" r="28" fill="#ffffff" />
      {/* Yellow / cream inner circle */}
      <circle cx="30" cy="30" r="24" fill="#faf5e4" stroke="#1e1b18" strokeWidth="3" />
      {/* Two pill eyes */}
      <ellipse cx="23" cy="24" rx="2.5" ry="4.5" fill="#1e1b18" />
      <ellipse cx="37" cy="24" rx="2.5" ry="4.5" fill="#1e1b18" />
      {/* Smile curve */}
      <path
        d="M20 35C22 41 38 41 40 35"
        stroke="#1e1b18"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

// 4. Star Sticker (Yellow star cutout with optional content/match %)
export const StarSticker = ({
  children,
  className = 'w-14 h-14',
  rotation = 'rotate-2',
}) => (
  <div
    aria-hidden="true"
    className={`relative inline-flex items-center justify-center pointer-events-none drop-shadow-md ${rotation} ${className}`}
  >
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* White cutout stroke */}
      <path
        d="M30 3L37.5 20.5L56 22L42 34.5L46.5 53L30 43.5L13.5 53L18 34.5L4 22L22.5 20.5L30 3Z"
        fill="#ffffff"
      />
      {/* Yellow inner star */}
      <path
        d="M30 6L36.5 21.5L53 23L40.5 34L44.5 50.5L30 42L15.5 50.5L19.5 34L7 23L23.5 21.5L30 6Z"
        fill="#facc15"
        stroke="#7b4630"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
    {children && (
      <div className="absolute inset-0 flex items-center justify-center text-center font-heading font-bold text-xs text-[#7b4630] pt-1">
        {children}
      </div>
    )}
  </div>
);

// 5. Speech Bubble Torn-Note Sticker (for Discover match reason)
export const SpeechBubbleSticker = ({
  children,
  className = '',
  rotation = '-rotate-1',
}) => (
  <div
    aria-hidden="true"
    className={`relative note-cream p-3 rounded-xl border border-[#dfd7c5] shadow-xs text-xs text-[#1e1b18] ${rotation} ${className}`}
  >
    {/* Speech pointer pin */}
    <div
      className="absolute -top-2 left-6 w-3 h-3 bg-[#faf6ee] border-t border-l border-[#dfd7c5] rotate-45"
    />
    <div className="relative z-10 flex items-start gap-2">
      <span className="text-amber-800 font-bold">✨</span>
      <p className="font-mono text-xs leading-relaxed text-[#2d241e]">
        {children}
      </p>
    </div>
  </div>
);

// 6. Lightbulb Sticker
export const LightbulbSticker = ({ className = 'w-10 h-10', rotation = 'rotate-1' }) => (
  <div aria-hidden="true" className={`inline-block pointer-events-none drop-shadow-sm ${rotation} ${className}`}>
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M20 3C12 3 7 8.5 7 15.5C7 20 10.5 23.5 13.5 26.5V30H26.5V26.5C29.5 23.5 33 20 33 15.5C33 8.5 28 3 20 3Z" fill="#ffffff" />
      <path d="M20 5C13.5 5 9 9.5 9 15.5C9 19.5 12 22.5 15 25.5V29H25V25.5C28 22.5 31 19.5 31 15.5C31 9.5 26.5 5 20 5Z" fill="#fde047" stroke="#7b4630" strokeWidth="2" strokeLinejoin="round" />
      <path d="M15 32H25V35C25 36.1 24.1 37 23 37H17C15.9 37 15 36.1 15 35V32Z" fill="#78716c" stroke="#1e1b18" strokeWidth="1.5" />
      <path d="M16 13C16 10.5 18 8.5 20.5 8.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  </div>
);

// 7. Pencil Sticker
export const PencilSticker = ({ className = 'w-10 h-10', rotation = '-rotate-2' }) => (
  <div aria-hidden="true" className={`inline-block pointer-events-none drop-shadow-sm ${rotation} ${className}`}>
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M8 32L12 21L27 6L34 13L19 28L8 32Z" fill="#ffffff" />
      <path d="M11 22L25 8L31 14L17 28L9 31L11 22Z" fill="#f97316" stroke="#7b4630" strokeWidth="2" />
      <polygon points="9,31 13,29 11,27" fill="#fcd34d" />
      <polygon points="9,31 10,29 9,30" fill="#1e1b18" />
      <rect x="27" y="4" width="7" height="4" rx="1" transform="rotate(45 27 4)" fill="#f472b6" stroke="#7b4630" strokeWidth="1.5" />
    </svg>
  </div>
);

// 8. Laptop Sticker
export const LaptopSticker = ({ className = 'w-12 h-10', rotation = 'rotate-2' }) => (
  <div aria-hidden="true" className={`inline-block pointer-events-none drop-shadow-sm ${rotation} ${className}`}>
    <svg viewBox="0 0 48 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="6" y="6" width="36" height="24" rx="3" fill="#ffffff" />
      <rect x="8" y="8" width="32" height="20" rx="2" fill="#3b82f6" stroke="#1e1b18" strokeWidth="2" />
      <rect x="11" y="11" width="26" height="14" rx="1" fill="#1e293b" />
      {/* Code prompt bracket */}
      <path d="M16 16L19 18L16 20M21 21H25" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
      {/* Laptop base */}
      <path d="M2 30H46C46 32.2 44.2 34 42 34H6C3.8 34 2 32.2 2 30Z" fill="#e2e8f0" stroke="#1e1b18" strokeWidth="2" />
    </svg>
  </div>
);

// 9. Book Sticker
export const BookSticker = ({ className = 'w-10 h-10', rotation = '-rotate-1' }) => (
  <div aria-hidden="true" className={`inline-block pointer-events-none drop-shadow-sm ${rotation} ${className}`}>
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M5 10C12 7 18 9 20 12C22 9 28 7 35 10V30C28 27 22 29 20 32C18 29 12 27 5 30V10Z" fill="#ffffff" />
      <path d="M6 11C12.5 8.5 18 10 20 13C22 10 27.5 8.5 34 11V29C27.5 26.5 22 28 20 31C18 28 12.5 26.5 6 29V11Z" fill="#10b981" stroke="#7b4630" strokeWidth="2" />
      <line x1="20" y1="13" x2="20" y2="31" stroke="#7b4630" strokeWidth="2" />
    </svg>
  </div>
);

// 10. Bunny Doodle (Corner mascot matching the reference poster)
export const BunnyDoodle = ({ className = 'w-14 h-14', rotation = 'rotate-2' }) => (
  <div aria-hidden="true" className={`inline-block pointer-events-none drop-shadow-md ${rotation} ${className}`}>
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* White cutout border */}
      <path
        d="M20 10C20 4 25 4 25 12V24C28 22 32 22 35 24V12C35 4 40 4 40 10V26C47 28 50 35 50 42C50 51 41 55 30 55C19 55 10 51 10 42C10 35 13 28 20 26V10Z"
        fill="#ffffff"
      />
      {/* Head and ears outline */}
      <path
        d="M22 12C22 7 24.5 7 24.5 14V25M35.5 14C35.5 7 38 7 38 12V25"
        stroke="#1e1b18"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Head oval */}
      <ellipse cx="30" cy="38" rx="16" ry="13" fill="#ffffff" stroke="#1e1b18" strokeWidth="3.5" />
      {/* Two dot eyes */}
      <circle cx="24" cy="36" r="2.5" fill="#1e1b18" />
      <circle cx="36" cy="36" r="2.5" fill="#1e1b18" />
      {/* Mouth curve */}
      <path d="M26 43C28 45 30 45 30 43C30 45 32 45 34 43" stroke="#1e1b18" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  </div>
);

// 11. Gingham Background Fabric Patch
export const GinghamPatch = ({ className = 'w-32 h-32' }) => (
  <div
    aria-hidden="true"
    className={`patch-gingham rounded-2xl shadow-xs border border-blue-200/50 pointer-events-none ${className}`}
  />
);

// 12. Halftone Sunburst Dots Accent
export const HalftoneSunburst = ({ className = 'w-36 h-36' }) => (
  <div
    aria-hidden="true"
    className={`halftone-dots rounded-full opacity-70 pointer-events-none ${className}`}
  />
);
