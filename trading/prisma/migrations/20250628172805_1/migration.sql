-- CreateEnum
CREATE TYPE "KYCStatus" AS ENUM ('APPROVED', 'PENDING', 'REJECT');

-- CreateEnum
CREATE TYPE "KYCType" AS ENUM ('CNH', 'RG', 'PASSAPORTE');

-- AlterTable
ALTER TABLE "CreditCard" ALTER COLUMN "token" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "kyc" "KYCStatus";

-- CreateTable
CREATE TABLE "KYC" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "KYCStatus" NOT NULL,
    "type" "KYCType" NOT NULL,
    "paths" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KYC_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "KYC" ADD CONSTRAINT "KYC_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
