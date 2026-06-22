/*
  Warnings:

  - Added the required column `code` to the `SellerUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SellerUser" ADD COLUMN     "code" VARCHAR(7) NOT NULL;
