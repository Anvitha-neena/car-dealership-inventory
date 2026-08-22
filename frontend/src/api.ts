import type { Session, Vehicle, VehicleInput } from './types';

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

  if (response.status === 204) return undefined as T;
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
    request<Vehicle>(`/api/vehicles/${id}/purchase`, { method: 'POST' }, token),
  createVehicle: (token: string, input: VehicleInput) =>
    request<Vehicle>('/api/vehicles', { method: 'POST', body: JSON.stringify(input) }, token),
  updateVehicle: (token: string, id: string, input: Partial<VehicleInput>) =>
    request<Vehicle>(`/api/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(input) }, token),
  deleteVehicle: (token: string, id: string) =>
    request<void>(`/api/vehicles/${id}`, { method: 'DELETE' }, token),
  restockVehicle: (token: string, id: string, quantity: number) =>
    request<Vehicle>(`/api/vehicles/${id}/restock`, { method: 'POST', body: JSON.stringify({ quantity }) }, token)
};
