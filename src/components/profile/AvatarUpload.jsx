import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, User, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import { getAvatarUrl } from '../../utils/imageUrl';

export const AvatarUpload = ({
  currentAvatarUrl,
  selectedFile,
  onFileSelect,
  name = '',
  disabled = false,
}) => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');

  // Handle preview update
  useEffect(() => {
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (currentAvatarUrl) {
      setPreview(getAvatarUrl(currentAvatarUrl));
    } else {
      setPreview(null);
    }
  }, [selectedFile, currentAvatarUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    // Check type
    const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a PNG, JPEG, or WebP image.');
      return;
    }

    // Check size (2 MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be under 2 MB.');
      return;
    }

    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleRemove = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setPreview(null);
    setError('');
    if (onFileSelect) {
      onFileSelect(null);
    }
  };

  const initial = name ? name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-slate-300 tracking-wide">
        Profile Photo (Optional)
      </label>

      <div className="flex items-center gap-4">
        {/* Avatar Display */}
        <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-700/80 shadow-md flex items-center justify-center shrink-0 group">
          {preview ? (
            <img
              src={preview}
              alt="Avatar Preview"
              onError={() => setPreview(null)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
              {initial}
            </div>
          )}

          {!disabled && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium cursor-pointer"
            >
              <Camera className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            onChange={handleFileChange}
            disabled={disabled}
          />

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Upload}
              disabled={disabled}
              onClick={() => fileInputRef.current?.click()}
            >
              {preview ? 'Change Photo' : 'Upload Photo'}
            </Button>

            {preview && !disabled && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                icon={X}
                onClick={handleRemove}
                className="text-slate-400 hover:text-rose-400"
              >
                Remove
              </Button>
            )}
          </div>

          <span className="text-[11px] text-slate-500">
            PNG, JPEG, WebP up to 2MB
          </span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-400 mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;
