-- CreateTable
CREATE TABLE "Flower" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL,
    "imageLink" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Palette" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "color1" TEXT NOT NULL,
    "color2" TEXT NOT NULL,
    "color3" TEXT NOT NULL,
    "imageLink" TEXT NOT NULL
);
