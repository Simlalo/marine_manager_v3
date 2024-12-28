import { useEffect, useState, useCallback, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../../components/ui/data-table";
import { useBarqueStore } from "../../stores/barque.store";
import { BarqueEditDialog } from "../../components/barque/barque-edit-dialog";
import { BarqueBatchActions } from "../../components/barque/barque-batch-actions";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Checkbox } from "../../components/ui/checkbox";
import { Edit, Plus, Trash2, UserX, Upload } from "lucide-react";
import type { Barque, BarqueStatus } from "../../types/barque";
import { BarqueImport } from "../../components/barque/barque-import";
import { BarqueFilters } from "../../components/barque/barque-filters";
import type { BarqueFilters as BarqueFiltersType } from "../../types/barque";
import { BarqueSearch } from "../../components/barque/barque-search";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

export default function BarquesPage() {
  const { barques, fetchBarques, deleteBarque, pagination, isLoading } = useBarqueStore();
  const [selectedBarques, setSelectedBarques] = useState<Barque[]>([]);
  const [editingBarque, setEditingBarque] = useState<Barque | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [filters, setFilters] = useState<BarqueFiltersType>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const handleEdit = useCallback((barque: Barque) => {
    setEditingBarque(barque);
  }, []);

  const handleDelete = useCallback(async (barqueId: number) => {
    if (!deleteBarque) return;
    try {
      await deleteBarque(barqueId);
      setSelectedBarques(prev => prev.filter(b => b.id !== barqueId));
    } catch (error) {
      console.error("Erreur lors de la suppression de la barque:", error);
    }
  }, [deleteBarque]);

  const filteredBarques = useMemo(() => {
    if (!barques) return [];
    return barques.filter((barque) => {
      const matchesSearch = searchTerm === "" || [
        barque.nom,
        barque.immatriculation,
        barque.portAttache,
        barque.affiliation
      ].some(field => 
        field?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesPort = !filters.portAttache || barque.portAttache === filters.portAttache;
      const matchesStatus = !filters.statut || barque.statut === filters.statut;

      return matchesSearch && matchesPort && matchesStatus;
    });
  }, [barques, searchTerm, filters]);

  const columns = useMemo<ColumnDef<Barque>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(checked: boolean) => table.toggleAllPageRowsSelected(!!checked)}
            aria-label="Sélectionner toutes les barques de la page"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(checked: boolean) => row.toggleSelected(!!checked)}
            aria-label={`Sélectionner ${row.original.nom}`}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "nom",
        header: "Nom",
      },
      {
        accessorKey: "immatriculation",
        header: "Immatriculation",
      },
      {
        accessorKey: "portAttache",
        header: "Port d'attache",
      },
      {
        accessorKey: "affiliation",
        header: "Affiliation",
      },
      {
        accessorKey: "gerant",
        header: "Gérant",
        cell: ({ row }) => {
          const gerant = row.original.gerant;
          if (!gerant) {
            return (
              <div className="flex items-center text-muted-foreground">
                <UserX className="h-4 w-4 mr-2" />
                <span className="text-sm">Non assigné</span>
              </div>
            );
          }
          return (
            <Badge variant="outline" className="font-normal">
              {gerant.nom}
            </Badge>
          );
        },
      },
      {
        accessorKey: "statut",
        header: "Statut",
        cell: ({ row }) => {
          const statut = row.getValue("statut") as BarqueStatus;
          return (
            <div className="flex items-center">
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  statut === "actif"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {statut === "actif" ? "Actif" : "Non actif"}
              </span>
            </div>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const barque = row.original;
          return (
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleEdit(barque)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (confirm(`Êtes-vous sûr de vouloir supprimer ${barque.nom} ?`)) {
                    handleDelete(barque.id);
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [handleEdit, handleDelete]
  );

  useEffect(() => {
    fetchBarques(pageIndex + 1);
  }, [fetchBarques, pageIndex, pageSize, filters]);

  const handlePageChange = (newPage: number) => {
    setPageIndex(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    const newSizeValue = Number(newSize);
    setPageSize(newSizeValue);
    setPageIndex(0); // Reset to first page when changing page size
    fetchBarques(1); // Fetch first page with new size
  };

  return (
    <div className="container mx-auto py-10 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Barques</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowImportDialog(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Importer
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une barque
          </Button>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <BarqueSearch value={searchTerm} onChange={setSearchTerm} />
        <BarqueFilters barques={barques} onFilterChange={(newFilters) => {
          setFilters({
            ...filters,
            portAttache: newFilters.port,
            statut: newFilters.statut,
          });
          setPageIndex(0); // Reset to first page when filters change
        }} />
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            Total: {pagination.total || 0} barques
          </Badge>
          <span className="text-sm text-muted-foreground">Afficher</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              const newSize = Number(value);
              setPageSize(newSize);
              setPageIndex(0); // Reset to first page when page size changes
              fetchBarques(1); // Fetch first page with new size
            }}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">par page</span>
        </div>
      </div>

      {selectedBarques.length > 0 && (
        <BarqueBatchActions
          selectedBarques={selectedBarques}
          onClearSelection={() => setSelectedBarques([])}
        />
      )}

      <DataTable
        columns={columns}
        data={filteredBarques}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onRowSelectionChange={(rows) => {
          setSelectedBarques(rows);
          // Reset selection when changing page or filters
          if (rows.length === 0) {
            setSelectedBarques([]);
          }
        }}
      />

      <BarqueEditDialog
        barque={editingBarque}
        open={editingBarque !== null || showAddDialog}
        onOpenChange={(open) => {
          if (!open) {
            setEditingBarque(null);
            setShowAddDialog(false);
          }
        }}
      />

      <BarqueImport
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
      />
    </div>
  );
}
