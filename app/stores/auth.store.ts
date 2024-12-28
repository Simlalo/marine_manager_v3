import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginCredentials, AuthResponse, AuthError, UserRole } from '../types/auth';
import { mockFetch } from '../lib/mock-api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: AuthError | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const api = import.meta.env.DEV ? mockFetch : fetch;

// Test users for development
const testUsers = {
  admin: {
    id: 1,
    email: 'admin@gestmarine.com',
    nom: 'Administrator',
    role: UserRole.ADMIN
  },
  gerant: {
    id: 2,
    email: 'gerant@gestmarine.com',
    nom: 'Gérant',
    role: UserRole.GERANT
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: import.meta.env.DEV ? testUsers.admin : null,
      token: import.meta.env.DEV ? 'mock-token' : null,
      isLoading: false,
      error: null,
      isAuthenticated: import.meta.env.DEV,

      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true, error: null });
          
          // En mode développement, utiliser les données de test
          if (import.meta.env.DEV) {
            const testUser = credentials.email === 'admin@gestmarine.com' && credentials.password === 'admin123'
              ? testUsers.admin
              : null;

            if (!testUser) {
              throw new Error('Invalid credentials');
            }

            set({
              user: testUser,
              token: 'mock-token',
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
            return;
          }

          const response = await api('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
          });

          if (!response.ok) {
            throw new Error('Login failed');
          }

          const data: AuthResponse = await response.json();
          
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? { message: error.message, code: 'AUTH_ERROR' } : { message: 'Une erreur est survenue', code: 'UNKNOWN_ERROR' },
            isAuthenticated: false,
            user: null,
            token: null
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        });
      },

      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
