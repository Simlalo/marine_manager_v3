import { Input } from '../ui/input';
import { Search } from 'lucide-react';

interface BarqueSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const BarqueSearch = ({ value, onChange }: BarqueSearchProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Rechercher une barque..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-[300px] pl-8"
      />
    </div>
  );
};
