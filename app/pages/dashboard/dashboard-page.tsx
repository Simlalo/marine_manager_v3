import { useEffect } from 'react';
import { useAuthStore } from '../../stores/auth.store';
import { useBarqueStore } from '../../stores/barque.store';
import { Card } from '../../components/ui/card';

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const { barques } = useBarqueStore();

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          Bienvenue, {user?.name || 'Utilisateur'}
        </h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium">Total des Barques</h3>
          <p className="text-3xl font-bold mt-2">{barques.length}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-medium">Barques Actives</h3>
          <p className="text-3xl font-bold mt-2">
            {barques.filter(b => b.status === 'active').length}
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium">Ports d'Attache</h3>
          <p className="text-3xl font-bold mt-2">
            {new Set(barques.map(b => b.portAttache)).size}
          </p>
        </Card>
      </div>

      {/* Recent Activity */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Activité Récente</h2>
        <Card className="divide-y">
          {/* We'll implement this with actual data later */}
          <div className="p-4">Aucune activité récente</div>
        </Card>
      </section>
    </div>
  );
};

export default DashboardPage;
