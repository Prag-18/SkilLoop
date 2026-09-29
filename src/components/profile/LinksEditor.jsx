import React, { useState } from 'react';
import { Plus, Trash2, Link as LinkIcon, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';

export const LinksEditor = ({
  links = [],
  onChange,
  maxLinks = 5,
  disabled = false,
}) => {
  const [error, setError] = useState('');

  const handleLinkChange = (index, field, value) => {
    setError('');
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    onChange(newLinks);
  };

  const handleAddLink = () => {
    if (links.length >= maxLinks) {
      setError(`Maximum of ${maxLinks} links allowed.`);
      return;
    }
    setError('');
    onChange([...links, { label: '', url: 'https://' }]);
  };

  const handleRemoveLink = (index) => {
    setError('');
    onChange(links.filter((_, idx) => idx !== index));
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-stone-700 tracking-wide flex items-center gap-1.5">
          <LinkIcon className="w-3.5 h-3.5 text-amber-800" />
          Featured Links (Portfolio, GitHub, LinkedIn, etc.)
        </label>
        <span className="text-[11px] text-stone-500 font-mono">
          {links.length}/{maxLinks}
        </span>
      </div>

      {links.length === 0 && (
        <p className="text-xs text-stone-500 italic">
          No external links added yet.
        </p>
      )}

      <div className="space-y-2.5">
        {links.map((link, idx) => {
          const isUrlValid =
            !link.url ||
            link.url.startsWith('http://') ||
            link.url.startsWith('https://');

          return (
            <div
              key={idx}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 rounded-2xl bg-[#faf6ee] border-2 border-[#dfd7c5] shadow-xs"
            >
              <div className="w-full sm:w-1/3">
                <input
                  type="text"
                  placeholder="Label (e.g. GitHub)"
                  value={link.label || ''}
                  onChange={(e) => handleLinkChange(idx, 'label', e.target.value)}
                  maxLength={50}
                  disabled={disabled}
                  className="w-full rounded-xl bg-[#fffdfa] border-2 border-[#dfd7c5] focus:border-amber-700 px-3 py-1.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none"
                />
              </div>

              <div className="w-full sm:flex-1">
                <input
                  type="url"
                  placeholder="https://..."
                  value={link.url || ''}
                  onChange={(e) => handleLinkChange(idx, 'url', e.target.value)}
                  disabled={disabled}
                  className={`w-full rounded-xl bg-[#fffdfa] border-2 ${
                    !isUrlValid
                      ? 'border-rose-500 focus:ring-rose-500'
                      : 'border-[#dfd7c5] focus:border-amber-700'
                  } px-3 py-1.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none`}
                />
                {!isUrlValid && (
                  <span className="text-[10px] text-rose-600 mt-0.5 block font-medium">
                    Must begin with http:// or https://
                  </span>
                )}
              </div>

              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveLink(idx)}
                  className="p-1.5 text-stone-500 hover:text-rose-700 hover:bg-[#ebdcc2]/60 rounded-lg transition-colors shrink-0"
                  title="Remove link"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {links.length < maxLinks && !disabled && (
        <div className="pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={handleAddLink}
            className="text-xs"
          >
            Add Link
          </Button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-400 mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default LinksEditor;
