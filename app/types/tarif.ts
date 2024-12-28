export type TarifType = 'Mensuel' | 'Trimestriel' | 'Annuel';

export interface Tarif {
  id: number;
  type: TarifType;
  montant: number;
  description: string;
  actif: boolean;
  date_debut: string;
  date_fin?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTarifDTO {
  type: TarifType;
  montant: number;
  description: string;
  date_debut: string;
  date_fin?: string;
}

export interface UpdateTarifDTO {
  montant?: number;
  description?: string;
  actif?: boolean;
  date_fin?: string;
}

export interface TarifFilters {
  type?: TarifType;
  actif?: boolean;
  date?: string;
}
