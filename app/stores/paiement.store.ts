import { create } from 'zustand';
import { 
  Paiement, 
  PaiementFilters, 
  CreatePaiementDTO,
  PaiementSummary 
} from '../types/paiement';
import { useAuthStore } from './auth.store';

interface PaiementState {
  paiements: Paiement[];
  summary: PaiementSummary | null;
  filters: PaiementFilters;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchPaiements: (filters?: PaiementFilters) => Promise<void>;
  createPaiement: (data: CreatePaiementDTO) => Promise<void>;
  fetchSummary: (annee: number, mois: number) => Promise<void>;
  setFilters: (filters: PaiementFilters) => void;
  clearError: () => void;
}

export const usePaiementStore = create<PaiementState>((set, get) => ({
  paiements: [],
  summary: null,
  filters: {},
  isLoading: false,
  error: null,

  fetchPaiements: async (filters?: PaiementFilters) => {
    try {
      set({ isLoading: true, error: null });
      const gerantId = useAuthStore.getState().user?.id;
      
      const response = await fetch(`/api/gerants/${gerantId}/paiements?` + new URLSearchParams({
        ...get().filters,
        ...filters,
      }));

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des paiements');
      }

      const data = await response.json();
      set({ paiements: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Une erreur est survenue', 
        isLoading: false 
      });
    }
  },

  createPaiement: async (data: CreatePaiementDTO) => {
    try {
      set({ isLoading: true, error: null });
      const gerantId = useAuthStore.getState().user?.id;
      
      const response = await fetch(`/api/gerants/${gerantId}/paiements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du paiement');
      }

      const newPaiement = await response.json();
      set(state => ({
        paiements: [...state.paiements, newPaiement],
        isLoading: false,
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Une erreur est survenue', 
        isLoading: false 
      });
    }
  },

  fetchSummary: async (annee: number, mois: number) => {
    try {
      set({ isLoading: true, error: null });
      const gerantId = useAuthStore.getState().user?.id;
      
      const response = await fetch(`/api/gerants/${gerantId}/paiements/summary?annee=${annee}&mois=${mois}`);

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du résumé des paiements');
      }

      const data = await response.json();
      set({ summary: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Une erreur est survenue', 
        isLoading: false 
      });
    }
  },

  setFilters: (filters: PaiementFilters) => {
    set({ filters });
    get().fetchPaiements(filters);
  },

  clearError: () => {
    set({ error: null });
  },
}));
