import { Button } from '../ui/button';
import { Barque } from '../../types/barque';
import { Download, UserPlus, Trash2 } from 'lucide-react';
import ExcelJS from 'exceljs';
import { useState, useCallback, memo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { BarqueGerantSelect } from './barque-gerant-select';
import { useBarqueStore } from '../../stores/barque.store';
import { useToast } from '../ui/use-toast';

interface BarqueBatchActionsProps {
  selectedBarques: Barque[];
  onClearSelection: () => void;
}

export function BarqueBatchActions({ selectedBarques, onClearSelection }: BarqueBatchActionsProps) {
  const { toast } = useToast();
  const { deleteBarque, updateBarque } = useBarqueStore();
  const [showGerantDialog, setShowGerantDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedGerant, setSelectedGerant] = useState<number | undefined>(undefined);

  const handleGerantAssignment = useCallback(async () => {
    if (selectedBarques.length === 0) return;
    
    setIsUpdating(true);
    try {
      await Promise.all(
        selectedBarques.map((barque) =>
          updateBarque(barque.id, {
            gerantId: selectedGerant,
          })
        )
      );
      setShowGerantDialog(false);
      onClearSelection();
      toast({
        title: 'Succès',
        description: 'Les barques ont été assignées avec succès',
      });
    } catch (error) {
      console.error('Error assigning gerant:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'assignation',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  }, [selectedBarques, selectedGerant, updateBarque, onClearSelection, toast]);

  const handleGerantChange = useCallback((gerantId: number | undefined) => {
    setSelectedGerant(gerantId);
  }, []);

  const handleBulkDelete = useCallback(async () => {
    if (!deleteBarque || selectedBarques.length === 0) return;

    try {
      setIsDeleting(true);
      await Promise.all(
        selectedBarques.map(async (barque) => {
          if (barque.id !== undefined) {  
            await deleteBarque(barque.id);
          }
        })
      );
      onClearSelection();
      toast({
        title: 'Succès',
        description: 'Les barques ont été supprimées avec succès',
      });
    } catch (error) {
      console.error('Error deleting barques:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la suppression',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  }, [selectedBarques, deleteBarque, onClearSelection, toast]);

  const handleExport = useCallback(async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Barques');

      // Define columns
      worksheet.columns = [
        { header: 'Immatriculation', key: 'immatriculation', width: 20 },
        { header: 'Nom', key: 'nom', width: 20 },
        { header: 'Port d\'attache', key: 'portAttache', width: 20 },
        { header: 'Affiliation', key: 'affiliation', width: 20 },
        { header: 'Gérant', key: 'gerant', width: 25 }
      ];

      // Add data
      selectedBarques.forEach(barque => {
        worksheet.addRow({
          immatriculation: barque.immatriculation,
          nom: barque.nom,
          portAttache: barque.portAttache,
          affiliation: barque.affiliation,
          gerant: barque.gerant ? barque.gerant.nom : 'Non assigné'
        });
      });

      // Style the header row
      worksheet.getRow(1).font = { bold: true };

      // Generate and download the file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'barques_export.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'export',
        variant: 'destructive'
      });
    }
  }, [selectedBarques, toast]);

  if (selectedBarques.length === 0) {
    return null;
  }

  return (
    <div className="bg-secondary/20 border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">
            {selectedBarques.length} barque{selectedBarques.length > 1 ? 's' : ''}{' '}
            sélectionnée{selectedBarques.length > 1 ? 's' : ''}
          </span>
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            Effacer la sélection
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGerantDialog(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Assigner un gérant
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </div>

      <Dialog open={showGerantDialog} onOpenChange={setShowGerantDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assigner un gérant</DialogTitle>
            <DialogDescription>
              Sélectionnez un gérant pour les {selectedBarques.length} barque
              {selectedBarques.length > 1 ? 's' : ''} sélectionnée
              {selectedBarques.length > 1 ? 's' : ''}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Sélectionner un gérant</Label>
              <BarqueGerantSelect
                value={selectedGerant}
                onChange={handleGerantChange}
                disabled={isUpdating}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowGerantDialog(false)}
              disabled={isUpdating}
            >
              Annuler
            </Button>
            <Button onClick={handleGerantAssignment} disabled={!selectedGerant || isUpdating}>
              {isUpdating ? 'En cours...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer les {selectedBarques.length} barque
              {selectedBarques.length > 1 ? 's' : ''} sélectionnée
              {selectedBarques.length > 1 ? 's' : ''} ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
