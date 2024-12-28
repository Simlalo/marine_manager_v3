import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Table } from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import { useBarqueStore } from '~/stores/barque.store';
import { useGerantStore } from '~/stores/gerant.store';
import { ArrowLeft } from 'lucide-react';
import { PaginationState } from '~/stores/barque.store';

export const GerantBarquesPage = () => {
  const { gerantId } = useParams();
  const navigate = useNavigate();
  const { barques, isLoading, fetchBarques, setFilters, pagination } = useBarqueStore();
  const { gerants, fetchGerants } = useGerantStore();
  const [gerantName, setGerantName] = useState('');

  useEffect(() => {
    if (gerantId) {
      setFilters({ gerantId: parseInt(gerantId) });
      fetchBarques();
      fetchGerants().then(() => {
        const gerant = gerants.find(g => g.id === parseInt(gerantId));
        if (gerant) {
          setGerantName(`${gerant.nom} ${gerant.prenom}`);
        }
      });
    }
  }, [gerantId, fetchBarques, fetchGerants, setFilters]);

  const handlePageChange = (newPage: number) => {
    fetchBarques(newPage);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/gerants')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour aux gérants
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Barques gérées par {gerantName}
            {pagination && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({pagination.total} barques au total)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Immatriculation</th>
                  <th>Port d'attache</th>
                  <th>Affiliation</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      Chargement...
                    </td>
                  </tr>
                ) : barques.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      Aucune barque trouvée pour ce gérant
                    </td>
                  </tr>
                ) : (
                  barques.map((barque) => (
                    <tr key={barque.id}>
                      <td>{barque.nom}</td>
                      <td>{barque.immatriculation}</td>
                      <td>{barque.portAttache}</td>
                      <td>{barque.affiliation}</td>
                      <td>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          barque.statut === 'actif' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {barque.statut}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
          
          {/* Pagination Controls */}
          {!isLoading && barques.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Total: {pagination.total} barques
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  Précédent
                </Button>
                <span className="text-sm">
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};
