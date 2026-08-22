import type { Session, Vehicle } from './types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

type AuthInput = { name?: string; email: string; password: string };

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({ error: 'Request failed.' }))) as { error?: string };
    throw new Error(body.error ?? 'Request failed.');
  }

  return response.json() as Promise<T>;
}

export const api = {
  register: (input: Required<AuthInput>) =>
    request<Session>('/api/auth/register', { method: 'POST', body: JSON.stringify(input) }),
  login: (input: Omit<AuthInput, 'name'>) =>
    request<Session>('/api/auth/login', { method: 'POST', body: JSON.stringify(input) }),
  vehicles: (token: string, search: URLSearchParams) =>
    request<Vehicle[]>(`/api/vehicles/search?${search.toString()}`, {}, token),
  purchase: (token: string, id: string) =>
    request<Vehicle>(`/api/vehicles/${id}/purchase`, { method: 'POST' }, token)
};
