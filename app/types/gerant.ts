// Validation patterns
export const CINE_REGEX = /^[A-Z]{1,2}[0-9]{5,6}$/;
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PHONE_REGEX = /^(?:\+212|0)[5-7][0-9]{8}$/;
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

// Base Gerant interface
export interface Gerant {
  id: number;
  nom: string;
  prenom: string;
  cine: string;
  telephone: string;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
  barques?: { id: number }[];
}

// DTO for creating a new Gerant
export interface CreateGerantDTO {
  nom: string;
  prenom: string;
  cine: string;
  telephone: string;
  email: string;
  password: string;
}

// DTO for updating a Gerant
export interface UpdateGerantDTO {
  nom?: string;
  prenom?: string;
  cine?: string;
  telephone?: string;
  email?: string;
  password?: string;
}

// Filter options for Gerant queries
export interface GerantFilters {
  search?: string;
  cine?: string;
  email?: string;
  dateDebut?: string;
  dateFin?: string;
}

// Error handling types
export interface GerantError {
  message: string;
  field?: string;
  code: string;
}

export interface ImportGerantResult {
  total: number;
  imported: number;
  skipped: number;
  errors: GerantError[];
}

// Custom error class for Gerant operations
export class GerantValidationError extends Error {
  constructor(
    message: string,
    public code: string,
    public field?: string,
    public validationErrors?: Record<string, string>
  ) {
    super(message);
    this.name = 'GerantValidationError';
  }
}

// Validation result type
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}
