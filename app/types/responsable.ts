export interface Responsable {
  id: number;
  gerant_id: number;
  nom: string;
  identifiant: string;
  actif: boolean;
  created_at: string;
}

export interface CreateResponsableDTO {
  nom: string;
  identifiant: string;
}

export interface UpdateResponsableDTO {
  nom?: string;
  actif?: boolean;
}

export interface ResponsableFilters {
  actif?: boolean;
  search?: string;
}
