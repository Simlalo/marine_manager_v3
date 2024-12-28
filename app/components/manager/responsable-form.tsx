import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import { useResponsableStore } from '../../stores/responsable.store';
import type { CreateResponsableDTO } from '../../types/responsable';

const responsableSchema = z.object({
  nom: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  identifiant: z
    .string()
    .min(3, 'L\'identifiant doit contenir au moins 3 caractères')
    .max(20, 'L\'identifiant ne peut pas dépasser 20 caractères')
    .regex(/^[a-zA-Z0-9_-]+$/, 'L\'identifiant ne peut contenir que des lettres, chiffres, tirets et underscores'),
});

type ResponsableFormData = z.infer<typeof responsableSchema>;

interface ResponsableFormProps {
  onSuccess?: () => void;
}

export function ResponsableForm({ onSuccess }: ResponsableFormProps) {
  const { createResponsable, isLoading, error } = useResponsableStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResponsableFormData>({
    resolver: zodResolver(responsableSchema),
  });

  const onSubmit = async (data: ResponsableFormData) => {
    try {
      await createResponsable(data as CreateResponsableDTO);
      reset();
      onSuccess?.();
    } catch (error) {
      // Error is handled by the store
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="nom" className="block text-sm font-medium">
            Nom du responsable
          </label>
          <input
            id="nom"
            {...register('nom')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
          />
          {errors.nom && (
            <p className="mt-1 text-sm text-red-600">{errors.nom.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="identifiant" className="block text-sm font-medium">
            Identifiant unique
          </label>
          <input
            id="identifiant"
            {...register('identifiant')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
          />
          {errors.identifiant && (
            <p className="mt-1 text-sm text-red-600">{errors.identifiant.message}</p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Création...' : 'Créer le responsable'}
      </Button>
    </form>
  );
}
