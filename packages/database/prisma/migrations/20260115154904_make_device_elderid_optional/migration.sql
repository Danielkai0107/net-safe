-- DropForeignKey
ALTER TABLE "devices" DROP CONSTRAINT "devices_elderId_fkey";

-- AlterTable
ALTER TABLE "devices" ALTER COLUMN "elderId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "devices_elderId_idx" ON "devices"("elderId");

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_elderId_fkey" FOREIGN KEY ("elderId") REFERENCES "elders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
