-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Palette" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "color1" TEXT NOT NULL,
    "color2" TEXT,
    "color3" TEXT,
    "description" TEXT,
    "imageLink" TEXT NOT NULL
);
INSERT INTO "new_Palette" ("color1", "color2", "color3", "id", "imageLink", "name") SELECT "color1", "color2", "color3", "id", "imageLink", "name" FROM "Palette";
DROP TABLE "Palette";
ALTER TABLE "new_Palette" RENAME TO "Palette";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
