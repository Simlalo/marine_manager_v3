import { create } from 'zustand';
import { Barque, BarqueFilters, CreateBarqueDTO, UpdateBarqueDTO, ImportResult, BarqueError } from '../types/barque';
import { barqueService } from '../services/barque.service';

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
}

interface BarqueState {
  barques: Barque[];
  selectedBarque: Barque | null;
  filters: BarqueFilters;
  isLoading: boolean;
  error: string | null;
  pagination: PaginationState;
  optimisticUpdates: Map<number, Barque>;
  pendingDeletes: Set<number>;
  
  // Actions
  fetchBarques: (page?: number) => Promise<void>;
  createBarque: (data: CreateBarqueDTO) => Promise<Barque>;
  updateBarque: (id: number, data: UpdateBarqueDTO) => Promise<void>;
  deleteBarque: (id: number) => Promise<void>;
  selectBarque: (barque: Barque | null) => void;
  setFilters: (filters: BarqueFilters) => void;
  clearError: () => void;
  bulkImport: (barques: CreateBarqueDTO[]) => Promise<ImportResult>;
  cleanup: () => void;
}

export const useBarqueStore = create<BarqueState>((set, get) => ({
  barques: [],
  selectedBarque: null,
  filters: {
    search: '',
    statut: undefined,
    gerantId: undefined
  },
  isLoading: false,
  error: null,
  optimisticUpdates: new Map(),
  pendingDeletes: new Set(),
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10
  },

  cleanup: () => {
    set({
      barques: [],
      selectedBarque: null,
      error: null,
      isLoading: false,
      optimisticUpdates: new Map(),
      pendingDeletes: new Set()
    });
  },

  fetchBarques: ((page = 1) => async () => {
    const state = get();
    if (state.isLoading) return; // Prevent concurrent fetches
    
    try {
      set({ isLoading: true, error: null });
      console.log('Fetching barques with page:', page);
      
      const { pagination } = state;
      const response = await barqueService.getBarques(
        page, 
        pagination.limit,
        state.filters.search
      );

      if (!response) {
        throw new Error('No response from server');
      }
      
      console.log('Fetched barques:', response);
      
      // Apply any pending optimistic updates
      const updatedBarques = response.items.map(barque => {
        const optimisticUpdate = state.optimisticUpdates.get(barque.id);
        return optimisticUpdate || barque;
      }).filter((barque): barque is Barque => {
        return !state.pendingDeletes.has(barque.id);
      });

      console.log('Updated barques after optimistic updates:', updatedBarques);

      set({
        barques: updatedBarques,
        pagination: {
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          total: response.total,
          limit: pagination.limit
        },
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching barques:', error);
      set({ 
        error: error instanceof BarqueError ? error.message : 'Une erreur est survenue lors du chargement des barques',
        isLoading: false 
      });
    }
  })(),

  createBarque: ((data: CreateBarqueDTO) => async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await barqueService.createBarque(data);
      if (!response) {
        throw new Error('Failed to create barque');
      }
      return response;
    } catch (error) {
      set({ 
        error: error instanceof BarqueError ? error.message : 'Une erreur est survenue lors de la création de la barque',
        isLoading: false 
      });
      throw error;
    }
  })(),

  updateBarque: ((id: number, data: UpdateBarqueDTO) => async () => {
    const currentBarque = get().barques.find(b => b.id === id);
    if (!currentBarque) return;

    // Create optimistic update
    const optimisticBarque = { ...currentBarque, ...data };
    
    try {
      // Apply optimistic update
      get().optimisticUpdates.set(id, optimisticBarque);
      set(state => ({
        barques: state.barques.map(b => b.id === id ? optimisticBarque : b)
      }));

      // Make the actual update
      await barqueService.updateBarque(id, data);
      
      // Clear optimistic update on success
      get().optimisticUpdates.delete(id);
      set(state => ({ optimisticUpdates: new Map(state.optimisticUpdates) }));
      
    } catch (error) {
      // Revert optimistic update on error
      get().optimisticUpdates.delete(id);
      set(state => ({
        barques: state.barques.map(b => b.id === id ? currentBarque : b),
        error: error instanceof BarqueError ? error.message : 'Une erreur est survenue lors de la mise à jour de la barque',
        optimisticUpdates: new Map(state.optimisticUpdates)
      }));
      throw error;
    }
  })(),

  deleteBarque: ((id: number) => async () => {
    const currentBarque = get().barques.find(b => b.id === id);
    if (!currentBarque) return;

    try {
      // Optimistic delete
      get().pendingDeletes.add(id);
      set(state => ({
        barques: state.barques.filter(b => b.id !== id),
        pagination: {
          ...state.pagination,
          total: state.pagination.total - 1
        }
      }));

      await barqueService.deleteBarque(id);
      
      // Clear from pending deletes
      get().pendingDeletes.delete(id);
      set(state => ({ pendingDeletes: new Set(state.pendingDeletes) }));
      
    } catch (error) {
      // Revert optimistic delete on error
      get().pendingDeletes.delete(id);
      set(state => ({
        barques: [currentBarque, ...state.barques],
        error: error instanceof BarqueError ? error.message : 'Une erreur est survenue lors de la suppression de la barque',
        pendingDeletes: new Set(state.pendingDeletes),
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1
        }
      }));
      throw error;
    }
  })(),

  selectBarque: ((barque: Barque | null) => () => {
    set({ selectedBarque: barque });
  })(),

  setFilters: ((filters: BarqueFilters) => () => {
    set({ filters });
    get().fetchBarques(1); // Reset to first page when filters change
  })(),

  clearError: (() => () => {
    set({ error: null });
  })(),

  bulkImport: ((barques: CreateBarqueDTO[]) => async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await barqueService.bulkImport(barques);
      
      // Refresh the data
      await get().fetchBarques(1);
      
      return result;
    } catch (error) {
      set({ 
        error: error instanceof BarqueError ? error.message : 'Une erreur est survenue lors de l\'import',
        isLoading: false 
      });
      throw error;
    }
  })()
}));
