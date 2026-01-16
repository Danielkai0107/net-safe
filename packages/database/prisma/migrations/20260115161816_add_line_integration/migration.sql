-- AlterTable
ALTER TABLE "alerts" ADD COLUMN     "lineBroadcastCount" INTEGER,
ADD COLUMN     "lineMessageId" TEXT;

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "lineChannelAccessToken" TEXT,
ADD COLUMN     "lineChannelSecret" TEXT,
ADD COLUMN     "lineLiffId" TEXT;

-- CreateTable
CREATE TABLE "line_users" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "pictureUrl" TEXT,
    "statusMessage" TEXT,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "line_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "line_users_tenantId_idx" ON "line_users"("tenantId");

-- AddForeignKey
ALTER TABLE "line_users" ADD CONSTRAINT "line_users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
