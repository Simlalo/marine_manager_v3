import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { PeriodeForm } from '../components/manager/periode-form';
import { PaiementForm } from '../components/manager/paiement-form';
import { usePeriodeStore } from '../stores/periode.store';
import { usePaiementStore } from '../stores/paiement.store';
import { Periode } from '../types/periode';

export default function PaymentsPage() {
  const [showPeriodeForm, setShowPeriodeForm] = useState(false);
  const [selectedPeriode, setSelectedPeriode] = useState<Periode | null>(null);
  const { periodes, fetchPeriodes, isLoading: periodesLoading } = usePeriodeStore();
  const { summary, fetchSummary, isLoading: summaryLoading } = usePaiementStore();

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  useEffect(() => {
    fetchPeriodes();
    fetchSummary(currentYear, currentMonth);
  }, [fetchPeriodes, fetchSummary, currentYear, currentMonth]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paye':
        return 'bg-green-100 text-green-800';
      case 'En_Retard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestion des Paiements</h2>
          <p className="text-muted-foreground">
            Gérez les périodes de paiement et les encaissements
          </p>
        </div>
        <Button onClick={() => setShowPeriodeForm(!showPeriodeForm)}>
          {showPeriodeForm ? 'Fermer' : 'Nouvelle Période'}
        </Button>
      </div>

      {/* Summary Cards */}
      {!summaryLoading && summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium">Total des paiements</h3>
            <p className="mt-2 text-3xl font-bold">{summary.total_montant} DH</p>
            <p className="text-sm text-gray-500">
              {summary.periode.mois}/{summary.periode.annee}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium">Nombre de paiements</h3>
            <p className="mt-2 text-3xl font-bold">{summary.count}</p>
            <p className="text-sm text-gray-500">ce mois</p>
          </div>
        </div>
      )}

      {/* Period Generation Form */}
      {showPeriodeForm && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 text-lg font-medium">Générer de nouvelles périodes</h3>
          <PeriodeForm onSuccess={() => setShowPeriodeForm(false)} />
        </div>
      )}

      {/* Payment Form */}
      {selectedPeriode && (
        <div className="rounded-lg border bg-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Enregistrer un paiement</h3>
            <Button
              variant="ghost"
              onClick={() => setSelectedPeriode(null)}
            >
              Fermer
            </Button>
          </div>
          <PaiementForm 
            periode={selectedPeriode} 
            onSuccess={() => setSelectedPeriode(null)} 
          />
        </div>
      )}

      {/* Periods List */}
      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Période
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Barque
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {periodesLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    Chargement...
                  </td>
                </tr>
              ) : periodes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    Aucune période trouvée
                  </td>
                </tr>
              ) : (
                periodes.map((periode) => (
                  <tr key={periode.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {periode.mois}/{periode.annee}
                    </td>
                    <td className="px-6 py-4">
                      {periode.barque_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {periode.montant} DH
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(periode.statut)}`}>
                        {periode.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {periode.statut !== 'Paye' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPeriode(periode)}
                        >
                          Paiement
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
