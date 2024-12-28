import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../ui/use-toast';
import { useGerantStore } from '../../stores/gerant.store';
import { CreateGerantDTO, Gerant, GerantValidationError, UpdateGerantDTO } from '../../types/gerant';
import { GerantValidationService } from '../../services/gerant-validation.service';
import { Copy } from 'lucide-react';

interface GerantEditDialogProps {
  gerant?: Gerant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const generateRandomPassword = () => {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

export function GerantEditDialog({ gerant, open, onOpenChange, onSuccess }: GerantEditDialogProps) {
  const { createGerant, updateGerant, isLoading, error, clearError, checkCineExists } = useGerantStore();
  const { toast } = useToast();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<CreateGerantDTO>({
    nom: '',
    prenom: '',
    cine: '',
    telephone: '',
    email: '',
    password: generateRandomPassword(),
  });

  useEffect(() => {
    if (gerant) {
      setFormData({
        nom: gerant.nom,
        prenom: gerant.prenom,
        cine: gerant.cine,
        telephone: gerant.telephone,
        email: gerant.email,
        password: gerant.password,
      });
    } else {
      setFormData({
        nom: '',
        prenom: '',
        cine: '',
        telephone: '',
        email: '',
        password: generateRandomPassword(),
      });
    }
    setValidationErrors({});
  }, [gerant, open]);

  const validateField = async (name: keyof CreateGerantDTO, value: string) => {
    const validation = GerantValidationService.validateGerant({ [name]: value });
    
    if (!validation.isValid) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: validation.errors[name]
      }));
      return false;
    }

    // Special case for CINE - check if it exists
    if (name === 'cine' && value && (!gerant || value !== gerant.cine)) {
      try {
        const exists = await checkCineExists(value);
        if (exists) {
          setValidationErrors(prev => ({
            ...prev,
            cine: 'Ce CINE existe déjà'
          }));
          return false;
        }
      } catch (error) {
        console.error('Error checking CINE:', error);
      }
    }

    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
    return true;
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    await validateField(name as keyof CreateGerantDTO, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      // Validate all fields
      const validation = GerantValidationService.validateGerant(formData);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        return;
      }

      if (gerant) {
        const updateData: UpdateGerantDTO = {};
        Object.keys(formData).forEach(key => {
          const k = key as keyof CreateGerantDTO;
          if (formData[k] !== gerant[k]) {
            (updateData as any)[k] = formData[k];
          }
        });

        await updateGerant(gerant.id, updateData);
        toast({
          title: "Succès",
          description: "Le gérant a été modifié avec succès",
        });
      } else {
        await createGerant(formData);
        toast({
          title: "Succès",
          description: "Le gérant a été créé avec succès",
        });
      }
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      if (error instanceof GerantValidationError) {
        setValidationErrors(error.validationErrors || {});
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: error.message,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Une erreur est survenue',
        });
      }
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(formData.password);
    toast({
      title: 'Copié',
      description: 'Le mot de passe a été copié dans le presse-papier',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {gerant ? 'Modifier le gérant' : 'Créer un gérant'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nom" className="text-right">
                Nom
              </Label>
              <Input
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                className={`col-span-3 ${validationErrors.nom ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
              {validationErrors.nom && (
                <p className="col-span-3 col-start-2 text-sm text-red-500">
                  {validationErrors.nom}
                </p>
              )}
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="prenom" className="text-right">
                Prénom
              </Label>
              <Input
                id="prenom"
                name="prenom"
                value={formData.prenom}
                onChange={handleInputChange}
                className={`col-span-3 ${validationErrors.prenom ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
              {validationErrors.prenom && (
                <p className="col-span-3 col-start-2 text-sm text-red-500">
                  {validationErrors.prenom}
                </p>
              )}
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cine" className="text-right">
                CINE
              </Label>
              <Input
                id="cine"
                name="cine"
                value={formData.cine}
                onChange={handleInputChange}
                className={`col-span-3 ${validationErrors.cine ? 'border-red-500' : ''}`}
                disabled={isLoading || !!gerant}
              />
              {validationErrors.cine && (
                <p className="col-span-3 col-start-2 text-sm text-red-500">
                  {validationErrors.cine}
                </p>
              )}
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="telephone" className="text-right">
                Téléphone
              </Label>
              <Input
                id="telephone"
                name="telephone"
                value={formData.telephone}
                onChange={handleInputChange}
                className={`col-span-3 ${validationErrors.telephone ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
              {validationErrors.telephone && (
                <p className="col-span-3 col-start-2 text-sm text-red-500">
                  {validationErrors.telephone}
                </p>
              )}
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`col-span-3 ${validationErrors.email ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
              {validationErrors.email && (
                <p className="col-span-3 col-start-2 text-sm text-red-500">
                  {validationErrors.email}
                </p>
              )}
            </div>

            {!gerant && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Mot de passe
                </Label>
                <div className="col-span-3 flex gap-2">
                  <Input
                    id="password"
                    name="password"
                    type="text"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`flex-1 ${validationErrors.password ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                    readOnly
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopyPassword}
                    disabled={isLoading}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {validationErrors.password && (
                  <p className="col-span-3 col-start-2 text-sm text-red-500">
                    {validationErrors.password}
                  </p>
                )}
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || Object.keys(validationErrors).length > 0}>
              {isLoading ? 'Chargement...' : gerant ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
