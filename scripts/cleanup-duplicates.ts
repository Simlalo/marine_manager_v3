import prisma from '../server/lib/prisma';

async function cleanupDuplicates() {
  try {
    // First, let's find all duplicate matricules
    const duplicates = await prisma.$queryRaw`
      SELECT matricule, COUNT(*) as count
      FROM Barque
      GROUP BY matricule
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `;
    
    console.log('Found duplicates:', duplicates);

    // For each matricule, keep only the most recent entry
    const result = await prisma.$executeRaw`
      DELETE FROM Barque 
      WHERE id NOT IN (
        SELECT MAX(id)
        FROM Barque
        GROUP BY matricule
      )
    `;

    // Create a unique index to prevent future duplicates
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_barques_matricule 
      ON Barque(matricule)
    `;

    // Get final count
    const finalCount = await prisma.barque.count();
    
    console.log(`Cleanup complete. Deleted ${result} duplicate entries.`);
    console.log(`Total barques remaining: ${finalCount}`);
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicates();
