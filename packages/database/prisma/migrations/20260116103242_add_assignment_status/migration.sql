/*
  Warnings:

  - You are about to drop the column `acceptedAt` on the `alert_assignments` table. All the data in the column will be lost.
  - You are about to drop the column `isAccepted` on the `alert_assignments` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED');

-- DropIndex
DROP INDEX "alert_assignments_isAccepted_idx";

-- AlterTable
ALTER TABLE "alert_assignments" DROP COLUMN "acceptedAt",
DROP COLUMN "isAccepted",
ADD COLUMN     "respondedAt" TIMESTAMP(3),
ADD COLUMN     "status" "AssignmentStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "alert_assignments_status_idx" ON "alert_assignments"("status");
