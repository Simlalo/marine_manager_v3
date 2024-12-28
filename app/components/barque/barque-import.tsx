import { useState, useRef } from 'react';
import ExcelJS from 'exceljs';
import { useBarqueStore } from '../../stores/barque.store';
import { Button } from '../ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { useToast } from '../ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { CreateBarqueDTO, BarqueStatus, ImportError, BARQUE_STATUSES, BarqueError } from '../../types/barque';

const IMMATRICULATION_REGEX = /^\d{2}\/\d{1}-\d{4}$/;
const PORT_REGEX = /^\d{1,2}\/\d{1}$/;

interface BarqueImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BarqueImport({ open, onOpenChange }: BarqueImportProps) {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { bulkImport, fetchBarques } = useBarqueStore();
  const { toast } = useToast();

  const initializeDefaultGerant = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/barques/init-default-gerant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to initialize default gerant: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Default gerant initialized:', result);
      return result;
    } catch (error) {
      console.error('Error initializing default gerant:', error);
      throw error;
    }
  };

  const handleImport = async (data: any[]) => {
    try {
      // Initialize default gerant first
      await initializeDefaultGerant();
      
      setIsLoading(true);
      
      // Map and validate the data
      const barques = data
        .map((row: any) => {
          const nom = row['Nom de barque']?.toString().trim();
          const rawImmatriculation = row['Immatriculation']?.toString().trim();
          const rawPort = row['Port d\'Attache']?.toString().trim();
          const affiliation = row['Affiliation']?.toString().trim() || '';

          if (!nom || !rawImmatriculation || !rawPort) {
            console.warn('Missing required fields:', { nom, rawImmatriculation, rawPort });
            return null;
          }

          // Format the data according to expected patterns
          const barqueData: CreateBarqueDTO = {
            nom,
            immatriculation: rawImmatriculation,
            portAttache: rawPort,
            affiliation,
            statut: 'actif' // Set default status to active
          };

          console.log('Created barque data:', barqueData);
          return barqueData;
        })
        .filter((barque): barque is CreateBarqueDTO => 
          barque !== null && 
          typeof barque.nom === 'string' &&
          typeof barque.immatriculation === 'string' &&
          typeof barque.portAttache === 'string' &&
          typeof barque.affiliation === 'string' &&
          typeof barque.statut === 'string'
        );

      if (barques.length === 0) {
        throw new Error("Aucune barque valide à importer. Vérifiez le format de votre fichier et assurez-vous que toutes les colonnes requises sont présentes.");
      }

      console.log('Importing barques:', barques);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/barques/bulk`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(barques)
        });

        console.log('Import response status:', response.status);
        const responseData = await response.json();
        console.log('Import response data:', responseData);

        if (!response.ok) {
          throw new Error(responseData.error || 'Une erreur est survenue lors de l\'import');
        }

        const result = responseData;
        
        if (result.success) {
          console.log('Import successful, refreshing data...');
          toast({
            title: "Import réussi",
            description: `${result.imported} barques importées, ${result.skipped} ignorées.`,
          });
          // Refresh the barques list after successful import
          await fetchBarques(1);
          onOpenChange(false);
        } else {
          // Format validation errors
          const errorMessages = result.errors?.map((error: any) => {
            const location = error.line ? ` (ligne ${error.line})` : '';
            const field = error.field ? ` - Champ: ${error.field}` : '';
            return `${error.message}${location}${field}`;
          }) || ['Une erreur inconnue est survenue'];

          toast({
            variant: "destructive",
            title: "Erreur de validation",
            description: (
              <div className="mt-2">
                <p className="font-semibold mb-2">Les erreurs suivantes ont été détectées:</p>
                <ul className="list-disc pl-4 space-y-1">
                  {errorMessages.map((msg: string, idx: number) => (
                    <li key={idx}>{msg}</li>
                  ))}
                </ul>
              </div>
            ),
          });
        }
      } catch (error: any) {
        console.error('Import error:', error);
        toast({
          variant: "destructive",
          title: "Erreur d'import",
          description: error.message || "Une erreur est survenue lors de l'import",
        });
      }
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        variant: "destructive",
        title: "Erreur d'import",
        description: error.message || "Une erreur est survenue lors de l'import",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await file.arrayBuffer());
      const worksheet = workbook.worksheets[0];

      if (!worksheet) {
        throw new Error("Aucune feuille trouvée dans le fichier Excel");
      }

      const headers = worksheet.getRow(1).values as string[];
      const columnIndexes: { [key: string]: number } = {};
      
      // Get the actual column indexes from the Excel file
      headers.forEach((header, index) => {
        if (typeof header === 'string') {
          columnIndexes[header.trim()] = index;
        }
      });

      // Verify required columns exist
      const requiredColumns = ['Affiliation', 'Immatriculation', 'Nom de barque', "Port d'Attache"];
      const missingColumns = requiredColumns.filter(col => 
        !Object.keys(columnIndexes).some(header => 
          header.toLowerCase() === col.toLowerCase()
        )
      );

      if (missingColumns.length > 0) {
        throw new Error(`Colonnes manquantes: ${missingColumns.join(', ')}`);
      }

      const rawData: any[] = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row

        // Find the actual column indexes for each field
        const affiliationCol = Object.entries(columnIndexes)
          .find(([header]) => header.toLowerCase() === 'affiliation')![1];
        const immatriculationCol = Object.entries(columnIndexes)
          .find(([header]) => header.toLowerCase() === 'immatriculation')![1];
        const nomCol = Object.entries(columnIndexes)
          .find(([header]) => header.toLowerCase().includes('nom'))![1];
        const portCol = Object.entries(columnIndexes)
          .find(([header]) => header.toLowerCase().includes('port'))![1];

        const rowData = {
          'Affiliation': row.getCell(affiliationCol).text.trim(),
          'Immatriculation': row.getCell(immatriculationCol).text.trim(),
          'Nom de barque': row.getCell(nomCol).text.trim(),
          "Port d'Attache": row.getCell(portCol).text.trim()
        };

        // Only add non-empty rows
        if (Object.values(rowData).some(value => value)) {
          rawData.push(rowData);
        }
      });

      if (rawData.length === 0) {
        throw new Error("Aucune donnée trouvée dans le fichier");
      }

      console.log('Données extraites:', rawData);
      await handleImport(rawData);
    } catch (error) {
      console.error('Erreur lors de la lecture du fichier:', error);
      toast({
        title: "Erreur de lecture",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la lecture du fichier",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importer des barques</DialogTitle>
          <DialogDescription>
            Sélectionnez un fichier Excel contenant la liste des barques à importer.
            Le fichier doit contenir les colonnes suivantes : Affiliation, Immatriculation, Nom de barque, Port d'Attache.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx,.xls"
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Import en cours...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Sélectionner un fichier
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
