import { useEffect, useCallback } from 'react';
import { useBarqueStore } from '../../stores/barque.store';
import { Button } from '../ui/button';
import { BarqueStatus, BARQUE_STATUSES } from '../../types/barque';

const statusLabels: Record<string, string> = {
  [BARQUE_STATUSES.ACTIF]: 'Actif',
  [BARQUE_STATUSES.INACTIF]: 'Inactif',
  [BARQUE_STATUSES.EN_MAINTENANCE]: 'En maintenance',
  [BARQUE_STATUSES.SUSPENDU]: 'Suspendu',
};

const statusClasses: Record<string, string> = {
  [BARQUE_STATUSES.ACTIF]: 'bg-green-100 text-green-800',
  [BARQUE_STATUSES.INACTIF]: 'bg-gray-100 text-gray-800',
  [BARQUE_STATUSES.EN_MAINTENANCE]: 'bg-yellow-100 text-yellow-800',
  [BARQUE_STATUSES.SUSPENDU]: 'bg-red-100 text-red-800',
};

export function BarqueList() {
  const barques = useBarqueStore(state => state.barques);
  const isLoading = useBarqueStore(state => state.isLoading);
  const error = useBarqueStore(state => state.error);
  const pagination = useBarqueStore(state => state.pagination);
  const fetchBarques = useBarqueStore(state => state.fetchBarques);
  const updateBarque = useBarqueStore(state => state.updateBarque);

  const handleStatusUpdate = useCallback(async (id: number, status: BarqueStatus) => {
    await updateBarque(id, { statut: status });
  }, [updateBarque]);

  const handlePageChange = useCallback((page: number) => {
    fetchBarques(page);
  }, [fetchBarques]);

  useEffect(() => {
    let mounted = true;

    const loadBarques = async () => {
      try {
        if (mounted) {
          await fetchBarques(1);
        }
      } catch (error) {
        console.error('Error fetching barques:', error);
      }
    };
    
    loadBarques();
    
    return () => {
      mounted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!barques.length) {
    return <div>Aucune barque trouvée</div>;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Immatriculation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Port d'attache
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Affiliation
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
            {barques.map((barque) => (
              <tr key={barque.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {barque.nom}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {barque.immatriculation}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {barque.portAttache}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {barque.affiliation}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[barque.statut]}`}>
                    {statusLabels[barque.statut]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate(barque.id, BARQUE_STATUSES.ACTIF)}
                    disabled={barque.statut === BARQUE_STATUSES.ACTIF}
                  >
                    Actif
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate(barque.id, BARQUE_STATUSES.INACTIF)}
                    disabled={barque.statut === BARQUE_STATUSES.INACTIF}
                  >
                    Inactif
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate(barque.id, BARQUE_STATUSES.EN_MAINTENANCE)}
                    disabled={barque.statut === BARQUE_STATUSES.EN_MAINTENANCE}
                  >
                    En maintenance
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate(barque.id, BARQUE_STATUSES.SUSPENDU)}
                    disabled={barque.statut === BARQUE_STATUSES.SUSPENDU}
                  >
                    Suspendu
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center space-x-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
        >
          Précédent
        </Button>
        <span className="px-4 py-2">
          Page {pagination.currentPage} sur {pagination.totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}
