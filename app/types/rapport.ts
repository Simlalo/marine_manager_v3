export interface RapportPaiement {
  total_montant: number;
  total_paye: number;
  total_impaye: number;
  nombre_paiements: number;
  nombre_retards: number;
  taux_recouvrement: number;
  periode: {
    debut: string;
    fin: string;
  };
}

export interface RapportBarque {
  barque_id: number;
  reference: string;
  total_paiements: number;
  nombre_retards: number;
  dernier_paiement?: string;
  statut_paiement: 'A_Jour' | 'En_Retard';
}

export interface RapportFilters {
  date_debut?: string;
  date_fin?: string;
  barque_id?: number;
  type_periode?: 'mensuel' | 'trimestriel' | 'annuel';
}

export interface RapportData {
  sommaire: RapportPaiement;
  barques: RapportBarque[];
  graphData: {
    labels: string[];
    paiements: number[];
    retards: number[];
  };
}
