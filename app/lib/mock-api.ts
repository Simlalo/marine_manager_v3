import type { User } from '../types/auth';
import { UserRole } from '../types/auth';

// Mock user data
const mockUsers: User[] = [
  {
    id: 1,
    email: 'admin@gestmarine.com',
    nom: 'Administrator',
    role: UserRole.ADMIN,
  },
  {
    id: 2,
    email: 'gerant@gestmarine.com',
    nom: 'Gérant',
    role: UserRole.GERANT,
  },
];

// Mock API response delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock fetch implementation
export const mockFetch = async (url: string, options: RequestInit) => {
  await delay(500); // Simulate network delay

  if (url === '/api/auth/login') {
    const { email, password } = JSON.parse(options.body as string);
    const user = mockUsers.find(u => u.email === email);

    if (user && password === 'password') { // For testing, accept any password
      return {
        ok: true,
        json: async () => ({
          user,
          token: 'mock-jwt-token',
        }),
      };
    }

    return {
      ok: false,
      json: async () => ({
        message: 'Invalid credentials',
      }),
    };
  }

  // Add other API endpoints here

  return {
    ok: false,
    json: async () => ({
      message: 'Not found',
    }),
  };
};
