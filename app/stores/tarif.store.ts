import { create } from 'zustand';
import { 
  Tarif, 
  TarifFilters, 
  CreateTarifDTO, 
  UpdateTarifDTO 
} from '../types/tarif';
import { useAuthStore } from './auth.store';

interface TarifState {
  tarifs: Tarif[];
  selectedTarif: Tarif | null;
  filters: TarifFilters;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchTarifs: (filters?: TarifFilters) => Promise<void>;
  createTarif: (data: CreateTarifDTO) => Promise<void>;
  updateTarif: (id: number, data: UpdateTarifDTO) => Promise<void>;
  selectTarif: (tarif: Tarif | null) => void;
  setFilters: (filters: TarifFilters) => void;
  clearError: () => void;
}

export const useTarifStore = create<TarifState>((set, get) => ({
  tarifs: [],
  selectedTarif: null,
  filters: {},
  isLoading: false,
  error: null,

  fetchTarifs: async (filters?: TarifFilters) => {
    try {
      set({ isLoading: true, error: null });
      const gerantId = useAuthStore.getState().user?.id;
      
      const response = await fetch(`/api/gerants/${gerantId}/tarifs?` + new URLSearchParams({
        ...get().filters,
        ...filters,
      }));

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des tarifs');
      }

      const data = await response.json();
      set({ tarifs: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Une erreur est survenue', 
        isLoading: false 
      });
    }
  },

  createTarif: async (data: CreateTarifDTO) => {
    try {
      set({ isLoading: true, error: null });
      const gerantId = useAuthStore.getState().user?.id;
      
      const response = await fetch(`/api/gerants/${gerantId}/tarifs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du tarif');
      }

      const newTarif = await response.json();
      set(state => ({
        tarifs: [...state.tarifs, newTarif],
        isLoading: false,
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Une erreur est survenue', 
        isLoading: false 
      });
    }
  },

  updateTarif: async (id: number, data: UpdateTarifDTO) => {
    try {
      set({ isLoading: true, error: null });
      const gerantId = useAuthStore.getState().user?.id;
      
      const response = await fetch(`/api/gerants/${gerantId}/tarifs/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du tarif');
      }

      const updatedTarif = await response.json();
      set(state => ({
        tarifs: state.tarifs.map(t => 
          t.id === id ? updatedTarif : t
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

  selectTarif: (tarif: Tarif | null) => {
    set({ selectedTarif: tarif });
  },

  setFilters: (filters: TarifFilters) => {
    set({ filters });
    get().fetchTarifs(filters);
  },

  clearError: () => {
    set({ error: null });
  },
}));
