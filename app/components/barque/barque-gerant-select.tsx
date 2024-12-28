import { useState, useEffect, useCallback, memo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useGerantStore } from '@/stores/gerant.store';

interface BarqueGerantSelectProps {
  value?: number;
  onChange: (gerantId: number | undefined) => void;
  disabled?: boolean;
}

export const BarqueGerantSelect = memo(function BarqueGerantSelect({ 
  value, 
  onChange, 
  disabled 
}: BarqueGerantSelectProps) {
  const { gerants, fetchGerants, isLoading, error } = useGerantStore();

  useEffect(() => {
    fetchGerants();
  }, [fetchGerants]);

  return (
    <Select
      value={value?.toString()}
      onValueChange={(val) => onChange(val ? parseInt(val) : undefined)}
      disabled={disabled || isLoading}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Sélectionner un gérant" />
      </SelectTrigger>
      <SelectContent>
        {error && (
          <SelectItem value="error">Erreur de chargement</SelectItem>
        )}
        {isLoading && (
          <SelectItem value="loading">Chargement...</SelectItem>
        )}
        {!error && !isLoading && gerants.length === 0 && (
          <SelectItem value="empty">Aucun gérant disponible</SelectItem>
        )}
        {!error && !isLoading && gerants.map((gerant) => (
          <SelectItem key={gerant.id} value={gerant.id.toString()}>
            {gerant.nom} {gerant.prenom}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});
