/*
  Warnings:

  - Added the required column `name` to the `Gateways` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Gateways" ADD COLUMN     "name" TEXT NOT NULL;
