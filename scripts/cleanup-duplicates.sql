-- First, let's see how many duplicates we have
SELECT immatriculation, COUNT(*) as count, GROUP_CONCAT(id) as ids
FROM barques
GROUP BY immatriculation
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Delete all duplicates, keeping only the most recent entry for each immatriculation
DELETE FROM barques 
WHERE id NOT IN (
    SELECT MAX(id)
    FROM barques
    GROUP BY immatriculation
);

-- Create unique index to prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_barques_immatriculation 
ON barques(immatriculation);

-- Verify the results
SELECT COUNT(*) as total_barques FROM barques;
