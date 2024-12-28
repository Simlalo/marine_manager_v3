export type PeriodeStatus = 'En_Attente' | 'Paye' | 'En_Retard';

export interface Periode {
  id: number;
  barque_id: number;
  annee: number;
  mois: number;
  montant: number;
  statut: PeriodeStatus;
  created_at: string;
  updated_at: string;
}

export interface CreatePeriodeDTO {
  barque_id: number;
  annee: number;
  mois: number;
  montant: number;
}

export interface UpdatePeriodeDTO {
  montant?: number;
  statut?: PeriodeStatus;
}

export interface PeriodeFilters {
  barque_id?: number;
  annee?: number;
  mois?: number;
  statut?: PeriodeStatus;
}
