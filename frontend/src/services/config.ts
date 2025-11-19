// src/services/config.ts

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export function apiUrl(path: string): string {
  if (!path.startsWith("/")) {
    return `${API_BASE_URL}/${path}`;
  }
  return `${API_BASE_URL}${path}`;
}

