import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import { usePaiementStore } from '../../stores/paiement.store';
import { useResponsableStore } from '../../stores/responsable.store';
import { Periode } from '../../types/periode';
import { useEffect } from 'react';

const paiementSchema = z.object({
  responsable_id: z.number({
    required_error: 'Veuillez sélectionner un responsable',
  }),
  montant: z.number().positive('Le montant doit être positif'),
});

type PaiementFormData = z.infer<typeof paiementSchema>;

interface PaiementFormProps {
  periode: Periode;
  onSuccess?: () => void;
}

export function PaiementForm({ periode, onSuccess }: PaiementFormProps) {
  const { createPaiement, isLoading, error } = usePaiementStore();
  const { responsables, fetchResponsables } = useResponsableStore();

  useEffect(() => {
    fetchResponsables();
  }, [fetchResponsables]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaiementFormData>({
    resolver: zodResolver(paiementSchema),
    defaultValues: {
      montant: periode.montant,
    },
  });

  const onSubmit = async (data: PaiementFormData) => {
    try {
      await createPaiement({
        ...data,
        periode_id: periode.id,
      });
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
          <label htmlFor="responsable_id" className="block text-sm font-medium">
            Responsable
          </label>
          <select
            id="responsable_id"
            {...register('responsable_id', { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">Sélectionner un responsable</option>
            {responsables
              .filter(r => r.actif)
              .map(responsable => (
                <option key={responsable.id} value={responsable.id}>
                  {responsable.nom}
                </option>
              ))
            }
          </select>
          {errors.responsable_id && (
            <p className="mt-1 text-sm text-red-600">{errors.responsable_id.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="montant" className="block text-sm font-medium">
            Montant
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

        <div className="bg-gray-50 p-4 rounded">
          <h4 className="text-sm font-medium text-gray-900">Détails de la période</h4>
          <dl className="mt-2 grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-500">Année</dt>
              <dd className="text-sm font-medium text-gray-900">{periode.annee}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Mois</dt>
              <dd className="text-sm font-medium text-gray-900">{periode.mois}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Montant dû</dt>
              <dd className="text-sm font-medium text-gray-900">{periode.montant} DH</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Statut</dt>
              <dd className="text-sm font-medium text-gray-900">{periode.statut}</dd>
            </div>
          </dl>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Enregistrement...' : 'Enregistrer le paiement'}
      </Button>
    </form>
  );
}
