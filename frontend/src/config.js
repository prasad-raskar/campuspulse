export const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8002`;

// Helper to resolve media URLs (images/PDFs)
// Cloudinary returns full https:// URLs, local uploads return /uploads/... paths
export const getMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_URL}${url}`;
};
