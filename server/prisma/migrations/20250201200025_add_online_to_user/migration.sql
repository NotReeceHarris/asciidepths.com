-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "encryptionKey" TEXT NOT NULL,
    "online" BOOLEAN NOT NULL DEFAULT false,
    "locationId" INTEGER NOT NULL,
    "posx" REAL NOT NULL DEFAULT 0,
    "posy" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_User" ("createdAt", "email", "encryptionKey", "id", "locationId", "password", "posx", "posy", "updatedAt", "username") SELECT "createdAt", "email", "encryptionKey", "id", "locationId", "password", "posx", "posy", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_password_key" ON "User"("password");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
