import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "../ui/select";
import { Button } from '../ui/button';
import { X } from 'lucide-react';
import type { Barque, BarqueStatus } from '../../types/barque';

interface ComponentFilters {
  port?: string;
  statut?: BarqueStatus;
}

interface BarqueFiltersProps {
  barques: Barque[];
  onFilterChange: (filters: ComponentFilters) => void;
}

export const BarqueFilters = ({ barques = [], onFilterChange }: BarqueFiltersProps) => {
  const [filters, setFilters] = useState<ComponentFilters>({});

  const uniquePorts = Array.from(new Set(barques?.map(b => b.portAttache))).sort();
  const statuts: BarqueStatus[] = ['actif', 'non actif'];

  const handleFilterChange = (key: keyof ComponentFilters, value: string) => {
    const newFilters = { 
      ...filters,
      [key]: value === "all" ? undefined : value,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined);

  return (
    <div className="flex items-center gap-2">
      <Select
        value={filters.port || "all"}
        onValueChange={(value) => handleFilterChange('port', value)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Port d'attache" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">Tous les ports</SelectItem>
            {uniquePorts.map((port) => (
              <SelectItem key={port} value={port}>
                {port}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select
        value={filters.statut || "all"}
        onValueChange={(value) => handleFilterChange('statut', value as BarqueStatus)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {statuts.map((statut) => (
              <SelectItem key={statut} value={statut}>
                {statut === 'actif' ? 'Actif' : 'Non actif'}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-8 px-2 lg:px-3"
        >
          <X className="h-4 w-4" />
          <span className="ml-2 hidden lg:inline">Effacer les filtres</span>
        </Button>
      )}
    </div>
  );
};
