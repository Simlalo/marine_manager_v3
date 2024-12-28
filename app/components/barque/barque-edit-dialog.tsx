import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useBarqueStore } from '../../stores/barque.store';
import type { Barque, UpdateBarqueDTO, BarqueStatus } from '../../types/barque';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { BarqueGerantSelect } from './barque-gerant-select';

interface BarqueEditDialogProps {
  barque: Barque | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface LocalUpdateBarqueDTO {
  nom: string;
  immatriculation?: string;
  portAttache?: string;
  affiliation?: string;
  statut?: BarqueStatus;
  gerantId?: number;
}

export function BarqueEditDialog({ barque, open, onOpenChange }: BarqueEditDialogProps) {
  const { createBarque, updateBarque } = useBarqueStore();
  const [formData, setFormData] = useState<LocalUpdateBarqueDTO>({
    nom: '',
    immatriculation: '',
    portAttache: '',
    affiliation: '',
    statut: 'actif' as BarqueStatus,
    gerantId: undefined
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (barque) {
      setFormData({
        nom: barque.nom,
        immatriculation: barque.immatriculation,
        portAttache: barque.portAttache,
        affiliation: barque.affiliation,
        statut: barque.statut,
        gerantId: barque.gerant?.id
      });
    } else {
      setFormData({
        nom: '',
        immatriculation: '',
        portAttache: '',
        affiliation: '',
        statut: 'actif' as BarqueStatus,
        gerantId: undefined
      });
    }
  }, [barque]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom || !formData.immatriculation || !formData.portAttache || !formData.affiliation) {
      return;
    }

    setIsSubmitting(true);
    try {
      const updateData: UpdateBarqueDTO = {
        ...formData,
        statut: (formData.statut as BarqueStatus) || 'actif',
        gerantId: formData.gerantId === undefined ? undefined : formData.gerantId
      };

      if (barque) {
        await updateBarque(barque.id, updateData);
      } else {
        if (formData.nom) {
          await createBarque({
            nom: formData.nom,
            immatriculation: formData.immatriculation,
            portAttache: formData.portAttache,
            affiliation: formData.affiliation,
            statut: (formData.statut as BarqueStatus) || 'actif',
            gerantId: formData.gerantId === undefined ? undefined : formData.gerantId
          });
        } else {
          console.error('Nom is required');
        }
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating barque:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof LocalUpdateBarqueDTO, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{barque ? 'Modifier' : 'Ajouter'} une barque</DialogTitle>
          <DialogDescription>
            {barque ? 'Modifiez les informations de la barque.' : 'Ajoutez une nouvelle barque au système.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nom">Nom *</Label>
            <Input
              id="nom"
              value={formData.nom}
              onChange={(e) => handleInputChange('nom', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="immatriculation">Immatriculation *</Label>
            <Input
              id="immatriculation"
              value={formData.immatriculation}
              onChange={(e) => handleInputChange('immatriculation', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="port">Port d'attache *</Label>
            <Input
              id="port"
              value={formData.portAttache}
              onChange={(e) => handleInputChange('portAttache', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="affiliation">Affiliation *</Label>
            <Input
              id="affiliation"
              value={formData.affiliation}
              onChange={(e) => handleInputChange('affiliation', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="statut">Statut</Label>
            <Select
              value={formData.statut}
              onValueChange={(value) => handleInputChange('statut', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="actif">Actif</SelectItem>
                <SelectItem value="non actif">Non actif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Gérant</Label>
            <BarqueGerantSelect
              value={formData.gerantId}
              onChange={(value) => handleInputChange('gerantId', value)}
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'En cours...' : barque ? 'Modifier' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
