export interface Paiement {
  id: number;
  periode_id: number;
  responsable_id: number;
  montant: number;
  date_paiement: string;
  created_at: string;
}

export interface CreatePaiementDTO {
  periode_id: number;
  responsable_id: number;
  montant: number;
}

export interface PaiementFilters {
  periode_id?: number;
  responsable_id?: number;
  date_debut?: string;
  date_fin?: string;
}

export interface PaiementSummary {
  total_montant: number;
  count: number;
  periode: {
    annee: number;
    mois: number;
  };
}
