import { useAuthStore } from '../stores/auth.store';

export default function ManagerDashboard() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Tableau de bord Gérant</h2>
        <p className="text-muted-foreground">
          Bienvenue, {user?.nom || user?.email}
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Stats cards will go here */}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          {/* Recent payments will go here */}
        </div>
        <div className="col-span-3">
          {/* Supervisor activities will go here */}
        </div>
      </div>
    </div>
  );
}
