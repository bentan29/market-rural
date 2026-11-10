/*
  Warnings:

  - Added the required column `country` to the `Listing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "country" TEXT NOT NULL;
