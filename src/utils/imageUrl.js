/**
 * Resolves avatar and media image URLs properly across dev and prod environments.
 */
export const getAvatarUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Blob and data URLs for client-side uploads/previews
  if (
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  ) {
    return trimmed;
  }

  // Relative paths like /uploads/avatars/... proxied by Vite dev server
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};
