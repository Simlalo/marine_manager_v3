import { useState } from 'react';
import { Button } from '../components/ui/button';
import { BarqueForm } from '../components/barque/barque-form';
import { BarqueList } from '../components/barque/barque-list';

export default function BarquesPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestion des Barques</h2>
          <p className="text-muted-foreground">
            Gérez les enregistrements et approbations des barques
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Fermer' : 'Nouvelle Barque'}
        </Button>
      </div>

      {showForm && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 text-lg font-medium">Enregistrer une nouvelle barque</h3>
          <BarqueForm onSuccess={() => setShowForm(false)} />
        </div>
      )}

      <div className="rounded-lg border">
        <BarqueList />
      </div>
    </div>
  );
}
