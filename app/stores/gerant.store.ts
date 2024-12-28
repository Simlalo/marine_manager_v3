import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Gerant, CreateGerantDTO, UpdateGerantDTO, GerantFilters } from '../types/gerant';
import { gerantService } from '../services/gerant.service';

interface GerantState {
  gerants: Gerant[];
  total: number;
  isLoading: boolean;
  error: string | null;
  filters: GerantFilters;
  pendingDeletes: Set<number>;
  fetchGerants: (filters?: GerantFilters) => Promise<void>;
  createGerant: (data: CreateGerantDTO) => Promise<Gerant>;
  updateGerant: (id: number, data: UpdateGerantDTO) => Promise<Gerant>;
  deleteGerant: (id: number) => Promise<void>;
  checkCineExists: (cine: string) => Promise<boolean>;
  clearError: () => void;
  setFilters: (filters: GerantFilters) => void;
}

export const useGerantStore = create<GerantState>()(
  devtools(
    (set, get) => ({
      gerants: [],
      total: 0,
      isLoading: false,
      error: null,
      filters: {},
      pendingDeletes: new Set<number>(),

      fetchGerants: async (filters?: GerantFilters) => {
        set({ isLoading: true, error: null });
        try {
          const response = await gerantService.getGerants(filters || get().filters);
          set({ 
            gerants: response.items,
            total: response.total,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Une erreur est survenue',
            isLoading: false 
          });
        }
      },

      createGerant: async (data: CreateGerantDTO) => {
        set({ isLoading: true, error: null });
        try {
          const newGerant = await gerantService.createGerant(data);
          set(state => ({
            gerants: [...state.gerants, newGerant],
            total: state.total + 1,
            isLoading: false
          }));
          return newGerant;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Une erreur est survenue',
            isLoading: false 
          });
          throw error;
        }
      },

      updateGerant: async (id: number, data: UpdateGerantDTO) => {
        set({ isLoading: true, error: null });
        try {
          const updatedGerant = await gerantService.updateGerant(id, data);
          set(state => ({
            gerants: state.gerants.map(g => g.id === id ? updatedGerant : g),
            isLoading: false
          }));
          return updatedGerant;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Une erreur est survenue',
            isLoading: false 
          });
          throw error;
        }
      },

      deleteGerant: async (id: number) => {
        // Add to pending deletes
        set(state => ({
          pendingDeletes: new Set([...state.pendingDeletes, id])
        }));

        try {
          await gerantService.deleteGerant(id);
          set(state => ({
            gerants: state.gerants.filter(g => g.id !== id),
            total: state.total - 1,
            pendingDeletes: new Set([...state.pendingDeletes].filter(pendingId => pendingId !== id))
          }));
        } catch (error) {
          // Remove from pending deletes if failed
          set(state => ({
            error: error instanceof Error ? error.message : 'Une erreur est survenue',
            pendingDeletes: new Set([...state.pendingDeletes].filter(pendingId => pendingId !== id))
          }));
          throw error;
        }
      },

      checkCineExists: async (cine: string) => {
        try {
          return await gerantService.checkCineExists(cine);
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Une erreur est survenue' });
          throw error;
        }
      },

      clearError: () => set({ error: null }),

      setFilters: (filters: GerantFilters) => set({ filters })
    }),
    { name: 'gerant-store' }
  )
);
