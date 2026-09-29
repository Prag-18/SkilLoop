import React, { useState } from 'react';
import { Plus, X, Tag } from 'lucide-react';
import Badge from '../ui/Badge';

export const TagInput = ({
  tags = [],
  onChange,
  maxTags = 8,
  maxLength = 30,
  label = 'Interests & Topics',
  placeholder = 'Add an interest and press Enter...',
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const trimmed = inputValue.trim().replace(/^,+|,+$/g, '');
    if (!trimmed) return;

    setError('');

    if (tags.length >= maxTags) {
      setError(`Maximum ${maxTags} interests allowed.`);
      return;
    }

    if (trimmed.length > maxLength) {
      setError(`Each item cannot exceed ${maxLength} characters.`);
      return;
    }

    if (tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setError(`"${trimmed}" is already added.`);
      return;
    }

    onChange([...tags, trimmed]);
    setInputValue('');
  };

  const removeTag = (indexToRemove) => {
    if (disabled) return;
    onChange(tags.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="w-full flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-stone-700 tracking-wide">
          {label}
        </label>
        <span className="text-[11px] text-stone-500 font-mono">
          {tags.length}/{maxTags}
        </span>
      </div>

      {/* Tags Display */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl bg-[#faf6ee] border-2 border-[#dfd7c5] min-h-[38px] items-center">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#ebdcc2] text-amber-950 border border-[#d6c7b2] transition-all hover:bg-[#dfd0b5]"
            >
              <span>{tag}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeTag(idx)}
                  className="p-0.5 rounded text-amber-900 hover:text-rose-700 hover:bg-[#d6c7b2]/50"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Input Field */}
      {tags.length < maxTags && !disabled && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute left-3.5 text-stone-400 pointer-events-none top-1/2 -translate-y-1/2">
              <Tag className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (error) setError('');
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              maxLength={maxLength}
              disabled={disabled}
              className="w-full rounded-xl bg-[#fffdfa] border-2 border-[#dfd7c5] focus:border-amber-700 focus:ring-amber-500/20 px-4 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 pl-10 transition-all duration-200"
            />
          </div>
          <button
            type="button"
            onClick={addTag}
            disabled={!inputValue.trim() || disabled}
            className="px-3.5 py-2 rounded-xl bg-[#7b4630] hover:bg-[#683b28] disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      )}

      {error && <span className="text-xs font-medium text-rose-400">{error}</span>}
    </div>
  );
};

export default TagInput;
