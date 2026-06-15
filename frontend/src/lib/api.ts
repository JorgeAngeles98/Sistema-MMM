// Cliente HTTP mínimo: adjunta el token JWT y maneja errores de la API.
const TOKEN_KEY = "qnas_token";

// Base del backend. En desarrollo queda vacío (usa el proxy de Vite).
// En producción se define VITE_API_URL con la URL del backend desplegado.
const API_BASE = ((import.meta as any).env?.VITE_API_URL || "")
  .toString()
  .replace(/\/+$/, "");

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string): void => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = (): void => localStorage.removeItem(TOKEN_KEY);

export async function api<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api${path}`, { ...options, headers });
  const data =
    res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || `Error ${res.status}`);
  }
  return data as T;
}

// Subida de archivos (multipart). No fija Content-Type para que el navegador
// ponga el boundary correcto.
export async function apiUpload<T = any>(
  path: string,
  formData: FormData
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api${path}`, {
    method: "POST",
    body: formData,
    headers,
  });
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message || `Error ${res.status}`);
  }
  return data as T;
}
