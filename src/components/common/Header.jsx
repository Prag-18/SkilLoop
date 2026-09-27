import React from 'react';
import { Badge } from '../ui/Badge';
import { Sparkles, Award } from 'lucide-react';

export const Header = ({ title, description, badgeText, children }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-300/80 mb-8">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl md:text-3xl font-bold text-stone-900 font-heading tracking-tight">
            {title}
          </h1>
          {badgeText && (
            <Badge variant="indigo" icon={Sparkles}>
              {badgeText}
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-sm text-stone-600 font-normal font-sans">
            {description}
          </p>
        )}
      </div>

      {children && (
        <div className="flex items-center gap-3 shrink-0">
          {children}
        </div>
      )}
    </div>
  );
};

export default Header;
