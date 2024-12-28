import { useEffect, useState } from 'react';
import { useResponsableStore } from '../../stores/responsable.store';
import { useBarqueStore } from '../../stores/barque.store';
import { Button } from '../ui/button';
import { Responsable } from '../../types/responsable';

export function ResponsableList() {
  const { 
    responsables, 
    fetchResponsables, 
    updateResponsable,
    assignBarque,
    isLoading, 
    error 
  } = useResponsableStore();

  const { 
    barques,
    fetchBarques
  } = useBarqueStore();

  const [selectedBarque, setSelectedBarque] = useState<number | ''>('');
  const [selectedResponsable, setSelectedResponsable] = useState<Responsable | null>(null);

  useEffect(() => {
    fetchResponsables();
    fetchBarques();
  }, [fetchResponsables, fetchBarques]);

  const handleStatusUpdate = async (id: number, actif: boolean) => {
    await updateResponsable(id, { actif });
  };

  const handleAssignBarque = async () => {
    if (selectedResponsable && selectedBarque) {
      await assignBarque(selectedResponsable.id, Number(selectedBarque));
      setSelectedBarque('');
      setSelectedResponsable(null);
    }
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {selectedResponsable && (
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-4 text-lg font-medium">
            Attribuer une barque à {selectedResponsable.nom}
          </h3>
          <div className="flex gap-4">
            <select
              value={selectedBarque}
              onChange={(e) => setSelectedBarque(e.target.value as number | '')}
              className="block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">Sélectionner une barque</option>
              {barques
                .filter(b => b.statut === 'Approuve')
                .map(barque => (
                  <option key={barque.id} value={barque.id}>
                    {barque.reference.nom} ({barque.reference.immatriculation})
                  </option>
                ))
              }
            </select>
            <Button
              onClick={handleAssignBarque}
              disabled={!selectedBarque}
            >
              Attribuer
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedResponsable(null)}
            >
              Annuler
            </Button>
          </div>
        </div>
      )}

      <div className="flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Nom
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Identifiant
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Statut
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {responsables.map((responsable) => (
                  <tr key={responsable.id}>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {responsable.nom}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {responsable.identifiant}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          responsable.actif
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {responsable.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant={responsable.actif ? 'destructive' : 'default'}
                          onClick={() => handleStatusUpdate(responsable.id, !responsable.actif)}
                        >
                          {responsable.actif ? 'Désactiver' : 'Activer'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedResponsable(responsable)}
                        >
                          Attribuer Barque
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
