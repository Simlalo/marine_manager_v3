// Auth Types
export const UserRole = {
  ADMIN: 'Admin',
  GERANT: 'Gerant'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export type User = {
  id: number;
  email: string;
  role: UserRole;
  nom: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type AuthResponse = {
  user: User;
  token: string;
};

export type AuthError = {
  message: string;
  code: string;
};
