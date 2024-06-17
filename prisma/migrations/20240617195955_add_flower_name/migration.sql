/*
  Warnings:

  - Added the required column `name` to the `Flower` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Flower" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageLink" TEXT
);
INSERT INTO "new_Flower" ("description", "id", "imageLink") SELECT "description", "id", "imageLink" FROM "Flower";
DROP TABLE "Flower";
ALTER TABLE "new_Flower" RENAME TO "Flower";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
