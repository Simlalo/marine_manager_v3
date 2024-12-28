import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { useRapportStore } from '../stores/rapport.store';
import { useBarqueStore } from '../stores/barque.store';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function ReportsPage() {
  const { rapport, fetchRapport, exportRapport, isLoading } = useRapportStore();
  const { barques, fetchBarques } = useBarqueStore();
  const [selectedPeriod, setSelectedPeriod] = useState('mensuel');
  const [dateRange, setDateRange] = useState({
    debut: new Date().toISOString().split('T')[0],
    fin: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchBarques();
    fetchRapport({
      type_periode: selectedPeriod as 'mensuel' | 'trimestriel' | 'annuel',
      date_debut: dateRange.debut,
      date_fin: dateRange.fin,
    });
  }, [fetchBarques, fetchRapport, selectedPeriod, dateRange]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Évolution des paiements',
      },
    },
  };

  const chartData = rapport?.graphData ? {
    labels: rapport.graphData.labels,
    datasets: [
      {
        label: 'Paiements',
        data: rapport.graphData.paiements,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'Retards',
        data: rapport.graphData.retards,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  } : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Rapports</h2>
          <p className="text-muted-foreground">
            Analysez les paiements et générez des rapports
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => exportRapport('pdf')}
            disabled={isLoading}
          >
            Exporter PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => exportRapport('excel')}
            disabled={isLoading}
          >
            Exporter Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
        <div>
          <label className="block text-sm font-medium mb-1">Période</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="mensuel">Mensuel</option>
            <option value="trimestriel">Trimestriel</option>
            <option value="annuel">Annuel</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date début</label>
          <input
            type="date"
            value={dateRange.debut}
            onChange={(e) => setDateRange(prev => ({ ...prev, debut: e.target.value }))}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date fin</label>
          <input
            type="date"
            value={dateRange.fin}
            onChange={(e) => setDateRange(prev => ({ ...prev, fin: e.target.value }))}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
      </div>

      {/* Summary Cards */}
      {rapport && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium">Total des paiements</h3>
            <p className="mt-2 text-3xl font-bold">{rapport.sommaire.total_paye} DH</p>
            <p className="text-sm text-gray-500">
              sur {rapport.sommaire.total_montant} DH
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium">Taux de recouvrement</h3>
            <p className="mt-2 text-3xl font-bold">
              {rapport.sommaire.taux_recouvrement}%
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium">Retards</h3>
            <p className="mt-2 text-3xl font-bold">{rapport.sommaire.nombre_retards}</p>
            <p className="text-sm text-gray-500">paiements en retard</p>
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData && (
        <div className="bg-white rounded-lg shadow p-6">
          <Line options={chartOptions} data={chartData} />
        </div>
      )}

      {/* Boats Table */}
      {rapport && (
        <div className="rounded-lg border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Barque
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Paiements
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Retards
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dernier Paiement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rapport.barques.map((barque) => (
                  <tr key={barque.barque_id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {barque.reference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {barque.total_paiements} DH
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {barque.nombre_retards}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {barque.dernier_paiement
                        ? new Date(barque.dernier_paiement).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          barque.statut_paiement === 'A_Jour'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {barque.statut_paiement === 'A_Jour' ? 'À jour' : 'En retard'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
