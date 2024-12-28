import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Barque } from '~/types/barque';
import { useMemo } from 'react';

interface BarqueStatsProps {
  barques: Barque[];
}

export const BarqueStats = ({ barques }: BarqueStatsProps) => {
  // Calculate statistics
  const totalBarques = barques.length;
  const portStats = barques.reduce((acc, barque) => {
    acc[barque.portAttache] = (acc[barque.portAttache] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const affiliationStats = useMemo(() => {
    const uniqueAffiliations = [...new Set(barques.map(b => b.affiliation))];
    return uniqueAffiliations.map(affiliation => ({
      affiliation,
      count: barques.filter(b => b.affiliation === affiliation).length
    }))
    .sort((a, b) => b.count - a.count);
  }, [barques]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Statistiques</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-2">Total des Barques</h3>
          <p className="text-3xl font-bold">{totalBarques}</p>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-2">Ports d'Attache</h3>
          <p className="text-3xl font-bold">{Object.keys(portStats).length}</p>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-medium mb-2">Affiliations</h3>
          <p className="text-3xl font-bold">{affiliationStats.length}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Distribution par Port</h3>
          <div className="space-y-2">
            {Object.entries(portStats)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([port, count]) => (
                <div key={port} className="flex justify-between items-center">
                  <span className="text-sm">{port}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Distribution par Affiliation</h3>
          <div className="space-y-2">
            {affiliationStats
              .slice(0, 5)
              .map(({ affiliation, count }) => (
                <div key={affiliation} className="flex justify-between items-center">
                  <span className="text-sm">{affiliation}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
