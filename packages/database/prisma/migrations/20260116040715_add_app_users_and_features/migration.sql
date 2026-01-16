-- CreateEnum
CREATE TYPE "TenantMemberRole" AS ENUM ('MEMBER', 'ADMIN');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "alerts" ADD COLUMN     "acceptedAt" TIMESTAMP(3),
ADD COLUMN     "acceptedBy" TEXT;

-- AlterTable
ALTER TABLE "devices" ADD COLUMN     "tenantId" TEXT;

-- CreateTable
CREATE TABLE "app_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "avatar" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_members" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "appUserId" TEXT NOT NULL,
    "role" "TenantMemberRole" NOT NULL DEFAULT 'MEMBER',
    "status" "MembershipStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "processedBy" TEXT,
    "processedByType" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_tokens" (
    "id" TEXT NOT NULL,
    "appUserId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "deviceInfo" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_assignments" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "appUserId" TEXT NOT NULL,
    "isAccepted" BOOLEAN NOT NULL DEFAULT false,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alert_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "app_users_email_key" ON "app_users"("email");

-- CreateIndex
CREATE INDEX "app_users_email_idx" ON "app_users"("email");

-- CreateIndex
CREATE INDEX "tenant_members_tenantId_idx" ON "tenant_members"("tenantId");

-- CreateIndex
CREATE INDEX "tenant_members_appUserId_idx" ON "tenant_members"("appUserId");

-- CreateIndex
CREATE INDEX "tenant_members_status_idx" ON "tenant_members"("status");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_members_tenantId_appUserId_key" ON "tenant_members"("tenantId", "appUserId");

-- CreateIndex
CREATE UNIQUE INDEX "push_tokens_token_key" ON "push_tokens"("token");

-- CreateIndex
CREATE INDEX "push_tokens_appUserId_idx" ON "push_tokens"("appUserId");

-- CreateIndex
CREATE INDEX "push_tokens_token_idx" ON "push_tokens"("token");

-- CreateIndex
CREATE INDEX "alert_assignments_alertId_idx" ON "alert_assignments"("alertId");

-- CreateIndex
CREATE INDEX "alert_assignments_appUserId_idx" ON "alert_assignments"("appUserId");

-- CreateIndex
CREATE INDEX "alert_assignments_isAccepted_idx" ON "alert_assignments"("isAccepted");

-- CreateIndex
CREATE UNIQUE INDEX "alert_assignments_alertId_appUserId_key" ON "alert_assignments"("alertId", "appUserId");

-- CreateIndex
CREATE INDEX "devices_tenantId_idx" ON "devices"("tenantId");

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_members" ADD CONSTRAINT "tenant_members_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_members" ADD CONSTRAINT "tenant_members_appUserId_fkey" FOREIGN KEY ("appUserId") REFERENCES "app_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_tokens" ADD CONSTRAINT "push_tokens_appUserId_fkey" FOREIGN KEY ("appUserId") REFERENCES "app_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_assignments" ADD CONSTRAINT "alert_assignments_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "alerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_assignments" ADD CONSTRAINT "alert_assignments_appUserId_fkey" FOREIGN KEY ("appUserId") REFERENCES "app_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
