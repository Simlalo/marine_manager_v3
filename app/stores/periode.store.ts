import { create } from 'zustand';
import { 
  Periode, 
  PeriodeFilters, 
  CreatePeriodeDTO, 
  UpdatePeriodeDTO 
} from '../types/periode';
import { useAuthStore } from './auth.store';

interface PeriodeState {
  periodes: Periode[];
  selectedPeriode: Periode | null;
  filters: PeriodeFilters;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchPeriodes: (filters?: PeriodeFilters) => Promise<void>;
  createPeriode: (data: CreatePeriodeDTO) => Promise<void>;
  updatePeriode: (id: number, data: UpdatePeriodeDTO) => Promise<void>;
  generatePeriodes: (barqueIds: number[], annee: number, mois: number) => Promise<void>;
  selectPeriode: (periode: Periode | null) => void;
  setFilters: (filters: PeriodeFilters) => void;
  clearError: () => void;
}

export const usePeriodeStore = create<PeriodeState>((set, get) => ({
  periodes: [],
  selectedPeriode: null,
  filters: {},
  isLoading: false,
  error: null,

  fetchPeriodes: async (filters?: PeriodeFilters) => {
    try {
      set({ isLoading: true, error: null });
      const gerantId = useAuthStore.getState().user?.id;
      
      const response = await fetch(`/api/gerants/${gerantId}/periodes?` + new URLSearchParams({
        ...get().filters,
        ...filters,
      }));

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des périodes');
      }

      const data = await response.json();
      set({ periodes: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Une erreur est survenue', 
        isLoading: false 
      });
    }
  },

  createPeriode: async (data: CreatePeriodeDTO) => {
    try {
      set({ isLoading: true, error: null });
      const gerantId = useAuthStore.getState().user?.id;
      
      const response = await fetch(`/api/gerants/${gerantId}/periodes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la période');
      }

      const newPeriode = await response.json();
      set(state => ({
        periodes: [...state.periodes, newPeriode],
        isLoading: false,
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Une erreur est survenue', 
        isLoading: false 
      });
    }
  },

  updatePeriode: async (id: number, data: UpdatePeriodeDTO) => {
    try {
      set({ isLoading: true, error: null });
      const gerantId = useAuthStore.getState().user?.id;
      
      const response = await fetch(`/api/gerants/${gerantId}/periodes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de la période');
      }

      const updatedPeriode = await response.json();
      set(state => ({
        periodes: state.periodes.map(p => 
          p.id === id ? updatedPeriode : p
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Une erreur est survenue', 
        isLoading: false 
      });
    }
  },

  generatePeriodes: async (barqueIds: number[], annee: number, mois: number) => {
    try {
      set({ isLoading: true, error: null });
      const gerantId = useAuthStore.getState().user?.id;
      
      const response = await fetch(`/api/gerants/${gerantId}/periodes/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ barque_ids: barqueIds, annee, mois }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération des périodes');
      }

      await get().fetchPeriodes();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Une erreur est survenue', 
        isLoading: false 
      });
    }
  },

  selectPeriode: (periode: Periode | null) => {
    set({ selectedPeriode: periode });
  },

  setFilters: (filters: PeriodeFilters) => {
    set({ filters });
    get().fetchPeriodes(filters);
  },

  clearError: () => {
    set({ error: null });
  },
}));
