import { useState } from 'react';
import { Button } from '../components/ui/button';
import { ResponsableForm } from '../components/manager/responsable-form';
import { ResponsableList } from '../components/manager/responsable-list';

export default function SupervisorsPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestion des Responsables</h2>
          <p className="text-muted-foreground">
            Gérez vos responsables et leurs attributions de barques
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Fermer' : 'Nouveau Responsable'}
        </Button>
      </div>

      {showForm && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 text-lg font-medium">Créer un nouveau responsable</h3>
          <ResponsableForm onSuccess={() => setShowForm(false)} />
        </div>
      )}

      <div className="rounded-lg border">
        <ResponsableList />
      </div>
    </div>
  );
}
