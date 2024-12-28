import { create } from 'zustand';
import { 
  RapportData,
  RapportFilters
} from '../types/rapport';
import { useAuthStore } from './auth.store';

interface RapportState {
  rapport: RapportData | null;
  filters: RapportFilters;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchRapport: (filters?: RapportFilters) => Promise<void>;
  exportRapport: (format: 'pdf' | 'excel') => Promise<void>;
  setFilters: (filters: RapportFilters) => void;
  clearError: () => void;
}

export const useRapportStore = create<RapportState>((set, get) => ({
  rapport: null,
  filters: {},
  isLoading: false,
  error: null,

  fetchRapport: async (filters?: RapportFilters) => {
    try {
      set({ isLoading: true, error: null });
      const gerantId = useAuthStore.getState().user?.id;
      
      const response = await fetch(`/api/gerants/${gerantId}/rapports?` + new URLSearchParams({
        ...get().filters,
        ...filters,
      }));

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du rapport');
      }

      const data = await response.json();
      set({ rapport: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Une erreur est survenue', 
        isLoading: false 
      });
    }
  },

  exportRapport: async (format: 'pdf' | 'excel') => {
    try {
      set({ isLoading: true, error: null });
      const gerantId = useAuthStore.getState().user?.id;
      
      const response = await fetch(`/api/gerants/${gerantId}/rapports/export?` + new URLSearchParams({
        format,
        ...get().filters,
      }));

      if (!response.ok) {
        throw new Error('Erreur lors de l\'export du rapport');
      }

      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport-${format}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      set({ isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Une erreur est survenue', 
        isLoading: false 
      });
    }
  },

  setFilters: (filters: RapportFilters) => {
    set({ filters });
    get().fetchRapport(filters);
  },

  clearError: () => {
    set({ error: null });
  },
}));
