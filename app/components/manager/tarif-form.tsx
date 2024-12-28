import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import { useTarifStore } from '../../stores/tarif.store';
import { TarifType } from '../../types/tarif';

const tarifSchema = z.object({
  type: z.enum(['Mensuel', 'Trimestriel', 'Annuel'] as const),
  montant: z.number().positive('Le montant doit être positif'),
  description: z.string().min(1, 'La description est requise'),
  date_debut: z.string(),
  date_fin: z.string().optional(),
});

type TarifFormData = z.infer<typeof tarifSchema>;

interface TarifFormProps {
  onSuccess?: () => void;
}

export function TarifForm({ onSuccess }: TarifFormProps) {
  const { createTarif, isLoading, error } = useTarifStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TarifFormData>({
    resolver: zodResolver(tarifSchema),
    defaultValues: {
      type: 'Mensuel',
      date_debut: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: TarifFormData) => {
    try {
      await createTarif(data);
      onSuccess?.();
    } catch (error) {
      // Error is handled by the store
    }
  };

  const tarifTypes: TarifType[] = ['Mensuel', 'Trimestriel', 'Annuel'];

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
          <label htmlFor="type" className="block text-sm font-medium">
            Type de tarif
          </label>
          <select
            id="type"
            {...register('type')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          >
            {tarifTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="montant" className="block text-sm font-medium">
            Montant (DH)
          </label>
          <input
            id="montant"
            type="number"
            step="0.01"
            {...register('montant', { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {errors.montant && (
            <p className="mt-1 text-sm text-red-600">{errors.montant.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            {...register('description')}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="date_debut" className="block text-sm font-medium">
              Date de début
            </label>
            <input
              id="date_debut"
              type="date"
              {...register('date_debut')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
            {errors.date_debut && (
              <p className="mt-1 text-sm text-red-600">{errors.date_debut.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="date_fin" className="block text-sm font-medium">
              Date de fin (optionnel)
            </label>
            <input
              id="date_fin"
              type="date"
              {...register('date_fin')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
            {errors.date_fin && (
              <p className="mt-1 text-sm text-red-600">{errors.date_fin.message}</p>
            )}
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Création...' : 'Créer le tarif'}
      </Button>
    </form>
  );
}
