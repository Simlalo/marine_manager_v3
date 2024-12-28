import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import { useBarqueStore } from '../../stores/barque.store';
import type { CreateBarqueDTO } from '../../types/barque';

const barqueSchema = z.object({
  immatriculation: z
    .string()
    .min(3, 'L\'immatriculation doit contenir au moins 3 caractères')
    .max(50, 'L\'immatriculation ne peut pas dépasser 50 caractères'),
  affiliation: z
    .string()
    .min(2, 'L\'affiliation doit contenir au moins 2 caractères'),
  nom: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères'),
  portAttache: z
    .string()
    .min(2, 'Le port d\'attache doit contenir au moins 2 caractères'),
});

type BarqueFormData = z.infer<typeof barqueSchema>;

interface BarqueFormProps {
  onSuccess?: () => void;
}

export function BarqueForm({ onSuccess }: BarqueFormProps) {
  const { createBarque, isLoading, error } = useBarqueStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BarqueFormData>({
    resolver: zodResolver(barqueSchema),
  });

  const onSubmit = async (data: BarqueFormData) => {
    try {
      await createBarque(data as CreateBarqueDTO);
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
          <label htmlFor="immatriculation" className="block text-sm font-medium">
            Immatriculation
          </label>
          <input
            id="immatriculation"
            {...register('immatriculation')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
          />
          {errors.immatriculation && (
            <p className="mt-1 text-sm text-red-600">{errors.immatriculation.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="affiliation" className="block text-sm font-medium">
            Affiliation
          </label>
          <input
            id="affiliation"
            {...register('affiliation')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
          />
          {errors.affiliation && (
            <p className="mt-1 text-sm text-red-600">{errors.affiliation.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="nom" className="block text-sm font-medium">
            Nom
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
          <label htmlFor="portAttache" className="block text-sm font-medium">
            Port d'attache
          </label>
          <input
            id="portAttache"
            {...register('portAttache')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
          />
          {errors.portAttache && (
            <p className="mt-1 text-sm text-red-600">{errors.portAttache.message}</p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Enregistrement...' : 'Enregistrer la barque'}
      </Button>
    </form>
  );
}
