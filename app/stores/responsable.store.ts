import { create } from 'zustand';
import { 
  Responsable, 
  ResponsableFilters, 
  CreateResponsableDTO, 
  UpdateResponsableDTO 
} from '../types/responsable';
import { useAuthStore } from './auth.store';

interface ResponsableState {
  responsables: Responsable[];
  selectedResponsable: Responsable | null;
  filters: ResponsableFilters;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchResponsables: (filters?: ResponsableFilters) => Promise<void>;
  createResponsable: (data: CreateResponsableDTO) => Promise<void>;
  updateResponsable: (id: number, data: UpdateResponsableDTO) => Promise<void>;
  assignBarque: (responsableId: number, barqueId: number) => Promise<void>;
  selectResponsable: (responsable: Responsable | null) => void;
  setFilters: (filters: ResponsableFilters) => void;
  clearError: () => void;
}

export const useResponsableStore = create<ResponsableState>((set, get) => ({
  responsables: [],
  selectedResponsable: null,
  filters: {},
  isLoading: false,
  error: null,

  fetchResponsables: async (filters?: ResponsableFilters) => {
    try {
      set({ isLoading: true, error: null });
      const gerantId = useAuthStore.getState().user?.id;
      
      const response = await fetch(`/api/gerants/${gerantId}/responsables?` + new URLSearchParams({
        ...get().filters,
        ...filters,
      }));

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des responsables');
      }

      const data = await response.json();
      set({ responsables: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Une erreur est survenue', 
        isLoading: false 
      });
    }
  },

  createResponsable: async (data: CreateResponsableDTO) => {
    try {
      set({ isLoading: true, error: null });
      const gerantId = useAuthStore.getState().user?.id;
      
      const response = await fetch(`/api/gerants/${gerantId}/responsables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du responsable');
      }

      const newResponsable = await response.json();
      set(state => ({
        responsables: [...state.responsables, newResponsable],
        isLoading: false,
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Une erreur est survenue', 
        isLoading: false 
      });
    }
  },

  updateResponsable: async (id: number, data: UpdateResponsableDTO) => {
    try {
      set({ isLoading: true, error: null });
      const gerantId = useAuthStore.getState().user?.id;
      
      const response = await fetch(`/api/gerants/${gerantId}/responsables/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du responsable');
      }

      const updatedResponsable = await response.json();
      set(state => ({
        responsables: state.responsables.map(r => 
          r.id === id ? updatedResponsable : r
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

  assignBarque: async (responsableId: number, barqueId: number) => {
    try {
      set({ isLoading: true, error: null });
      const gerantId = useAuthStore.getState().user?.id;
      
      const response = await fetch(`/api/gerants/${gerantId}/responsables/${responsableId}/barques`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ barque_id: barqueId }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'attribution de la barque');
      }

      await get().fetchResponsables();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Une erreur est survenue', 
        isLoading: false 
      });
    }
  },

  selectResponsable: (responsable: Responsable | null) => {
    set({ selectedResponsable: responsable });
  },

  setFilters: (filters: ResponsableFilters) => {
    set({ filters });
    get().fetchResponsables(filters);
  },

  clearError: () => {
    set({ error: null });
  },
}));
