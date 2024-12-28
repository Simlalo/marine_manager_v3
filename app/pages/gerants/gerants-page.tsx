import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Table } from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Search, Plus, Edit, Trash } from 'lucide-react';
import { GerantEditDialog } from '@/components/gerant/gerant-edit-dialog';
import { useGerantStore } from '@/stores/gerant.store';
import { useBarqueStore } from '@/stores/barque.store';
import { Gerant } from '@/types/gerant';
import { Barque } from '@/types/barque';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const GerantsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGerant, setSelectedGerant] = useState<Gerant | undefined>(undefined);
  const { gerants = [], isLoading, fetchGerants, deleteGerant } = useGerantStore();
  const { barques = [], fetchBarques } = useBarqueStore();
  const { toast } = useToast();

  useEffect(() => {
    fetchGerants();
    fetchBarques();
  }, [fetchGerants, fetchBarques]);

  const getBarqueCount = (gerantId: number) => {
    return barques?.filter((barque: Barque) => barque.gerant?.id === gerantId)?.length || 0;
  };

  const filteredGerants = (gerants || []).filter((gerant: Gerant) =>
    gerant.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gerant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gerant.prenom.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (gerant: Gerant) => {
    setSelectedGerant(gerant);
    setDialogOpen(true);
  };

  const handleDelete = async (gerant: Gerant) => {
    try {
      await deleteGerant(gerant.id);
      toast({
        title: 'Succès',
        description: 'Le gérant a été supprimé avec succès',
      });
      setSelectedGerant(undefined);
      setDeleteDialogOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
      });
    }
  };

  const confirmDelete = async () => {
    if (!selectedGerant) return;

    try {
      await deleteGerant(selectedGerant.id);
      toast({
        title: "Gérant supprimé",
        description: "Le gérant a été supprimé avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedGerant(undefined);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedGerant(undefined);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Gérants</CardTitle>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un gérant
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 pb-4">
            <Search className="w-4 h-4 text-gray-500" />
            <Input
              placeholder="Rechercher un gérant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>CINE</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Barques</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      Chargement...
                    </td>
                  </tr>
                ) : filteredGerants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      Aucun gérant trouvé
                    </td>
                  </tr>
                ) : (
                  filteredGerants.map((gerant: Gerant) => (
                    <tr key={gerant.id}>
                      <td>{gerant.nom}</td>
                      <td>{gerant.prenom}</td>
                      <td>{gerant.cine}</td>
                      <td>{gerant.email}</td>
                      <td>{gerant.telephone}</td>
                      <td>
                        <Button
                          variant="link"
                          onClick={() => navigate(`/gerants/${gerant.id}/barques`)}
                        >
                          {getBarqueCount(gerant.id)}
                        </Button>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEdit(gerant)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(gerant)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <GerantEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        gerant={selectedGerant}
        onSuccess={() => {
          fetchGerants();
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cela supprimera définitivement le gérant
              {selectedGerant && ` "${selectedGerant.nom} ${selectedGerant.prenom}"`} et
              toutes les données associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GerantsPage;
