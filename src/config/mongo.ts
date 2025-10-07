export const API_BASE = import.meta.env.VITE_API_BASE || '';
export function mediaUrl(filename: string) {
  return `${API_BASE}/api/media/${encodeURIComponent(filename)}`;
}


