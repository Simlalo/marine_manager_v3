// Status types with descriptions
export const BARQUE_STATUSES = {
  ACTIF: 'actif',
  INACTIF: 'inactif',
  EN_MAINTENANCE: 'en_maintenance',
  SUSPENDU: 'suspendu'
} as const;

export type BarqueStatus = typeof BARQUE_STATUSES[keyof typeof BARQUE_STATUSES];

// User related types
export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: 'ADMIN' | 'GERANT';
  createdAt: string;
  updatedAt: string;
}

// Validation schemas
export const IMMATRICULATION_REGEX = /^\d{1,2}\/\d{1,2}(-\d{4})?$/;
export const PORT_REGEX = /^\d{1,2}\/\d{1,2}$/;

// Main Barque interface
export interface Barque {
  id: number;
  affiliation: string;
  immatriculation: string;
  nom: string;
  portAttache: string;
  gerant?: User;
  responsable?: User;
  createdAt: string;
  updatedAt: string;
  statut: BarqueStatus;
}

// DTO for creating a new Barque
export interface CreateBarqueDTO {
  affiliation: string;
  immatriculation: string;
  nom: string;
  portAttache: string;
  gerantId?: number;
  responsableId?: number;
  statut: BarqueStatus;
}

// DTO for updating a Barque
export interface UpdateBarqueDTO {
  affiliation?: string;
  immatriculation?: string;
  nom?: string;
  portAttache?: string;
  gerantId?: number;
  responsableId?: number;
  statut?: BarqueStatus;
}

// Filter options for Barque queries
export interface BarqueFilters {
  search?: string;
  affiliation?: string;
  immatriculation?: string;
  nom?: string;
  portAttache?: string;
  gerantId?: number;
  responsableId?: number;
  statut?: BarqueStatus;
  dateDebut?: string;
  dateFin?: string;
}

// Error handling types
export interface ImportError {
  message: string;
  immatriculation?: string;
  line?: number;
  field?: string;
  code?: string;
}

export interface ImportResult {
  success: boolean;
  total: number;
  imported: number;
  skipped: number;
  errors: ImportError[];
  warnings?: string[];
  error?: string;
}

// Custom error class for Barque operations
export class BarqueError extends Error {
  constructor(
    message: string,
    public code: string,
    public field?: string,
    public validationErrors?: Record<string, string>
  ) {
    super(message);
    this.name = 'BarqueError';
  }
}

// Validation result type
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}
