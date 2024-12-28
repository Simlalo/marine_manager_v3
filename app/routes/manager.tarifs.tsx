import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { TarifForm } from '../components/manager/tarif-form';
import { useTarifStore } from '../stores/tarif.store';
import { Tarif, TarifType } from '../types/tarif';

export default function TarifsPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedTarif, setSelectedTarif] = useState<Tarif | null>(null);
  const { tarifs, fetchTarifs, updateTarif, isLoading } = useTarifStore();
  const [filterType, setFilterType] = useState<TarifType | 'all'>('all');

  useEffect(() => {
    fetchTarifs();
  }, [fetchTarifs]);

  const handleStatusToggle = async (tarif: Tarif) => {
    try {
      await updateTarif(tarif.id, { actif: !tarif.actif });
    } catch (error) {
      // Error is handled by the store
    }
  };

  const filteredTarifs = filterType === 'all'
    ? tarifs
    : tarifs.filter(t => t.type === filterType);

  const tarifTypes: TarifType[] = ['Mensuel', 'Trimestriel', 'Annuel'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestion des Tarifs</h2>
          <p className="text-muted-foreground">
            Configurez et gérez les tarifs pour les barques
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Fermer' : 'Nouveau Tarif'}
        </Button>
      </div>

      {/* Tariff Form */}
      {showForm && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 text-lg font-medium">Créer un nouveau tarif</h3>
          <TarifForm onSuccess={() => setShowForm(false)} />
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filterType === 'all' ? 'default' : 'outline'}
          onClick={() => setFilterType('all')}
        >
          Tous
        </Button>
        {tarifTypes.map(type => (
          <Button
            key={type}
            variant={filterType === type ? 'default' : 'outline'}
            onClick={() => setFilterType(type)}
          >
            {type}
          </Button>
        ))}
      </div>

      {/* Tariffs List */}
      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Période de validité
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
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    Chargement...
                  </td>
                </tr>
              ) : filteredTarifs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    Aucun tarif trouvé
                  </td>
                </tr>
              ) : (
                filteredTarifs.map((tarif) => (
                  <tr key={tarif.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tarif.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tarif.montant} DH
                    </td>
                    <td className="px-6 py-4">
                      {tarif.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div>Début: {new Date(tarif.date_debut).toLocaleDateString()}</div>
                        {tarif.date_fin && (
                          <div>Fin: {new Date(tarif.date_fin).toLocaleDateString()}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          tarif.actif
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {tarif.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusToggle(tarif)}
                      >
                        {tarif.actif ? 'Désactiver' : 'Activer'}
                      </Button>
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
