/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `SellerUser` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SellerUser_code_key" ON "SellerUser"("code");
