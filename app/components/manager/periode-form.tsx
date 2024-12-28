import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import { useBarqueStore } from '../../stores/barque.store';
import { usePeriodeStore } from '../../stores/periode.store';
import { useState, useEffect } from 'react';

const periodeSchema = z.object({
  annee: z.number().min(2000).max(2100),
  mois: z.number().min(1).max(12),
  barques: z.array(z.number()).min(1, 'Sélectionnez au moins une barque'),
});

type PeriodeFormData = z.infer<typeof periodeSchema>;

interface PeriodeFormProps {
  onSuccess?: () => void;
}

export function PeriodeForm({ onSuccess }: PeriodeFormProps) {
  const { barques, fetchBarques } = useBarqueStore();
  const { generatePeriodes, isLoading, error } = usePeriodeStore();
  const [selectedBarques, setSelectedBarques] = useState<number[]>([]);

  useEffect(() => {
    fetchBarques();
  }, [fetchBarques]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PeriodeFormData>({
    resolver: zodResolver(periodeSchema),
    defaultValues: {
      annee: new Date().getFullYear(),
      mois: new Date().getMonth() + 1,
      barques: [],
    },
  });

  const handleBarqueSelection = (barqueId: number) => {
    setSelectedBarques(prev => 
      prev.includes(barqueId)
        ? prev.filter(id => id !== barqueId)
        : [...prev, barqueId]
    );
  };

  const onSubmit = async (data: PeriodeFormData) => {
    try {
      await generatePeriodes(selectedBarques, data.annee, data.mois);
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="annee" className="block text-sm font-medium">
              Année
            </label>
            <input
              id="annee"
              type="number"
              {...register('annee', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
            {errors.annee && (
              <p className="mt-1 text-sm text-red-600">{errors.annee.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="mois" className="block text-sm font-medium">
              Mois
            </label>
            <input
              id="mois"
              type="number"
              min="1"
              max="12"
              {...register('mois', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
            {errors.mois && (
              <p className="mt-1 text-sm text-red-600">{errors.mois.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Sélectionner les barques
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {barques
              .filter(b => b.statut === 'Approuve')
              .map(barque => (
                <label
                  key={barque.id}
                  className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedBarques.includes(barque.id)}
                    onChange={() => handleBarqueSelection(barque.id)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">
                    {barque.reference.nom} ({barque.reference.immatriculation})
                  </span>
                </label>
              ))
            }
          </div>
          {errors.barques && (
            <p className="mt-1 text-sm text-red-600">{errors.barques.message}</p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || selectedBarques.length === 0}
      >
        {isLoading ? 'Génération...' : 'Générer les périodes'}
      </Button>
    </form>
  );
}
