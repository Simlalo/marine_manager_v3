import axios, { AxiosError } from 'axios';
import { 
  Barque, 
  CreateBarqueDTO, 
  UpdateBarqueDTO, 
  BarqueFilters, 
  ImportResult, 
  ImportError,
  BarqueError 
} from '../types/barque';
import { ValidationService } from './validation.service';

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
    throw new BarqueError(
      axiosError.response?.data?.message || 'Une erreur est survenue',
      axiosError.response?.status?.toString() || 'UNKNOWN_ERROR',
      undefined
    );
  }
  throw error;
};

export const barqueService = {
  async getBarques(page = 1, limit = 10, search?: string) {
    try {
      const params = {
        page,
        limit,
        search
      };
      
      const response = await api.get<{
        items: Barque[];
        total: number;
        totalPages: number;
        currentPage: number;
      }>('/barques', { params });
      
      return {
        items: response.data.items,
        total: response.data.total,
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getAllBarques() {
    try {
      const response = await api.get('/barques', {
        params: {
          limit: 1000 // Using a large limit to get all barques
        }
      });
      return response.data.items;
    } catch (error) {
      handleApiError(error);
    }
  },

  async createBarque(data: CreateBarqueDTO) {
    // Validate data
    const validation = ValidationService.validateBarque(data);
    ValidationService.throwIfInvalid(validation);

    try {
      const response = await api.post<Barque>('/barques', data);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async updateBarque(id: number, data: UpdateBarqueDTO) {
    // Validate data
    const validation = ValidationService.validateBarque(data);
    ValidationService.throwIfInvalid(validation);

    try {
      const response = await api.put<Barque>(`/barques/${id}`, data);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async deleteBarque(id: number) {
    try {
      await api.delete(`/barques/${id}`);
    } catch (error) {
      handleApiError(error);
    }
  },

  async bulkImport(barques: CreateBarqueDTO[]): Promise<ImportResult> {
    try {
      const response = await api.post<ImportResult>('/barques/bulk', { barques });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }
};
