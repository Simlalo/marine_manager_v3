-- CreateTable
CREATE TABLE "Gerant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "cine" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Barque" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "immatriculation" TEXT NOT NULL,
    "portAttache" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'inactif',
    "affiliation" TEXT,
    "gerantId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Barque_gerantId_fkey" FOREIGN KEY ("gerantId") REFERENCES "Gerant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Gerant_cine_key" ON "Gerant"("cine");

-- CreateIndex
CREATE UNIQUE INDEX "Gerant_email_key" ON "Gerant"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Barque_immatriculation_key" ON "Barque"("immatriculation");
