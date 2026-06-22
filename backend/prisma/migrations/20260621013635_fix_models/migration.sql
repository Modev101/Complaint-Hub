/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "SellerUser" (
    "id" UUID NOT NULL,
    "storeName" VARCHAR(25) NOT NULL,
    "phoneNumber" VARCHAR(20) NOT NULL,
    "state" VARCHAR(50) NOT NULL,
    "county" VARCHAR(50) NOT NULL,
    "town" VARCHAR(50) NOT NULL,
    "platform" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "SellerUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Complaint" (
    "id" UUID NOT NULL,
    "issues" TEXT[],
    "products" TEXT[],
    "barcode" VARCHAR(10),
    "duration" VARCHAR(50) NOT NULL,
    "distributor" VARCHAR(50) NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "details" VARCHAR(500),
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsumerUser" (
    "id" UUID NOT NULL,
    "companyName" VARCHAR(50) NOT NULL,
    "companyProduct" VARCHAR(50) NOT NULL,
    "state" VARCHAR(50) NOT NULL,
    "county" VARCHAR(50) NOT NULL,
    "town" VARCHAR(50) NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "details" VARCHAR(500) NOT NULL,
    "name" VARCHAR(20) NOT NULL,
    "phoneNumber" VARCHAR(15) NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "ConsumerUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SellerUser_phoneNumber_key" ON "SellerUser"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ConsumerUser_companyProduct_key" ON "ConsumerUser"("companyProduct");

-- CreateIndex
CREATE UNIQUE INDEX "ConsumerUser_phoneNumber_key" ON "ConsumerUser"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ConsumerUser_email_key" ON "ConsumerUser"("email");

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "SellerUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
