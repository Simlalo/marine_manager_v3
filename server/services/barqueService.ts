import { Barque, CreateBarqueDTO, UpdateBarqueDTO, ImportResult, ImportError } from '../../app/types/barque';
import prisma from '../lib/prisma';

class BarqueService {
  async getBarques(page: number = 1, limit: number = 10, search?: string) {
    try {
      console.log('Getting barques with params:', { page, limit, search });
      const where = search ? {
        OR: [
          { nom: { contains: search } },
          { immatriculation: { contains: search } },
          { portAttache: { contains: search } },
          { affiliation: { contains: search } }
        ]
      } : {};

      console.log('Query where clause:', where);

      const [total, barques] = await Promise.all([
        prisma.barque.count({ where }),
        prisma.barque.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          include: {
            gerant: true
          },
          orderBy: {
            updatedAt: 'desc'
          }
        })
      ]);

      console.log('Query results:', { total, barquesCount: barques.length, barques });
      return {
        items: barques.map(this.mapBarqueToResponse),
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error in getBarques:', error);
      throw new Error('Failed to fetch barques: ' + (error as Error).message);
    }
  }

  async createBarque(barqueData: CreateBarqueDTO) {
    try {
      const newBarque = await prisma.barque.create({
        data: {
          nom: barqueData.nom,
          immatriculation: barqueData.immatriculation,
          portAttache: barqueData.portAttache,
          statut: barqueData.statut || 'inactif',
          affiliation: barqueData.affiliation,
          gerantId: barqueData.gerantId || 1
        },
        include: {
          gerant: true
        }
      });
      
      return this.mapBarqueToResponse(newBarque);
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error(`Une barque avec l'immatriculation ${barqueData.immatriculation} existe déjà`);
      }
      throw error;
    }
  }

  async initializeDefaultGerant() {
    console.log('Initializing default gerant...');
    try {
      const defaultGerant = await prisma.gerant.upsert({
        where: {
          email: "admin@system.com"
        },
        update: {},
        create: {
          nom: "Admin",
          prenom: "System",
          cine: "DEFAULT001",
          telephone: "0000000000",
          email: "admin@system.com",
          password: "defaultpassword"
        }
      });
      console.log('Default gerant initialized:', defaultGerant.id);
      return defaultGerant;
    } catch (error) {
      console.error('Error initializing default gerant:', error);
      throw error;
    }
  }

  async getDefaultGerant() {
    const defaultGerant = await prisma.gerant.findFirstOrThrow({
      where: {
        email: "admin@system.com"
      }
    });
    return defaultGerant;
  }

  async bulkImport(barques: CreateBarqueDTO[]): Promise<ImportResult> {
    console.log(`Starting bulk import process for ${barques.length} barques...`);
    console.log('Barques to import:', JSON.stringify(barques, null, 2));
    
    try {
      // Get the existing default gerant (don't create here)
      const defaultGerant = await this.getDefaultGerant();
      console.log('Using default gerant:', defaultGerant.id);

      // Validate all barques first
      const validationErrors: ImportError[] = [];
      barques.forEach((barque, index) => {
        try {
          // Basic validation
          if (!barque.nom || !barque.immatriculation || !barque.portAttache) {
            validationErrors.push({
              message: 'Missing required fields',
              immatriculation: barque.immatriculation,
              line: index + 1
            });
            return;
          }

          // Format validation
          if (!/^\d{1,2}\/\d{1,2}(-\d{4})?$/.test(barque.immatriculation)) {
            validationErrors.push({
              message: 'Invalid immatriculation format (should be X/X, X/XX, XX/X, or XX/XX followed by optional -XXXX)',
              immatriculation: barque.immatriculation,
              line: index + 1,
              field: 'immatriculation'
            });
          }

          if (!/^\d{1,2}\/\d{1,2}$/.test(barque.portAttache)) {
            validationErrors.push({
              message: 'Invalid port format (should be X/X, X/XX, XX/X, or XX/XX)',
              immatriculation: barque.immatriculation,
              line: index + 1,
              field: 'portAttache'
            });
          }
        } catch (error) {
          console.error('Validation error for barque:', barque, error);
          validationErrors.push({
            message: `Validation error: ${(error as Error).message}`,
            immatriculation: barque.immatriculation,
            line: index + 1
          });
        }
      });

      if (validationErrors.length > 0) {
        console.log('Validation failed:', validationErrors);
        return {
          success: false,
          total: barques.length,
          imported: 0,
          skipped: 0,
          errors: validationErrors,
          error: 'Validation failed for some barques'
        };
      }

      // Check for duplicates
      console.log('Checking for existing barques...');
      const existingBarques = await prisma.barque.findMany({
        where: {
          immatriculation: {
            in: barques.map(b => b.immatriculation)
          }
        },
        select: {
          immatriculation: true
        }
      });

      const existingImmatriculations = new Set(existingBarques.map(b => b.immatriculation));
      const newBarques = barques.filter(b => !existingImmatriculations.has(b.immatriculation));
      const skipped = barques.filter(b => existingImmatriculations.has(b.immatriculation));

      console.log(`Found ${existingBarques.length} existing barques`);
      console.log(`Processing ${newBarques.length} new barques`);
      console.log(`Skipping ${skipped.length} duplicate barques`);

      const errors: ImportError[] = [];
      let imported = 0;

      if (newBarques.length > 0) {
        console.log('Starting database transaction...');
        
        // Process in chunks to avoid memory issues
        const chunkSize = 100;
        for (let i = 0; i < newBarques.length; i += chunkSize) {
          const chunk = newBarques.slice(i, i + chunkSize);
          console.log(`Processing chunk ${i/chunkSize + 1} of ${Math.ceil(newBarques.length/chunkSize)}`);
          
          await prisma.$transaction(async (tx) => {
            for (const barque of chunk) {
              try {
                await tx.barque.create({
                  data: {
                    nom: barque.nom.trim(),
                    immatriculation: barque.immatriculation.trim(),
                    portAttache: barque.portAttache.trim(),
                    statut: barque.statut || 'actif',
                    affiliation: barque.affiliation?.trim() || '',
                    gerantId: defaultGerant.id
                  }
                });
                imported++;
              } catch (error) {
                console.error(`Error creating barque ${barque.immatriculation}:`, error);
                errors.push({
                  message: `Failed to create barque: ${(error as Error).message}`,
                  immatriculation: barque.immatriculation
                });
              }
            }
          });
          
          console.log(`Completed chunk. Imported so far: ${imported}`);
        }
        
        console.log('Database import completed');
      }

      const result = {
        success: errors.length === 0,
        total: barques.length,
        imported,
        skipped: skipped.length,
        errors,
        warnings: []
      };

      console.log('Import result:', result);
      return result;

    } catch (error: any) {
      console.error('Error during bulk import:', error);
      return {
        success: false,
        total: barques.length,
        imported: 0,
        skipped: 0,
        errors: [{
          message: error.message || 'An unknown error occurred',
          code: error.code
        }],
        error: error.message
      };
    }
  }

  async updateBarque(id: number, barqueData: UpdateBarqueDTO) {
    try {
      const updatedBarque = await prisma.barque.update({
        where: { id },
        data: {
          nom: barqueData.nom,
          immatriculation: barqueData.immatriculation,
          portAttache: barqueData.portAttache,
          statut: barqueData.statut,
          affiliation: barqueData.affiliation,
          gerantId: barqueData.gerantId
        },
        include: {
          gerant: true
        }
      });

      return this.mapBarqueToResponse(updatedBarque);
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error(`Une barque avec l'immatriculation ${barqueData.immatriculation} existe déjà`);
      }
      if (error.code === 'P2025') {
        throw new Error('Barque non trouvée');
      }
      throw error;
    }
  }

  async deleteBarque(id: number) {
    try {
      await prisma.barque.delete({
        where: { id }
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new Error('Barque non trouvée');
      }
      throw error;
    }
  }

  private mapBarqueToResponse(barque: any): Barque {
    return {
      id: barque.id,
      nom: barque.nom,
      immatriculation: barque.immatriculation,
      portAttache: barque.portAttache,
      affiliation: barque.affiliation,
      statut: barque.statut || 'inactif',
      gerant: barque.gerant ? {
        id: barque.gerant.id,
        nom: barque.gerant.nom,
        prenom: barque.gerant.prenom,
        email: barque.gerant.email,
        telephone: barque.gerant.telephone,
        role: 'GERANT',
        createdAt: barque.gerant.createdAt.toISOString(),
        updatedAt: barque.gerant.updatedAt.toISOString()
      } : undefined,
      createdAt: barque.createdAt.toISOString(),
      updatedAt: barque.updatedAt.toISOString()
    };
  }
}

export const barqueService = new BarqueService();
