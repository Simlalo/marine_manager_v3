import axios, { AxiosError } from 'axios';
import { 
  Gerant, 
  CreateGerantDTO, 
  UpdateGerantDTO, 
  GerantFilters, 
  ImportGerantResult,
  GerantValidationError 
} from '../types/gerant';
import { GerantValidationService } from './gerant-validation.service';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Error handler
const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new GerantValidationError(
      axiosError.response?.data?.message || 'Une erreur est survenue',
      axiosError.response?.status?.toString() || 'UNKNOWN_ERROR',
      undefined
    );
  }
  throw error;
};

export const gerantService = {
  async getGerants(filters?: GerantFilters): Promise<{ items: Gerant[]; total: number }> {
    const response = await api.get<{
      items: Gerant[];
      total: number;
    }>('/gerants', { params: filters }).catch(handleApiError);
    
    return response.data;
  },

  async createGerant(data: CreateGerantDTO): Promise<Gerant> {
    // Validate data
    const validation = GerantValidationService.validateGerant(data);
    GerantValidationService.throwIfInvalid(validation);

    const response = await api.post<Gerant>('/gerants', data).catch(handleApiError);
    return response.data;
  },

  async updateGerant(id: number, data: UpdateGerantDTO): Promise<Gerant> {
    // Validate data
    const validation = GerantValidationService.validateGerant(data);
    GerantValidationService.throwIfInvalid(validation);

    const response = await api.patch<Gerant>(`/gerants/${id}`, data).catch(handleApiError);
    return response.data;
  },

  async deleteGerant(id: number): Promise<void> {
    await api.delete(`/gerants/${id}`).catch(handleApiError);
  },

  async checkCineExists(cine: string): Promise<boolean> {
    const response = await api.get<{ exists: boolean }>(`/gerants/check-cine/${cine}`).catch(handleApiError);
    return response.data.exists;
  },

  async getGerantBarques(id: number): Promise<{ id: number }[]> {
    const response = await api.get<{
      items: { id: number }[];
    }>(`/gerants/${id}/barques`).catch(handleApiError);
    return response.data.items;
  },

  async bulkImport(gerants: CreateGerantDTO[]): Promise<ImportGerantResult> {
    // Validate all gerants
    const validation = GerantValidationService.validateImport(gerants);
    GerantValidationService.throwIfInvalid(validation);

    const response = await api.post<ImportGerantResult>('/gerants/bulk', gerants).catch(handleApiError);
    return response.data;
  }
};
