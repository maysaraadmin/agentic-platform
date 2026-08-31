declare const process: { env: Record<string, string | undefined> };

export const API_URL = process.env.NX_API_URL || 'http://localhost:8000';

export interface JwtPayload {
  sub?: string;
  username?: string;
  name?: string;
  roles?: string[];
  active?: boolean;
  exp?: number;
}

export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded)) as JwtPayload;
  } catch {
    return null;
  }
}
