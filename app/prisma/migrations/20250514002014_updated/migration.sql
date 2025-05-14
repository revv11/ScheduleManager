/*
  Warnings:

  - Added the required column `updated` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "updated" BOOLEAN NOT NULL;
